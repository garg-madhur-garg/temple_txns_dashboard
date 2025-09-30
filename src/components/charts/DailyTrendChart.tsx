/**
 * DAILY TREND CHART - LINE CHART
 * ==============================
 * 
 * This React component displays daily income trends as a smooth line chart with
 * filtering capabilities for departments and date ranges.
 * 
 * Features:
 * - Daily income trend line chart with smooth curves
 * - Department and date range filtering
 * - Interactive chart with hover effects
 * - Fixed size layout with proper spacing
 * - Export functionality
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IncomeRecord, ALL_DEPARTMENTS } from '../../types';
import { dataProcessingService } from '../../services/dataProcessingService';
import { Chart, registerables } from 'chart.js';
import styles from './DailyTrendChart.module.css';

// Register Chart.js components
Chart.register(...registerables);

interface DailyTrendChartProps {
  data: IncomeRecord[];
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ data }) => {
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
  const processData = useCallback(() => {
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
      filteredData = filteredData.filter(record => 
        selectedDepartments.includes(record.department)
      );
    }
    // If no departments selected, show all departments (no filtering)

    // Group data by date
    const dailyData: Record<string, { cash: number; online: number; total: number }> = {};
    filteredData.forEach(record => {
      if (!dailyData[record.date]) {
        dailyData[record.date] = { cash: 0, online: 0, total: 0 };
      }
      dailyData[record.date].cash += record.cash;
      dailyData[record.date].online += record.online;
      dailyData[record.date].total += record.cash + record.online;
    });

    const sortedDates = Object.keys(dailyData).sort();
    
    return {
      labels: sortedDates.map(date => {
        // Format date as MM/DD for better readability
        const [month, day] = date.split('/');
        return `${month}/${day}`;
      }),
      cashData: sortedDates.map(date => Number(dailyData[date].cash.toFixed(2))),
      onlineData: sortedDates.map(date => Number(dailyData[date].online.toFixed(2))),
      totalData: sortedDates.map(date => Number(dailyData[date].total.toFixed(2))),
      rawDates: sortedDates
    };
  }, [data, selectedDepartments, dateRange]);

  /**
   * Create the line chart
   */
  const createChart = useCallback(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartData = processData();
    
    if (chartData.labels.length === 0) {
      // Show empty state
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
      return;
    }


    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Cash Income',
            data: chartData.cashData,
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#1FB8CD',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Online Income',
            data: chartData.onlineData,
            borderColor: '#FFC185',
            backgroundColor: 'rgba(255, 193, 133, 0.1)',
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#FFC185',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: 'bold'
              },
              boxWidth: 12,
              boxHeight: 12,
              textAlign: 'center'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${dataProcessingService.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#666',
              maxRotation: 0,
              minRotation: 0,
              maxTicksLimit: 10,
              padding: 8
            }
          },
          y: {
            beginAtZero: true,
            display: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#666',
              maxTicksLimit: 8,
              callback: function(value: any) {
                const numValue = Number(value.toFixed(2));
                if (numValue >= 100000) {
                  return `₹${(numValue / 100000).toFixed(1)}L`;
                } else if (numValue >= 1000) {
                  return `₹${(numValue / 1000).toFixed(1)}K`;
                } else {
                  return `₹${numValue.toFixed(0)}`;
                }
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }, [processData]);

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
  }, [createChart]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <h3>Daily Income Trend</h3>
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
