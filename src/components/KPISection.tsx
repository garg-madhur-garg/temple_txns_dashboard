import React from 'react';
import { IncomeRecord, BankDetails } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { KPICard } from './KPICard';
import { formatManualKpiCurrency } from '../config/manualKpiConfig';
import { useIskconEmpowerPrayagraj } from '../hooks/useIskconEmpowerPrayagraj';
import { iskconEmpowerPrayagrajConfig } from '../config/iskconEmpowerPrayagrajConfig';
import styles from './KPISection.module.css';

interface KPISectionProps {
  data: IncomeRecord[];
  bankDetails?: BankDetails[];
}

const shouldExcludeAccountFromTotal = (bank: BankDetails): boolean => {
  const bankDetailsText = bank.bankDetails?.toLowerCase() || '';
  const mainPurpose = bank.mainPurpose?.toLowerCase() || '';
  const accountHolder = bank.accountHolderName?.toLowerCase() || '';
  
  const hasIskconEmpower = bankDetailsText.includes('iskcon empower') || 
                          mainPurpose.includes('iskcon empower') ||
                          accountHolder.includes('iskcon empower');
  const hasSbi = bankDetailsText.includes('sbi') || bankDetailsText.includes('state bank');
  const hasBob = bankDetailsText.includes('bob') || bankDetailsText.includes('bank of baroda');
  const hasIdbi = bankDetailsText.includes('idbi');
  
  return hasIskconEmpower || hasSbi || hasBob || hasIdbi;
};

export const KPISection: React.FC<KPISectionProps> = ({ data, bankDetails = [] }) => {
  const kpis = dataProcessingService.calculateKPIs(data);
  const { value: iskconEmpowerPrayagrajBalance } = useIskconEmpowerPrayagraj(iskconEmpowerPrayagrajConfig);
  
  const bankAccountsBalance = bankDetails.reduce((total, bank) => {
    const balance = bank.currentBalance;
    if (balance === undefined || balance === null || isNaN(Number(balance))) {
      return total;
    }
    if (shouldExcludeAccountFromTotal(bank)) {
      return total;
    }
    return total + Number(balance);
  }, 0);
  
  const iskconEmpowerOtherCentersBalance = 0;
  const totalCurrentBalance = bankAccountsBalance;
  const includedAccountsCount = bankDetails.filter(bank => !shouldExcludeAccountFromTotal(bank)).length;

  return (
    <section className={styles.kpiSection} aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
      
      <div className={styles.kpiGrid}>
        <KPICard
          icon="💰"
          value={dataProcessingService.formatCurrency(kpis.totalRevenue)}
          label="Total Income"
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
          label="Total Prayagraj Bank Balance"
          secondary={`${includedAccountsCount} Bank Accounts (excluding ISKCON Empower, SBI, BoB, IDBI)`}
        />
      </div>

      <div className={styles.kpiGrid}>
        <KPICard
          icon="🏛️"
          // value={dataProcessingService.formatCurrency(iskconEmpowerOtherCentersBalance)}
          value="Not_Available"
          label="ISKCON Empower Other Centers Fund"
          secondary="Available with us"
        />
        <KPICard
          icon="🕉️"
          value={formatManualKpiCurrency(iskconEmpowerPrayagrajBalance)}
          label="ISKCON Empower Fund"
          secondary="Prayagraj + SJM"
        />
      </div>
    </section>
  );
};
