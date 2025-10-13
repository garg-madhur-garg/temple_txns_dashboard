import React from 'react';
import { IncomeRecord, BankDetails } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { KPICard } from './KPICard';
import { manualKpiConfig, formatManualKpiCurrency } from '../config/manualKpiConfig';
import styles from './KPISection.module.css';

interface KPISectionProps {
  data: IncomeRecord[];
  bankDetails?: BankDetails[];
}

/**
 * Helper function to determine if an account should be excluded from total balance calculation
 */
const shouldExcludeAccountFromTotal = (bank: BankDetails): boolean => {
  const bankDetailsText = bank.bankDetails?.toLowerCase() || '';
  const mainPurpose = bank.mainPurpose?.toLowerCase() || '';
  const accountHolder = bank.accountHolderName?.toLowerCase() || '';
  
  // Check for exclusion criteria
  const hasIskconEmpower = bankDetailsText.includes('iskcon empower') || 
                          mainPurpose.includes('iskcon empower') ||
                          accountHolder.includes('iskcon empower');
  
  const hasSbi = bankDetailsText.includes('sbi') || 
                 bankDetailsText.includes('state bank');
  
  const hasBob = bankDetailsText.includes('bob') || 
                 bankDetailsText.includes('bank of baroda');
  
  const hasIdbi = bankDetailsText.includes('idbi');
  
  return hasIskconEmpower || hasSbi || hasBob || hasIdbi;
};

/**
 * Helper function to extract ISKCON Empower balance from bank details
 */
const getIskconEmpowerBalance = (bankDetails: BankDetails[]): number => {
  return bankDetails.reduce((total, bank) => {
    const bankDetailsText = bank.bankDetails?.toLowerCase() || '';
    const mainPurpose = bank.mainPurpose?.toLowerCase() || '';
    const accountHolder = bank.accountHolderName?.toLowerCase() || '';
    
    // Check if this is an ISKCON Empower account
    const isIskconEmpower = bankDetailsText.includes('iskcon empower') || 
                           mainPurpose.includes('iskcon empower') ||
                           accountHolder.includes('iskcon empower');
    
    if (isIskconEmpower) {
      const balance = bank.currentBalance;
      if (balance !== undefined && balance !== null && !isNaN(Number(balance))) {
        return total + Number(balance);
      }
    }
    
    return total;
  }, 0);
};

export const KPISection: React.FC<KPISectionProps> = ({ data, bankDetails = [] }) => {
  const kpis = dataProcessingService.calculateKPIs(data);
  
  // Calculate total current balance from bank accounts, excluding specific accounts
  const bankAccountsBalance = bankDetails.reduce((total, bank) => {
    const balance = bank.currentBalance;
    
    // Skip if balance is invalid
    if (balance === undefined || balance === null || isNaN(Number(balance))) {
      return total;
    }
    
    // Check if this account should be excluded from total balance calculation
    const shouldExclude = shouldExcludeAccountFromTotal(bank);
    if (shouldExclude) {
      return total; // Skip this account
    }
    
    return total + Number(balance);
  }, 0);
  
  // Calculate ISKCON Empower balances dynamically from bank details
  const totalIskconEmpowerBalance = getIskconEmpowerBalance(bankDetails);
  const iskconEmpowerOtherCentersBalance = totalIskconEmpowerBalance - manualKpiConfig.iskconEmpowerPrayagrajBalance;
  
  // Add ISKCON EMPOWER PRAYAGRAJ BALANCE to the total
  const totalCurrentBalance = bankAccountsBalance + manualKpiConfig.iskconEmpowerPrayagrajBalance;
  
  // Count accounts that are included in the total (excluding the filtered ones)
  const includedAccountsCount = bankDetails.filter(bank => !shouldExcludeAccountFromTotal(bank)).length;

  return (
    <section className={styles.kpiSection} aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
      
      {/* First Row - Main Financial Metrics */}
      <div className={styles.kpiGrid}>
        <KPICard
          icon="💰"
          value={dataProcessingService.formatCurrency(kpis.totalRevenue)}
          label="Total Income"
          // growth="--"
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
          secondary={`${includedAccountsCount} Bank Accounts (excluding ISKCON Empower, SBI, BoB, IDBI) + ISKCON Empower Prayagraj`}
        />
      </div>

      {/* Second Row - Performance Analytics */}
      <div className={styles.kpiGrid}>
        <KPICard
          icon="🏛️"
          value={dataProcessingService.formatCurrency(iskconEmpowerOtherCentersBalance)}
          label="ISKCON Empower Other Centers Fund"
          secondary="Available with us"
        />
        <KPICard
          icon="🕉️"
          value={formatManualKpiCurrency(manualKpiConfig.iskconEmpowerPrayagrajBalance)}
          label="ISKCON Empower Prayagraj Fund"
          // secondary="Special fund balance"
        />
        {/* <KPICard
          icon="🏛️"
          value="₹0.00"
          label="ISKCON Empower Other Centers Balance"
          secondary="Other centers fund balance"
        />
        <KPICard
          icon="🕉️"
          value="₹0.00"
          label="ISKCON Empower Prayagraj Balance"
          secondary="Special fund balance"
        /> */}
      </div>
    </section>
  );
};
