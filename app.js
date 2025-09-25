// Global variables and configuration
let incomeData = [];
let filteredData = [];
let charts = {};
let currentSort = { column: 'date', direction: 'desc' };
let currentFilter = 'all';
let isConnected = false;
let autoSyncInterval = null;

// All departments must be displayed regardless of data availability
const allDepartments = [
    "Guest House",
    "Govindas Res", 
    "Govindas Stall",
    "Gift Shop",
    "Snacks Shop",
    "Seva Office",
    "Railway Book Stall",
    "Kitchen"
];

// Google Sheets configuration
const googleSheetsConfig = {
    apiKey: '',
    spreadsheetId: '',
    range: 'Sheet2!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F!B:F',
    refreshInterval: 30000 // 30 seconds
};

// Sample data for demonstration (will be replaced by Google Sheets data)
const sampleData = [
    {"date": "2025-09-24", "department": "Guest House", "cash": 8000, "online": 12000},
    {"date": "2025-09-24", "department": "Seva Office", "cash": 5000, "online": 8000},
    {"date": "2025-09-24", "department": "Gift Shop", "cash": 2800, "online": 1200}
];

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateLastSync() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastSync').textContent = timeString;
}

function showMessage(text, type = 'info') {
    // Create or update message element
    let message = document.getElementById('statusMessage');
    if (!message) {
        message = document.createElement('div');
        message.id = 'statusMessage';
        message.className = `message message--${type}`;
        
        // Insert at the top of the main container
        const main = document.querySelector('.dashboard-main .container');
        main.insertBefore(message, main.firstChild);
    } else {
        message.className = `message message--${type}`;
    }
    
    message.textContent = text;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (message && message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Google Sheets API Functions (Placeholder implementations)
async function testGoogleSheetsConnection() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    const range = document.getElementById('sheetRange').value.trim() || 'Sheet2!B:F!B:F';
    
    if (!apiKey || !spreadsheetId) {
        showMessage('Please enter both API key and Spreadsheet ID', 'error');
        return false;
    }
    
    updateConnectionStatus('connecting', 'Testing connection...');
    document.getElementById('testConnectionBtn').classList.add('btn--loading');
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would make an actual API call
        // const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        // const response = await fetch(url);
        
        // For demo purposes, simulate a successful connection
        googleSheetsConfig.apiKey = apiKey;
        googleSheetsConfig.spreadsheetId = spreadsheetId;
        googleSheetsConfig.range = range;
        
        updateConnectionStatus('connected', 'Connected to Google Sheets');
        isConnected = true;
        
        showMessage('Successfully connected to Google Sheets!', 'success');
        
        // Start auto-sync
        startAutoSync();
        
        // Load initial data
        await fetchDataFromGoogleSheets();
        
        return true;
        
    } catch (error) {
        console.error('Connection test failed:', error);
        updateConnectionStatus('disconnected', 'Connection failed');
        showMessage('Failed to connect to Google Sheets. Please check your credentials.', 'error');
        return false;
        
    } finally {
        document.getElementById('testConnectionBtn').classList.remove('btn--loading');
    }
}

async function fetchDataFromGoogleSheets() {
    if (!isConnected) {
        console.log('Not connected to Google Sheets');
        return;
    }
    
    try {
        showLoadingOverlay('Syncing with Google Sheets...');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, this would fetch from Google Sheets
        // const url = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsConfig.spreadsheetId}/values/${googleSheetsConfig.range}?key=${googleSheetsConfig.apiKey}`;
        // const response = await fetch(url);
        // const data = await response.json();
        
        // For demo purposes, use sample data with some randomization
        const simulatedData = [
            ...sampleData,
            {"date": "2025-09-23", "department": "Govindas Res", "cash": 3200, "online": 4800},
            {"date": "2025-09-23", "department": "Snacks Shop", "cash": 1800, "online": 0},
            {"date": "2025-09-22", "department": "Guest House", "cash": 12000, "online": 18000},
            {"date": "2025-09-22", "department": "Gift Shop", "cash": 2100, "online": 900}
        ];
        
        incomeData = simulatedData;
        updateLastSync();
        updateAllDisplays();
        
        showMessage('Data synchronized successfully!', 'success');
        
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        showMessage('Error syncing data from Google Sheets', 'error');
        updateConnectionStatus('disconnected', 'Sync failed');
        isConnected = false;
        stopAutoSync();
        
    } finally {
        hideLoadingOverlay();
    }
}

function startAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    autoSyncInterval = setInterval(async () => {
        if (isConnected) {
            console.log('Auto-syncing with Google Sheets...');
            await fetchDataFromGoogleSheets();
        }
    }, googleSheetsConfig.refreshInterval);
    
    document.getElementById('autoSyncStatus').textContent = 'Every 30 seconds (Active)';
}

