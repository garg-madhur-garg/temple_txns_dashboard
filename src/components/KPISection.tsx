import React from 'react';
import { IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { KPICard } from './KPICard';
import styles from './KPISection.module.css';

interface KPISectionProps {
  data: IncomeRecord[];
}

export const KPISection: React.FC<KPISectionProps> = ({ data }) => {
  const kpis = dataProcessingService.calculateKPIs(data);

  return (
    <section className={styles.kpiSection} aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
      <div className={styles.kpiGrid}>
        <KPICard
          icon="💰"
          value={dataProcessingService.formatCurrency(kpis.totalRevenue)}
          label="Total Revenue"
          growth="--"
        />
        <KPICard
          icon="💵"
          value={dataProcessingService.formatCurrency(kpis.totalCash)}
          label="Cash Income"
          secondary={`${kpis.cashPercentage}% of total`}
        />
        <KPICard
          icon="🌐"
          value={dataProcessingService.formatCurrency(kpis.totalOnline)}
          label="Online Income"
          secondary={`${kpis.onlinePercentage}% of total`}
        />
        <KPICard
          icon="📊"
          value={kpis.activeDepartments.toString()}
          label="Active Departments"
          secondary={`${kpis.totalDepartments} Total`}
        />
      </div>
    </section>
  );
};
