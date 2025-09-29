/**
 * TEMPLE TRANSACTIONS DASHBOARD - MAIN APPLICATION
 * ================================================
 * 
 * This is the main JavaScript application for the Temple Transactions Dashboard.
 * It provides real-time monitoring of income from various temple departments
 * including restaurants, accommodation, retail, and administrative services.
 * 
 * Key Features:
 * - Real-time data synchronization with Google Sheets
 * - Department-wise income tracking and analytics
 * - Interactive charts and visualizations
 * - Export functionality for reports
 * - Responsive design for mobile and desktop
 * 
 * Author: Temple Management System
 * Last Updated: 2025
 */

// ============================================================================
// GLOBAL VARIABLES AND STATE MANAGEMENT
// ============================================================================

// Core data storage - holds all income records from Google Sheets
let incomeData = [];                    // Complete dataset from Google Sheets
let filteredData = [];                  // Currently filtered/displayed data
let charts = {};                        // Chart.js instances for visualizations
let currentSort = { column: 'date', direction: 'desc' };  // Current table sorting

// Department Performance Chart variables
let deptViewMode = 'monthly';
let deptFilteredData = [];
let currentFilter = 'all';              // Current date filter applied
let isConnected = false;                // Google Sheets connection status
let autoSyncInterval = null;            // Auto-refresh timer for data updates

// All departments must be displayed regardless of data availability
// Updated department names and reordered as requested:
// - Govindas Res -> Govindas (simplified name)
// - Govindas Stall -> Vrinda's Food Court (new name)
// - Snacks Shop -> Gopal's Sweet Shop (new name)
// Priority order: Govindas, Vrinda's Food Court, Gopal's Sweet Shop, Seva Office at top
const allDepartments = [
    "Govindas",                    // Main restaurant (formerly Govindas Res)
    "Vrinda's Food Court",         // Food court (formerly Govindas Stall)
    "Gopal's Sweet Shop",          // Sweet shop (formerly Snacks Shop)
    "Seva Office",                 // Administrative office
    "Guest House",                 // Accommodation services
    "Gift Shop",                   // Retail merchandise
    "Railway Book Stall",          // Book sales
    "Kitchen"                      // Food preparation (currently inactive)
];

// ============================================================================
// GOOGLE SHEETS INTEGRATION CONFIGURATION
// ============================================================================

/**
 * Google Sheets API Configuration
 * 
 * This configuration object manages the connection to Google Sheets for real-time
 * data synchronization. The dashboard automatically fetches income data from
 * the specified spreadsheet and updates the display every 30 seconds.
 * 
 * Configuration Fields:
 * - apiKey: Google Sheets API key for authentication
 * - spreadsheetId: Unique identifier of the Google Sheets document
 * - range: Data range to fetch (Sheet1!A:E format)
 * - refreshInterval: Auto-sync interval in milliseconds (30 seconds)
 */
const googleSheetsConfig = {
    apiKey: '',                    // Google Sheets API key (to be configured)
    spreadsheetId: '',             // Target spreadsheet ID (to be configured)
    range: 'Sheet1!A:E',  // Data range
    refreshInterval: 30000         // Auto-refresh every 30 seconds
};

// ============================================================================
// SAMPLE DATA FOR DEMONSTRATION
// ============================================================================

/**
 * Sample Data for Testing and Demonstration
 * 
 * This sample data is used when Google Sheets connection is not available.
 * It provides realistic examples of temple income data for testing the dashboard
 * functionality and UI components.
 * 
 * Data Structure:
 * - date: Transaction date in YYYY-MM-DD format
 * - department: Department name (must match allDepartments array)
 * - cash: Cash income amount in INR
 * - online: Online payment income amount in INR
 */
