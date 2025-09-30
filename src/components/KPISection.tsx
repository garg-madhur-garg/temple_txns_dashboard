import React from 'react';
import { IncomeRecord, BankDetails } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { KPICard } from './KPICard';
import styles from './KPISection.module.css';

interface KPISectionProps {
  data: IncomeRecord[];
  bankDetails?: BankDetails[];
}

export const KPISection: React.FC<KPISectionProps> = ({ data, bankDetails = [] }) => {
  const kpis = dataProcessingService.calculateKPIs(data);
  
  // Calculate total current balance from all bank accounts
  const totalCurrentBalance = bankDetails.reduce((total, bank) => {
    const balance = bank.currentBalance;
    if (balance !== undefined && balance !== null && !isNaN(Number(balance))) {
      return total + Number(balance);
    }
    return total;
  }, 0);

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
          icon="🏦"
          value={dataProcessingService.formatCurrency(totalCurrentBalance)}
          label="Total Bank Balance"
          secondary={`${bankDetails.length} Account${bankDetails.length !== 1 ? 's' : ''}`}
        />
      </div>
    </section>
  );
};
