/**
 * DEPARTMENT INCOME DISTRIBUTION CHART - PIE CHART
 * ================================================
 * 
 * This React component displays department income distribution as a pie chart with
 * filtering capabilities for departments and date ranges.
 * 
 * Features:
 * - Department income pie chart with percentages in legends
 * - Department and date range filtering
 * - Interactive chart with hover effects
 * - Fixed size layout with proper spacing
 * - Export functionality
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React, { useEffect, useRef, useState } from 'react';
import { IncomeRecord, ALL_DEPARTMENTS } from '../../types';
import { dataProcessingService } from '../../services/dataProcessingService';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './PaymentMethodChart.module.css';

// Register Chart.js components
Chart.register(...registerables);
Chart.register(ChartDataLabels);

interface DepartmentIncomeDistributionChartProps {
  data: IncomeRecord[];
}

export const DepartmentIncomeDistributionChart: React.FC<DepartmentIncomeDistributionChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  /**
   * Get date range for different periods
   */
  const getDateRangeForPeriod = (period: string): { start: string; end: string } | null => {
    const now = new Date();
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (period) {
      case 'current-month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: formatDate(startOfMonth), end: formatDate(endOfMonth) };
      
      case 'current-year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return { start: formatDate(startOfYear), end: formatDate(endOfYear) };
      
      case 'last-month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: formatDate(lastMonthStart), end: formatDate(lastMonthEnd) };
      
      case 'last-year':
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        return { start: formatDate(lastYearStart), end: formatDate(lastYearEnd) };
      
      default:
        return null;
    }
  };

  /**
   * Process data based on selected filters
   */
  const processData = () => {
    let filteredData = [...data];

    // Apply date range filter
    if (dateRange) {
      filteredData = filteredData.filter(record => {
        // Parse record date using the same method as dataProcessingService
        const [month, day, year] = record.date.split('/').map(num => parseInt(num, 10));
        const recordDate = new Date(year, month - 1, day);
        
        // Parse filter dates
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        // Set time to start of day for accurate comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        recordDate.setHours(0, 0, 0, 0);
        
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Apply department filter - if no departments selected, show all
    if (selectedDepartments.length > 0) {
      // Define sub-sections for main departments
      const subSections: Record<string, string[]> = {
        'Gaushala': ['Gaushala', 'Gaushala Seva Office', 'Gaushala Hundi'],
        'Kitchen': ['Kitchen', 'Kitchen (Journey Prasad + Coupan)', 'Kitchen Seva Office', 'Kitchen Hundi'],
        'Hundi': ['Hundi', 'Temple Hundi', 'Jagannath Hundi', 'Yamuna Hundi'],
        'Other Donations': ['Other Donations', 'General', 'PWS']
      };
      
      // Expand selected departments to include their sub-sections
      const expandedDepartments = new Set<string>();
      selectedDepartments.forEach(dept => {
        expandedDepartments.add(dept);
        if (subSections[dept]) {
          subSections[dept].forEach(subDept => expandedDepartments.add(subDept));
        }
      });
      
      filteredData = filteredData.filter(record => 
        expandedDepartments.has(record.department)
      );
    }
    // If no departments selected, show all departments (no filtering)

    // Determine which departments to show based on filter
    const departmentsToShow = selectedDepartments.length > 0 ? selectedDepartments : ALL_DEPARTMENTS;
    
    // Calculate department totals using the same logic as Department Section
    const departmentTotals = departmentsToShow.map(dept => {
      // Use main department totals calculation for departments with sub-sections
      const isMainDepartment = ['Gaushala', 'Kitchen', 'Hundi', 'Other Donations'].includes(dept);
      const totals = isMainDepartment 
        ? dataProcessingService.calculateMainDepartmentTotals(filteredData, dept)
        : dataProcessingService.calculateDepartmentTotals(filteredData, dept);
      
      return {
        department: dept,
        total: Number(totals.total.toFixed(2)),
        cash: Number(totals.cash.toFixed(2)),
        online: Number(totals.online.toFixed(2)),
        hasData: totals.hasData
      };
    });

    // Sort by total income (highest first)
    departmentTotals.sort((a, b) => b.total - a.total);

    return {
      labels: departmentTotals.map(d => d.department),
      data: departmentTotals.map(d => d.total),
      cashData: departmentTotals.map(d => d.cash),
      onlineData: departmentTotals.map(d => d.online),
      departments: departmentTotals
    };
  };

  /**
   * Create the pie chart
   */
  const createChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartData = processData();
    
    // Always show the chart, even if all values are zero
    // This ensures all departments are visible

    // Generate colors for departments
    const colors = [
      '#1FB8CD', '#FFC185', '#A8E6CF', '#FFB6C1', 
      '#DDA0DD', '#98FB98', '#F0E68C', '#FFA07A'
    ];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: colors.slice(0, chartData.labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderWidth: 3,
          hoverBorderColor: '#333'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            maxHeight: 60,
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 10
              },
              boxWidth: 8,
              boxHeight: 8,
              textAlign: 'center',
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  const dataset = data.datasets[0];
                  const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                  
                  return data.labels.map((label: string, index: number) => {
                    const value = dataset.data[index];
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[index],
                      strokeStyle: dataset.borderColor,
                      lineWidth: dataset.borderWidth,
                      pointStyle: 'circle',
                      hidden: false,
                      index: index
                    };
                  });
                }
                return [];
              }
            }
          },
          datalabels: {
            display: false // Disable percentage labels on pie slices
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                
                // Show separate cash and online income for departments
                const department = chartData.departments[context.dataIndex];
                if (department) {
                  return [
                    `${context.label}: ${dataProcessingService.formatCurrency(context.parsed)} (${percentage}%)`,
                    `  Cash: ${dataProcessingService.formatCurrency(department.cash)}`,
                    `  Online: ${dataProcessingService.formatCurrency(department.online)}`
                  ];
                }
                
                return `${context.label}: ${dataProcessingService.formatCurrency(context.parsed)} (${percentage}%)`;
              }
            }
          }
        },
      }
    });
  };


  /**
   * Handle date range change
   */
  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
    setSelectedPeriod(''); // Clear period selection when manually changing dates
  };

  /**
   * Handle period selection
   */
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const dateRange = getDateRangeForPeriod(period);
    if (dateRange) {
      setDateRange(dateRange);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSelectedDepartments([]);
    setDateRange(null);
    setSelectedPeriod('');
  };

  // Create chart when data or filters change
  useEffect(() => {
    createChart();
  }, [data, selectedDepartments, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <h3>Department Income Distribution</h3>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm} ${styles.filterToggleBtn}`}
            onClick={() => {
              if (showFilters) {
                clearFilters();
              }
              setShowFilters(!showFilters);
            }}
            aria-label={showFilters ? "Clear filters and close panel" : "Open filter panel"}
          >
            {showFilters ? 'Clear Filters' : 'Filter'}
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.chartLayout}>
          {showFilters && (
            <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Departments:</label>
              <div className={styles.departmentCheckboxes}>
                {ALL_DEPARTMENTS.map(dept => (
                  <label key={dept} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDepartments(prev => [...prev, dept]);
                        } else {
                          setSelectedDepartments(prev => prev.filter(d => d !== dept));
                        }
                      }}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Quick Periods:</label>
              <div className={styles.periodButtons}>
                <button
                  className={`${styles.periodBtn} ${selectedPeriod === 'current-month' ? styles.periodBtnActive : ''}`}
                  onClick={() => handlePeriodChange('current-month')}
                >
                  This Month
                </button>
                <button
                  className={`${styles.periodBtn} ${selectedPeriod === 'last-month' ? styles.periodBtnActive : ''}`}
                  onClick={() => handlePeriodChange('last-month')}
                >
                  Last Month
                </button>
                <button
                  className={`${styles.periodBtn} ${selectedPeriod === 'current-year' ? styles.periodBtnActive : ''}`}
                  onClick={() => handlePeriodChange('current-year')}
                >
                  This Year
                </button>
                <button
                  className={`${styles.periodBtn} ${selectedPeriod === 'last-year' ? styles.periodBtnActive : ''}`}
                  onClick={() => handlePeriodChange('last-year')}
                >
                  Last Year
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Custom Date Range:</label>
              <div className={styles.dateRangeInputs}>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange(e.target.value, dateRange?.end || '')}
                  placeholder="Start Date"
                />
                <span className={styles.dateSeparator}>to</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange(dateRange?.start || '', e.target.value)}
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
          )}

          <div className={styles.chartContainer}>
            <canvas ref={chartRef} />
          </div>
        </div>
      </div>
    </div>
  );
};