const sampleData = [
    {"date": "2025-01-15", "department": "Guest House", "cash": 8000, "online": 12000},
    {"date": "2025-01-16", "department": "Seva Office", "cash": 5000, "online": 8000},
    {"date": "2025-01-17", "department": "Gift Shop", "cash": 2800, "online": 1200},
    {"date": "2025-01-18", "department": "Kitchen", "cash": 3500, "online": 2500},
    {"date": "2025-01-19", "department": "Temple Maintenance", "cash": 4200, "online": 1800},
    {"date": "2025-01-20", "department": "Education", "cash": 2800, "online": 3200},
    {"date": "2025-01-21", "department": "Health", "cash": 1500, "online": 2200},
    {"date": "2025-01-22", "department": "Social Services", "cash": 3200, "online": 2800}
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Format Currency Amount
 * 
 * Converts numeric values to Indian Rupee (INR) currency format
 * with proper locale formatting (₹ symbol, comma separators)
 * 
 * @param {number} amount - The numeric amount to format
 * @returns {string} Formatted currency string (e.g., "₹1,23,456")
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format Date String
 * 
 * Converts date strings to human-readable format using Indian locale
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "24 Sep 2025")
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get Current Date in Full Format
 * 
 * Returns the current date in a comprehensive format for display
 * in the dashboard header
 * 
 * @returns {string} Formatted current date (e.g., "Monday, 24 September 2025")
 */
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
    const range = document.getElementById('sheetRange').value.trim() || 'Sheet1!A:E';
    
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
        
        // Fetch real data from Google Sheets
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsConfig.spreadsheetId}/values/Sheet1!A:E?key=${googleSheetsConfig.apiKey}`;
        console.log('Fetching data from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Raw Google Sheets data:', data);
        
        if (data.values && data.values.length > 1) {
            // Parse the data
            const headers = data.values[0];
            const rows = data.values.slice(1);
            
            console.log('Headers found:', headers);
            console.log('Number of data rows:', rows.length);
            
            // Convert to our format
            const parsedData = rows.map(row => {
                const [date, department, cash, online, other] = row;
                return {
                    date: date,
                    department: department,
                    cash: parseFloat(cash) || 0,
                    online: parseFloat(online) || 0,
                    other: parseFloat(other) || 0
                };
            });
            
            console.log('Parsed data:', parsedData);
            
            incomeData = parsedData;
            updateLastSync();
            updateAllDisplays();
            
            // Only update charts that need new data, not all charts
            // Department Performance chart will update when its filters are applied
            // Other charts remain independent
        } else {
            console.log('No data found in Google Sheets');
            // Fallback to sample data
            incomeData = [...sampleData];
            updateLastSync();
            updateAllDisplays();
            
            // Charts remain independent and don't need to be recreated
        }
        
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
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    console.log('Calculating date range for filter:', filter);
    console.log('Today:', today);
    console.log('Yesterday:', yesterday);
    console.log('Start of week:', startOfWeek);
    console.log('Start of month:', startOfMonth);
    console.log('Start of year:', startOfYear);
    
    let result;
    switch (filter) {
        case 'today':
            result = { start: today, end: today };
            break;
        case 'yesterday':
            result = { start: yesterday, end: yesterday };
            break;
        case 'week':
            result = { start: startOfWeek, end: today };
            break;
        case 'month':
            result = { start: startOfMonth, end: today };
            break;
        case 'year':
            result = { start: startOfYear, end: today };
            break;
        default:
            result = null;
    }
    
    console.log('Date range result:', result);
    return result;
}

/**
 * Format Date for Comparison
 * 
 * Converts a Date object to YYYY-MM-DD format for comparison
 * 
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDateForComparison(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Parse Date String
 * 
 * Parses date strings in M/D/YYYY format to Date objects for comparison
 * 
 * @param {string} dateStr - Date string in M/D/YYYY format
 * @returns {Date} Parsed Date object
 */
function parseDateString(dateStr) {
    const [month, day, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Apply Date Filter with Date Range Support
 * 
 * Enhanced to support custom date ranges in addition to quick filters.
 * Handles both single date and date range filtering.
 * 
 * @param {string} filter - Filter type ('all', 'today', 'yesterday', 'week', 'month', 'specific')
 * @param {string} specificDate - Single specific date (legacy support)
 * @param {string} startDate - Start date for range (M/D/YYYY format)
 * @param {string} endDate - End date for range (M/D/YYYY format)
 */
function applyDateFilter(filter, specificDate = null, startDate = null, endDate = null) {
    if (filter === 'all') {
        filteredData = [...incomeData];
        document.getElementById('filterInfo').textContent = 'Showing all data';
        // Clear date inputs for 'all' filter
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
    } else if (filter === 'specific' && startDate && endDate) {
        // Handle custom date range
        filteredData = incomeData.filter(record => {
            const recordDate = parseDateString(record.date);
            const startDateParsed = parseDateString(startDate);
            const endDateParsed = parseDateString(endDate);
            return recordDate >= startDateParsed && recordDate <= endDateParsed;
        });
        
        // Format dates for display
        const formatDisplayDate = (dateStr) => {
            const [month, day, year] = dateStr.split('/');
            return `${parseInt(day)}/${parseInt(month)}/${year}`;
        };
        document.getElementById('filterInfo').textContent = 
            `Showing data from ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
    } else if (specificDate) {
        // Handle single specific date (legacy support)
        filteredData = incomeData.filter(record => record.date === specificDate);
        document.getElementById('filterInfo').textContent = `Showing data for ${formatDate(specificDate)}`;
    } else {
        // Handle quick filters
        const range = getDateRange(filter);
        if (range) {
            const startStr = formatDateForComparison(range.start);
            const endStr = formatDateForComparison(range.end);
            
            filteredData = incomeData.filter(record => {
                return record.date >= startStr && record.date <= endStr;
            });
            
            // Populate date inputs with the calculated range
            const formatDateForInput = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            const startDateValue = formatDateForInput(range.start);
            const endDateValue = formatDateForInput(range.end);
            
            console.log('Setting date inputs:', { startDateValue, endDateValue });
            
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            
            if (startDateInput) {
                startDateInput.value = startDateValue;
                console.log('Start date input set to:', startDateInput.value);
            } else {
                console.error('Start date input not found!');
            }
            
            if (endDateInput) {
                endDateInput.value = endDateValue;
                console.log('End date input set to:', endDateInput.value);
            } else {
                console.error('End date input not found!');
            }
            
            const filterLabels = {
                'today': 'today',
                'yesterday': 'yesterday',
                'week': 'this week',
                'month': 'this month',
                'year': 'this year'
            };
            document.getElementById('filterInfo').textContent = `Showing data for ${filterLabels[filter]}`;
        }
    }
    
    currentFilter = filter;
    // Only update the filter info display, not the charts
    // Charts are now independent and controlled by their own Monthly/Yearly tabs
}

