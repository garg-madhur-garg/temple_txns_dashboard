import React from 'react';
import { IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './AnalyticsSection.module.css';

interface AnalyticsSectionProps {
  data: IncomeRecord[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ data }) => {
  const analytics = dataProcessingService.calculateAnalytics(data);

  return (
    <section className={styles.analyticsSection} aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="sr-only">Performance Analytics</h2>
      <div className={styles.analyticsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Performance Insights</h3>
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
                <div className={styles.insightLabel}>Average Daily Revenue</div>
                <div className={styles.insightValue} aria-label="Average daily revenue amount">
                  {dataProcessingService.formatCurrency(analytics.avgDailyRevenue)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
