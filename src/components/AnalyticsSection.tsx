import React, { useState, useMemo } from 'react';
import { IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './AnalyticsSection.module.css';

interface AnalyticsSectionProps {
  data: IncomeRecord[];
}

type ViewPeriod = 'monthly' | 'yearly';

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ data }) => {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('monthly');

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
        default:
          return true;
      }
    });
  }, [data, viewPeriod]);

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
      
      default:
        return { start: '--', end: '--' };
    }
  }, [viewPeriod]);

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
      default:
        return 'Average Daily Revenue';
    }
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
                  {viewPeriod === 'monthly' ? 'Current Month:' : 'Current Year:'}
                </span>
                <span className={styles.dateRangeValue}>
                  {dateRange.start} to {dateRange.end}
                </span>
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
