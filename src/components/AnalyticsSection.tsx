import React, { useState, useMemo, useEffect } from 'react';
import { IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './AnalyticsSection.module.css';

interface AnalyticsSectionProps {
  data: IncomeRecord[];
}

type ViewPeriod = 'monthly' | 'yearly' | 'custom';

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ data }) => {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Initialize date range inputs when switching to custom
  useEffect(() => {
    if (viewPeriod === 'custom') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Set default to current month if dates are not set
      setStartDate(prev => {
        if (!prev) {
          const startOfMonth = new Date(currentYear, currentMonth, 1);
          return formatDateForInput(startOfMonth);
        }
        return prev;
      });
      
      setEndDate(prev => {
        if (!prev) {
          const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
          return formatDateForInput(endOfMonth);
        }
        return prev;
      });
    }
  }, [viewPeriod]);

  // Get min and max dates from data for date input limits
  const dateLimits = useMemo(() => {
    if (data.length === 0) return null;

    const parseDateString = (dateStr: string): Date => {
      const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
      return new Date(year, month - 1, day);
    };

    const dates = data.map(record => parseDateString(record.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const formatDateForInput = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      min: formatDateForInput(minDate),
      max: formatDateForInput(maxDate)
    };
  }, [data]);

  /**
   * Filter data based on the selected view period
   */
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return data.filter(record => {
      const [month, day, year] = record.date.split('/').map(num => parseInt(num, 10));
      const recordDate = new Date(year, month - 1, day);

      switch (viewPeriod) {
        case 'monthly':
          return recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth;
        case 'yearly':
          return recordDate.getFullYear() === currentYear;
        case 'custom':
          if (startDate && endDate) {
            // Parse dates from YYYY-MM-DD format
            const [startYear, startMonth, startDay] = startDate.split('-').map(num => parseInt(num, 10));
            const [endYear, endMonth, endDay] = endDate.split('-').map(num => parseInt(num, 10));
            const startDateObj = new Date(startYear, startMonth - 1, startDay);
            const endDateObj = new Date(endYear, endMonth - 1, endDay);
            
            // Set time to start/end of day for proper comparison
            startDateObj.setHours(0, 0, 0, 0);
            endDateObj.setHours(23, 59, 59, 999);
            recordDate.setHours(0, 0, 0, 0);
            
            return recordDate >= startDateObj && recordDate <= endDateObj;
          }
          return false;
        default:
          return true;
      }
    });
  }, [data, viewPeriod, startDate, endDate]);

  const analytics = dataProcessingService.calculateAnalytics(filteredData);

  /**
   * Get the date range for the current view period based on selected period
   */
  const dateRange = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (viewPeriod) {
      case 'monthly':
        // Show current month's date range
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
        return {
          start: formatDate(startOfMonth),
          end: formatDate(endOfMonth)
        };
      
      case 'yearly':
        // Show current year's date range
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        return {
          start: formatDate(startOfYear),
          end: formatDate(endOfYear)
        };
      
      case 'custom':
        return {
          start: startDate || '--',
          end: endDate || '--'
        };
      
      default:
        return { start: '--', end: '--' };
    }
  }, [viewPeriod, startDate, endDate]);

  const getAverageRevenue = () => {
    if (filteredData.length === 0) return 0;

    const totalRevenue = filteredData.reduce((sum, record) => sum + record.cash + record.online, 0);
    
    switch (viewPeriod) {
      case 'monthly':
        // For monthly view, calculate average per day in the current month
        const currentMonthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        return totalRevenue / currentMonthDays;
      case 'yearly':
        // For yearly view, calculate average per day in the current year
        const currentYearDays = new Date(new Date().getFullYear(), 11, 31).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime();
        const daysInYear = Math.ceil(currentYearDays / (1000 * 60 * 60 * 24));
        return totalRevenue / daysInYear;
      case 'custom':
        if (startDate && endDate) {
          // Calculate days between start and end date
          const [startYear, startMonth, startDay] = startDate.split('-').map(num => parseInt(num, 10));
          const [endYear, endMonth, endDay] = endDate.split('-').map(num => parseInt(num, 10));
          const startDateObj = new Date(startYear, startMonth - 1, startDay);
          const endDateObj = new Date(endYear, endMonth - 1, endDay);
          const timeDiff = endDateObj.getTime() - startDateObj.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
          return daysDiff > 0 ? totalRevenue / daysDiff : totalRevenue;
        }
        return totalRevenue;
      default:
        return totalRevenue;
    }
  };

  const getAverageLabel = () => {
    switch (viewPeriod) {
      case 'monthly':
        return 'Average Daily Revenue (This Month)';
      case 'yearly':
        return 'Average Daily Revenue (This Year)';
      case 'custom':
        return 'Average Daily Revenue (Selected Range)';
      default:
        return 'Average Daily Revenue';
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Validate: start date shouldn't be after end date
    if (endDate && newStartDate > endDate) {
      // Auto-adjust end date if start is after end
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    
    // Validate: end date shouldn't be before start date
    if (startDate && newEndDate < startDate) {
      return; // Don't update if invalid
    }
    
    setEndDate(newEndDate);
  };

  return (
    <section className={styles.analyticsSection} aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="sr-only">Performance Analytics</h2>
      <div className={styles.analyticsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <h3>Performance Insights</h3>
              <div className={styles.dateRangeInline}>
                <span className={styles.dateRangeLabel}>
                  {viewPeriod === 'monthly' ? 'Current Month:' : viewPeriod === 'yearly' ? 'Current Year:' : 'Custom Range:'}
                </span>
                {viewPeriod === 'custom' ? (
                  <div className={styles.customDateInputs}>
                    <div className={styles.dateInputGroup}>
                      <label htmlFor="start-date" className={styles.dateLabel}>From:</label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        min={dateLimits?.min}
                        max={dateLimits?.max}
                        className={styles.dateInput}
                        aria-label="Start date"
                      />
                    </div>
                    <div className={styles.dateInputGroup}>
                      <label htmlFor="end-date" className={styles.dateLabel}>To:</label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate || dateLimits?.min}
                        max={dateLimits?.max}
                        className={styles.dateInput}
                        aria-label="End date"
                      />
                    </div>
                  </div>
                ) : (
                  <span className={styles.dateRangeValue}>
                    {dateRange.start} to {dateRange.end}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.viewSwitcher}>
              <button
                className={`${styles.viewBtn} ${viewPeriod === 'monthly' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewPeriod('monthly')}
                aria-label="Switch to monthly view"
              >
                Monthly
              </button>
              <button
                className={`${styles.viewBtn} ${viewPeriod === 'yearly' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewPeriod('yearly')}
                aria-label="Switch to yearly view"
              >
                Yearly
              </button>
              <button
                className={`${styles.viewBtn} ${viewPeriod === 'custom' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewPeriod('custom')}
                aria-label="Switch to custom date range view"
              >
                Custom
              </button>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.insightItems}>
              <div className={styles.insightItem}>
                <div className={styles.insightLabel}>Best Performing Day</div>
                <div className={styles.insightValue} aria-label="Best performing day">
                  {analytics.bestDay}
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightLabel}>Top Department</div>
                <div className={styles.insightValue} aria-label="Top performing department">
                  {analytics.topDepartment}
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightLabel}>Cash vs Online Ratio</div>
                <div className={styles.insightValue} aria-label="Cash to online payment ratio">
                  {analytics.cashOnlineRatio}
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightLabel}>{getAverageLabel()}</div>
                <div className={styles.insightValue} aria-label={`${getAverageLabel().toLowerCase()} amount`}>
                  {dataProcessingService.formatCurrency(getAverageRevenue())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
