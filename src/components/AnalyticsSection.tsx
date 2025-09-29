import React, { useState } from 'react';
import { IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './AnalyticsSection.module.css';

interface AnalyticsSectionProps {
  data: IncomeRecord[];
}

type ViewPeriod = 'daily' | 'monthly' | 'yearly';

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ data }) => {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('daily');
  const analytics = dataProcessingService.calculateAnalytics(data);

  const getAverageRevenue = () => {
    switch (viewPeriod) {
      case 'daily':
        return analytics.avgDailyRevenue;
      case 'monthly':
        return analytics.avgMonthlyRevenue;
      case 'yearly':
        return analytics.avgYearlyRevenue;
      default:
        return analytics.avgDailyRevenue;
    }
  };

  const getAverageLabel = () => {
    switch (viewPeriod) {
      case 'daily':
        return 'Average Daily Revenue';
      case 'monthly':
        return 'Average Monthly Revenue';
      case 'yearly':
        return 'Average Yearly Revenue';
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
            <h3>Performance Insights</h3>
            <div className={styles.viewSwitcher}>
              <button
                className={`${styles.viewBtn} ${viewPeriod === 'daily' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewPeriod('daily')}
                aria-label="Switch to daily view"
              >
                Daily
              </button>
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