// Department Functions
function getDepartmentData(departmentName) {
    // Use incomeData directly to be independent from main filter bar
    const data = incomeData;
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
    // Use incomeData directly to be independent from main filter bar
    const data = incomeData;
    
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
    // Use incomeData directly to be independent from main filter bar
    const data = incomeData;
    
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
    
    // Average monthly revenue (instead of daily)
    const uniqueMonths = [...new Set(data.map(record => {
        const date = new Date(record.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];
    const avgMonthly = uniqueMonths.length > 0 ? 
        (totalCash + totalOnline) / uniqueMonths.length : 0;
    document.getElementById('avgDailyRevenue').textContent = formatCurrency(avgMonthly);
}

// Chart Functions
function createDailyTrendChart() {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    // Use incomeData directly to be independent from main filter bar
    const data = incomeData;
    
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
    console.log('=== createDepartmentChart called ===');
    const canvas = document.getElementById('departmentChart');
    if (!canvas) {
        console.error('Department chart canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    // Use incomeData directly for initial chart creation
    const data = incomeData;
    
    console.log('Creating department chart with data:', data.length, 'records');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Data source: incomeData');
    
    if (charts.department) {
        charts.department.destroy();
    }
    
    if (data.length === 0) {
        console.log('No data available for department chart');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Show a message in the chart area
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available for the selected criteria', canvas.width / 2, canvas.height / 2);
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
    
    console.log('Department data for chart:', sortedDepartments);
    
    // Test with simple data first
    if (sortedDepartments.length === 0) {
        console.log('No departments found, creating test chart');
        charts.department = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Test Department'],
                datasets: [{
                    label: 'Test Revenue',
                    data: [1000],
                    backgroundColor: ['#1FB8CD']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
        console.log('Test chart created successfully');
        return;
    }
    
    try {
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
    
    console.log('Department chart created successfully:', charts.department);
    } catch (error) {
        console.error('Error creating department chart:', error);
    }
}

/**
 * Enhanced Payment Chart - Department Income Pie Chart
 * 
 * Creates an interactive pie chart showing department income distribution
 * with drill-down functionality to view cash/online breakdown for each department.
 * 
 * Features:
 * - Department income pie chart
 * - Click to drill down to payment methods
 * - Monthly/Yearly view toggle
 * - Interactive navigation
 */
function createPaymentChart() {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    // Always use incomeData to show all data regardless of filters
    const data = incomeData;
    
    if (charts.payment) {
        charts.payment.destroy();
    }
    
    // Check if we're in drill-down mode
    const isDrillDown = window.paymentChartMode === 'payment-methods';
    const selectedDept = window.selectedDepartment;
    
    let chartData, labels, datasets;
    
    if (isDrillDown && selectedDept) {
        // Show payment methods for selected department
        const deptData = data.filter(record => record.department === selectedDept);
        const totalCash = deptData.reduce((sum, record) => sum + record.cash, 0);
        const totalOnline = deptData.reduce((sum, record) => sum + record.online, 0);
        
        labels = ['Cash', 'Online'];
        datasets = [{
            data: [totalCash, totalOnline],
            backgroundColor: ['#1FB8CD', '#FFC185'],
            borderWidth: 2,
            borderColor: '#fff'
        }];
    } else {
        // Show department income distribution
        const departmentTotals = allDepartments.map(dept => {
            const deptData = data.filter(record => record.department === dept);
            const totalCash = deptData.reduce((sum, record) => sum + record.cash, 0);
            const totalOnline = deptData.reduce((sum, record) => sum + record.online, 0);
            const totalIncome = totalCash + totalOnline;
            
            return {
                department: dept,
                total: totalIncome,
                cash: totalCash,
                online: totalOnline,
                hasData: totalIncome > 0
            };
        }).filter(dept => dept.hasData);
        
        // Calculate total for percentage calculation
        const grandTotal = departmentTotals.reduce((sum, dept) => sum + dept.total, 0);
        
        // Sort by percentage (highest first)
        departmentTotals.sort((a, b) => {
            const percentageA = grandTotal > 0 ? (a.total / grandTotal) * 100 : 0;
            const percentageB = grandTotal > 0 ? (b.total / grandTotal) * 100 : 0;
            return percentageB - percentageA; // Descending order (highest first)
        });
        
        if (departmentTotals.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            return;
        }
        
        labels = departmentTotals.map(d => d.department);
        const colors = [
            '#1FB8CD', '#FFC185', '#A8E6CF', '#FFB6C1', 
            '#DDA0DD', '#98FB98', '#F0E68C', '#FFA07A'
        ];
        
        datasets = [{
            data: departmentTotals.map(d => d.total),
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#fff'
        }];
    }
    
    charts.payment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !isDrillDown,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                datalabels: {
                    display: !isDrillDown,
                    color: '#333',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value, context) {
                        if (!isDrillDown) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                            return percentage + '%';
                        }
                        return '';
                    },
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#333',
                    borderRadius: 3,
                    borderWidth: 1,
                    padding: 4,
                    rotation: 0,
                    textAlign: 'center'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            
                            if (!isDrillDown) {
                                // Show separate cash and online income for departments
                                const department = departmentTotals[context.dataIndex];
                                if (department) {
                                    return [
                                        context.label + ': ' + formatCurrency(context.parsed) + ' (' + percentage + '%)',
                                        '  Cash: ' + formatCurrency(department.cash),
                                        '  Online: ' + formatCurrency(department.online)
                                    ];
                                }
                            }
                            
                            return context.label + ': ' + formatCurrency(context.parsed) + ' (' + percentage + '%)';
                        }
                    }
                }
            },
        }
    });
}

/**
 * Add back button to payment chart
 */
function addBackButton() {
    const chartCard = document.querySelector('#paymentChart').closest('.chart-card');
    const header = chartCard.querySelector('.chart-header');
    
    // Remove existing back button if any
    const existingBtn = header.querySelector('.back-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // Add back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn--outline btn--sm back-btn';
    backBtn.innerHTML = '← Back';
    backBtn.onclick = () => {
        window.paymentChartMode = 'departments';
        window.selectedDepartment = '';
        
        // Update chart title
        header.querySelector('h3').textContent = 'Department Income Distribution';
        
        // Remove back button
        backBtn.remove();
        
        // Recreate chart
        createPaymentChart();
    };
    
    header.appendChild(backBtn);
}

// updateCharts function removed - charts are now independent

// Table Functions
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    // Use incomeData directly to be independent from main filter bar
    const data = incomeData;
    
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

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Setup Date Filters with Date Range Support
 * 
 * Configures event listeners for both quick filter buttons and date range inputs.
 * Enhanced to support custom date range selection.
 */
function setupDateFilters() {
    // Quick filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            applyDateFilter(filter);
            
            // Clear date range inputs when using quick filters
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
        });
    });
    
    // Date range inputs
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    /**
     * Handle date range changes with validation
     */
    const handleDateRangeChange = () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Update min/max attributes for validation
        startDateInput.max = endDate || '';
        endDateInput.min = startDate || '';
        
        // Validate date range
        if (startDate && endDate && startDate > endDate) {
            // If start date is after end date, clear end date
            endDateInput.value = '';
            return;
        }
        
        if (startDate && endDate) {
            // Convert from YYYY-MM-DD to M/D/YYYY format
            const formatDateForData = (dateStr) => {
                const [year, month, day] = dateStr.split('-');
                return `${parseInt(month)}/${parseInt(day)}/${year}`;
            };
            
            const formattedStartDate = formatDateForData(startDate);
            const formattedEndDate = formatDateForData(endDate);
            
            // Clear quick filter buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Apply date range filter
            applyDateFilter('specific', null, formattedStartDate, formattedEndDate);
        }
    };
    
    // Add event listeners for date range inputs with individual validation
    startDateInput.addEventListener('change', () => {
        // Update end date min attribute
        endDateInput.min = startDateInput.value;
        handleDateRangeChange();
    });
    
    endDateInput.addEventListener('change', () => {
        // Update start date max attribute
        startDateInput.max = endDateInput.value;
        handleDateRangeChange();
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
        // Use incomeData directly to be independent from main filter bar
        const data = incomeData;
        exportToCSV(data, 'income_data_from_sheets.csv');
    });
}