function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
    document.getElementById('autoSyncStatus').textContent = 'Disabled';
}

function updateConnectionStatus(status, text) {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    indicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
}

function showLoadingOverlay(message) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay.querySelector('.loading-text');
    loadingText.textContent = message;
    overlay.classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Date filtering functions
function getDateRange(filter) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (filter) {
        case 'today':
            return { start: today, end: today };
        case 'yesterday':
            return { start: yesterday, end: yesterday };
        case 'week':
            return { start: startOfWeek, end: today };
        case 'month':
            return { start: startOfMonth, end: today };
        default:
            return null;
    }
}

function formatDateForComparison(date) {
    return date.toISOString().split('T')[0];
}

function applyDateFilter(filter, specificDate = null) {
    if (filter === 'all') {
        filteredData = [...incomeData];
        document.getElementById('filterInfo').textContent = 'Showing all data';
    } else if (specificDate) {
        filteredData = incomeData.filter(record => record.date === specificDate);
        document.getElementById('filterInfo').textContent = `Showing data for ${formatDate(specificDate)}`;
    } else {
        const range = getDateRange(filter);
        if (range) {
            const startStr = formatDateForComparison(range.start);
            const endStr = formatDateForComparison(range.end);
            
            filteredData = incomeData.filter(record => {
                return record.date >= startStr && record.date <= endStr;
            });
            
            const filterLabels = {
                'today': 'today',
                'yesterday': 'yesterday',
                'week': 'this week',
                'month': 'this month'
            };
            document.getElementById('filterInfo').textContent = `Showing data for ${filterLabels[filter]}`;
        }
    }
    
    currentFilter = filter;
    updateAllDisplays();
}

// Department Functions
function getDepartmentData(departmentName) {
    const data = filteredData.length > 0 ? filteredData : incomeData;
    return data.filter(record => record.department === departmentName);
}

function calculateDepartmentTotals(departmentName) {
    const deptData = getDepartmentData(departmentName);
    const totalCash = deptData.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = deptData.reduce((sum, record) => sum + record.online, 0);
    const totalIncome = totalCash + totalOnline;
    
    return {
        cash: totalCash,
        online: totalOnline,
        total: totalIncome,
        hasData: deptData.length > 0
    };
}

function renderDepartments() {
    const grid = document.getElementById('departmentsGrid');
    
    const departmentCards = allDepartments.map(deptName => {
        const totals = calculateDepartmentTotals(deptName);
        const hasData = totals.hasData;
        
        return `
            <div class="department-card ${!hasData ? 'no-data' : ''}">
                <div class="department-header">
                    <h4 class="department-name">${deptName}</h4>
                    <div class="department-status ${hasData ? 'active' : 'no-data'}">
                        ${hasData ? 'Active' : 'No Data'}
                    </div>
                </div>
                
                ${hasData ? `
                    <div class="department-metrics">
                        <div class="metric">
                            <div class="metric-value">${formatCurrency(totals.cash)}</div>
                            <div class="metric-label">Cash</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${formatCurrency(totals.online)}</div>
                            <div class="metric-label">Online</div>
                        </div>
                    </div>
                    <div class="department-total">
                        <div class="department-total-value">${formatCurrency(totals.total)}</div>
                        <div class="department-total-label">Total Income</div>
                    </div>
                ` : `
                    <div class="department-metrics">
                        <div class="metric">
                            <div class="metric-value">₹0</div>
                            <div class="metric-label">Cash</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">₹0</div>
                            <div class="metric-label">Online</div>
                        </div>
                    </div>
                    <div class="department-total">
                        <div class="department-total-value">₹0</div>
                        <div class="department-total-label">Total Income</div>
                    </div>
                    <div class="no-data-message">No data available from Google Sheets</div>
                `}
            </div>
        `;
    }).join('');
    
    grid.innerHTML = departmentCards;
}

// KPI Calculations
function calculateKPIs() {
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    const totalCash = data.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = data.reduce((sum, record) => sum + record.online, 0);
    const totalRevenue = totalCash + totalOnline;
    
    // Count active departments (departments with data)
    const activeDepartments = new Set(data.map(record => record.department)).size;
    
    const cashPercentage = totalRevenue > 0 ? ((totalCash / totalRevenue) * 100).toFixed(1) : 0;
    const onlinePercentage = totalRevenue > 0 ? ((totalOnline / totalRevenue) * 100).toFixed(1) : 0;
    
    return {
        totalRevenue,
        totalCash,
        totalOnline,
        cashPercentage,
        onlinePercentage,
        activeDepartments,
        totalDepartments: allDepartments.length
    };
}