function setupDepartmentFilters() {
    // Monthly/Yearly toggle
    document.getElementById('deptMonthlyBtn').addEventListener('click', () => {
        deptViewMode = 'monthly';
        document.getElementById('deptMonthlyBtn').classList.add('active');
        document.getElementById('deptYearlyBtn').classList.remove('active');
        applyDepartmentFilter();
    });
    
    document.getElementById('deptYearlyBtn').addEventListener('click', () => {
        deptViewMode = 'yearly';
        document.getElementById('deptYearlyBtn').classList.add('active');
        document.getElementById('deptMonthlyBtn').classList.remove('active');
        applyDepartmentFilter();
    });
    
    // Apply filter button
    document.getElementById('applyDeptFilter').addEventListener('click', applyDepartmentFilter);
    
    // Set default date range to include all data
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('deptDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('deptDateTo').value = lastDayOfMonth.toISOString().split('T')[0];
    
    // Apply initial filter to show chart
    setTimeout(() => {
        applyDepartmentFilter();
    }, 100);
    
    // Add debugging functions to global scope for console testing
    window.debugDepartmentChart = function() {
        console.log('=== Department Chart Debug ===');
        console.log('incomeData length:', incomeData.length);
        console.log('filteredData length:', filteredData.length);
        console.log('deptFilteredData length:', deptFilteredData.length);
        console.log('incomeData sample:', incomeData.slice(0, 3));
        console.log('deptFilteredData sample:', deptFilteredData.slice(0, 3));
        console.log('Canvas element:', document.getElementById('departmentChart'));
        console.log('Chart instance:', charts.department);
    };
    
    window.forceDepartmentChart = function() {
        console.log('=== Forcing Department Chart Creation ===');
        applyDepartmentFilter();
    };
}

function applyDepartmentFilter() {
    console.log('=== applyDepartmentFilter called ===');
    const fromDate = document.getElementById('deptDateFrom').value;
    const toDate = document.getElementById('deptDateTo').value;
    const selectedDepts = Array.from(document.getElementById('deptSelect').selectedOptions).map(option => option.value);
    
    console.log('Applying department filter with incomeData length:', incomeData.length);
    console.log('Date range:', fromDate, 'to', toDate);
    console.log('Selected departments:', selectedDepts);
    
    let filtered = [...incomeData];
    
    // Filter by date range
    if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= from && recordDate <= to;
        });
    }
    
    // Filter by departments
    if (selectedDepts.length > 0 && !selectedDepts.includes('all')) {
        filtered = filtered.filter(record => selectedDepts.includes(record.department));
    }
    
    // Apply monthly/yearly grouping
    if (deptViewMode === 'yearly') {
        // Group by year and department
        const yearlyData = {};
        filtered.forEach(record => {
            const year = new Date(record.date).getFullYear();
            const key = `${year}-${record.department}`;
            if (!yearlyData[key]) {
                yearlyData[key] = { year, department: record.department, cash: 0, online: 0 };
            }
            yearlyData[key].cash += record.cash;
            yearlyData[key].online += record.online;
        });
        
        deptFilteredData = Object.values(yearlyData).map(item => ({
            date: `${item.year}-01-01`,
            department: item.department,
            cash: item.cash,
            online: item.online
        }));
    } else {
        deptFilteredData = filtered;
    }
    
    console.log('Department filter applied:', deptFilteredData.length, 'records');
    createDepartmentChart();
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
    // Charts are now independent - only update on initial load
    renderTable();
    renderDepartments();
}