function updateKPIs() {
    const kpis = calculateKPIs();
    
    document.getElementById('totalRevenue').textContent = formatCurrency(kpis.totalRevenue);
    document.getElementById('totalCash').textContent = formatCurrency(kpis.totalCash);
    document.getElementById('totalOnline').textContent = formatCurrency(kpis.totalOnline);
    document.getElementById('cashPercentage').textContent = `${kpis.cashPercentage}% of total`;
    document.getElementById('onlinePercentage').textContent = `${kpis.onlinePercentage}% of total`;
    document.getElementById('activeDepartments').textContent = kpis.activeDepartments;
    document.getElementById('totalDepartments').textContent = `${kpis.totalDepartments} Total`;
}

function updateAnalytics() {
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    if (data.length === 0) {
        document.getElementById('bestDay').textContent = '--';
        document.getElementById('topDepartment').textContent = '--';
        document.getElementById('cashOnlineRatio').textContent = '--';
        document.getElementById('avgDailyRevenue').textContent = '--';
        return;
    }
    
    // Daily revenue by date
    const dailyRevenue = {};
    data.forEach(record => {
        if (!dailyRevenue[record.date]) {
            dailyRevenue[record.date] = 0;
        }
        dailyRevenue[record.date] += record.cash + record.online;
    });
    
    // Best performing day
    const bestDay = Object.entries(dailyRevenue)
        .sort(([,a], [,b]) => b - a)[0];
    document.getElementById('bestDay').textContent = bestDay ? 
        `${formatDate(bestDay[0])} (${formatCurrency(bestDay[1])})` : '--';
    
    // Top department
    const deptRevenue = {};
    data.forEach(record => {
        if (!deptRevenue[record.department]) {
            deptRevenue[record.department] = 0;
        }
        deptRevenue[record.department] += record.cash + record.online;
    });
    
    const topDept = Object.entries(deptRevenue)
        .sort(([,a], [,b]) => b - a)[0];
    document.getElementById('topDepartment').textContent = topDept ? 
        `${topDept[0]} (${formatCurrency(topDept[1])})` : '--';
    
    // Cash vs Online ratio
    const totalCash = data.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = data.reduce((sum, record) => sum + record.online, 0);
    const ratio = totalOnline > 0 ? (totalCash / totalOnline).toFixed(2) : '--';
    document.getElementById('cashOnlineRatio').textContent = ratio !== '--' ? `${ratio}:1` : '--';
    
    // Average daily revenue
    const uniqueDates = [...new Set(data.map(record => record.date))];
    const avgDaily = uniqueDates.length > 0 ? 
        (totalCash + totalOnline) / uniqueDates.length : 0;
    document.getElementById('avgDailyRevenue').textContent = formatCurrency(avgDaily);
}

// Chart Functions
function createDailyTrendChart() {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    if (charts.dailyTrend) {
        charts.dailyTrend.destroy();
    }
    
    if (data.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    
    // Group data by date
    const dailyData = {};
    data.forEach(record => {
        if (!dailyData[record.date]) {
            dailyData[record.date] = { cash: 0, online: 0 };
        }
        dailyData[record.date].cash += record.cash;
        dailyData[record.date].online += record.online;
    });
    
    const sortedDates = Object.keys(dailyData).sort();
    const cashData = sortedDates.map(date => dailyData[date].cash);
    const onlineData = sortedDates.map(date => dailyData[date].online);
    
    charts.dailyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(formatDate),
            datasets: [{
                label: 'Cash Income',
                data: cashData,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                fill: false
            }, {
                label: 'Online Income',
                data: onlineData,
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createDepartmentChart() {
    const ctx = document.getElementById('departmentChart').getContext('2d');
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    if (charts.department) {
        charts.department.destroy();
    }
    
    if (data.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    
    // Group data by department (only departments with data)
    const departmentData = {};
    data.forEach(record => {
        if (!departmentData[record.department]) {
            departmentData[record.department] = 0;
        }
        departmentData[record.department] += record.cash + record.online;
    });
    
    const sortedDepartments = Object.entries(departmentData)
        .sort(([,a], [,b]) => b - a);
    
    charts.department = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDepartments.map(([dept]) => dept),
            datasets: [{
                label: 'Total Revenue',
                data: sortedDepartments.map(([,revenue]) => revenue),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: ' + formatCurrency(context.parsed.x);
                        }
                    }
                }
            }
        }
    });
}

function createPaymentChart() {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    if (charts.payment) {
        charts.payment.destroy();
    }
    
    const totalCash = data.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = data.reduce((sum, record) => sum + record.online, 0);
    
    if (totalCash === 0 && totalOnline === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    
    charts.payment = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'Online'],
            datasets: [{
                data: [totalCash, totalOnline],
                backgroundColor: ['#1FB8CD', '#FFC185'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + formatCurrency(context.parsed) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    createDailyTrendChart();
    createDepartmentChart();
    createPaymentChart();
}

// Table Functions
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const data = filteredData.length > 0 ? filteredData : incomeData;
    
    if (data.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        document.getElementById('recordCount').textContent = '0 records';
        return;
    }
    
    emptyState.classList.add('hidden');
    
    const sortedData = [...data].sort((a, b) => {
        let aVal = a[currentSort.column];
        let bVal = b[currentSort.column];
        
        if (currentSort.column === 'total') {
            aVal = a.cash + a.online;
            bVal = b.cash + b.online;
        }
        
        if (currentSort.column === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (currentSort.direction === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    tableBody.innerHTML = sortedData.map(record => {
        const total = record.cash + record.online;
        return `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${record.department}</td>
                <td class="currency">${formatCurrency(record.cash)}</td>
                <td class="currency">${formatCurrency(record.online)}</td>
                <td class="currency"><strong>${formatCurrency(total)}</strong></td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('recordCount').textContent = `${data.length} records`;
    
    // Update sort indicators
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    const currentHeader = document.querySelector(`[data-column="${currentSort.column}"]`);
    if (currentHeader) {
        currentHeader.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }
}

// Setup Functions
function setupDateFilters() {
    // Quick filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            applyDateFilter(filter);
        });
    });
    
    // Date picker
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', () => {
        if (dateFilter.value) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            applyDateFilter('specific', dateFilter.value);
        }
    });
}

function setupTableSorting() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', (e) => {
            e.preventDefault();
            const column = th.getAttribute('data-column');
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'desc';
            }
            renderTable();
        });
    });
}

function setupGoogleSheetsIntegration() {
    // Toggle setup visibility
    document.getElementById('toggleSetup').addEventListener('click', () => {
        const content = document.getElementById('setupContent');
        const button = document.getElementById('toggleSetup');
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            button.textContent = 'Hide Setup';
        } else {
            content.classList.add('hidden');
            button.textContent = 'Show Setup';
        }
    });
    
    // Test connection button
    document.getElementById('testConnectionBtn').addEventListener('click', testGoogleSheetsConnection);
    
    // Manual sync button
    document.getElementById('syncBtn').addEventListener('click', async () => {
        if (!isConnected) {
            showMessage('Please connect to Google Sheets first', 'error');
            return;
        }
        await fetchDataFromGoogleSheets();
    });
}

function setupModals() {
    // Share modal
    const shareBtn = document.getElementById('shareBtn');
    const shareModal = document.getElementById('shareModal');
    const closeShareModal = document.getElementById('closeShareModal');
    const shareModalBackdrop = document.getElementById('shareModalBackdrop');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    const dashboardUrl = document.getElementById('dashboardUrl');
    
    dashboardUrl.value = window.location.href;
    
    shareBtn.addEventListener('click', () => {
        shareModal.classList.remove('hidden');
    });
    
    closeShareModal.addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
    
    shareModalBackdrop.addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
    
    copyUrlBtn.addEventListener('click', () => {
        dashboardUrl.select();
        document.execCommand('copy');
        copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyUrlBtn.textContent = 'Copy';
        }, 2000);
    });
}

function setupExportFunctions() {
    document.getElementById('exportTableBtn').addEventListener('click', () => {
        const data = filteredData.length > 0 ? filteredData : incomeData;
        exportToCSV(data, 'income_data_from_sheets.csv');
    });
}

function exportToCSV(data, filename) {
    if (data.length === 0) {
        showMessage('No data to export', 'error');
        return;
    }
    
    const headers = ['Date', 'Department', 'Cash Income', 'Online Income', 'Total Income'];
    const csvContent = [
        headers.join(','),
        ...data.map(record => [
            record.date,
            record.department,
            record.cash,
            record.online,
            record.cash + record.online
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function updateAllDisplays() {
    updateKPIs();
    updateAnalytics();
    updateCharts();
    renderTable();
    renderDepartments();
}

// Initialize Application
function initApp() {
    console.log('Initializing Google Sheets Income Dashboard...');
    
    // Set current date
    document.getElementById('currentDate').textContent = getCurrentDate();
    
    // Initialize with sample data for demo
    incomeData = [...sampleData];
    filteredData = [...incomeData];
    
    // Set initial connection status
    updateConnectionStatus('disconnected', 'Not Connected');
    
    // Setup all components
    setupDateFilters();
    setupTableSorting();
    setupGoogleSheetsIntegration();
    setupModals();
    setupExportFunctions();
    
    // Initial data display
    updateAllDisplays();
    
    console.log('Google Sheets Income Dashboard initialized successfully');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);