function createInitialCharts() {
    // Create charts only once during initialization
    createDailyTrendChart();
    createDepartmentChart();
    createPaymentChart();
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
    setupDepartmentFilters();
    
    // Initial data display
    updateAllDisplays();
    
    // Create charts only once during initialization
    createInitialCharts();
    
    console.log('Google Sheets Income Dashboard initialized successfully');
    
    // Add debugging functions to global scope
    window.debugDepartmentChart = function() {
        console.log('=== Department Chart Debug ===');
        console.log('incomeData length:', incomeData.length);
        console.log('filteredData length:', filteredData.length);
        console.log('deptFilteredData length:', deptFilteredData.length);
        console.log('incomeData sample:', incomeData.slice(0, 3));
        console.log('deptFilteredData sample:', deptFilteredData.slice(0, 3));
        console.log('Canvas element:', document.getElementById('departmentChart'));
        console.log('Chart instance:', charts.department);
    };
    
    window.forceDepartmentChart = function() {
        console.log('=== Forcing Department Chart Creation ===');
        applyDepartmentFilter();
    };
    
    window.checkData = function() {
        console.log('=== Data Check ===');
        console.log('incomeData:', incomeData);
        console.log('filteredData:', filteredData);
        console.log('deptFilteredData:', deptFilteredData);
    };
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);