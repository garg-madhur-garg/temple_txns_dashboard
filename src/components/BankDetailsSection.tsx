import React from 'react';
import { BankDetails } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { useMessages } from '../hooks/useMessages';
import styles from './BankDetailsSection.module.css';

interface BankDetailsSectionProps {
  data: BankDetails[];
}

export const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({ data }) => {
  const { addMessage } = useMessages();
  
  // Calculate total current balance from all bank accounts
  const totalCurrentBalance = data.reduce((total, bank) => {
    const balance = bank.currentBalance;
    if (balance !== undefined && balance !== null && !isNaN(Number(balance))) {
      return total + Number(balance);
    }
    return total;
  }, 0);

  // Get the most recent last updated date and time from the data
  const getLastUpdatedInfo = () => {
    if (data.length === 0) return { date: '', time: '' };
    
    // Debug logging removed for production
    
    // Find the most recent update by looking at all bank details
    const lastUpdatedEntries = data
      .filter(bank => bank.lastUpdatedDate && bank.lastUpdatedTime)
      .map(bank => {
        // Parse the date format "27/09/25" to a proper Date object
        const parseCustomDate = (dateStr: string, timeStr: string) => {
          // Handle format like "27/09/25" (DD/MM/YY)
          const [day, month, year] = dateStr.split('/');
          const [hours, minutes] = timeStr.split(':');
          
          // Convert 2-digit year to 4-digit year (assuming 20xx)
          const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          
          // Create date object (month is 0-indexed in JavaScript)
          return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        };
        
        const parsedDate = parseCustomDate(bank.lastUpdatedDate!, bank.lastUpdatedTime!);
        
        return {
          date: bank.lastUpdatedDate!,
          time: bank.lastUpdatedTime!,
          timestamp: parsedDate.getTime()
        };
      })
      .filter(entry => !isNaN(entry.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // Debug logging removed for production
    
    if (lastUpdatedEntries.length > 0) {
      return {
        date: lastUpdatedEntries[0].date,
        time: lastUpdatedEntries[0].time
      };
    }
    
    return { date: '', time: '' };
  };

  const lastUpdated = getLastUpdatedInfo();

  const handleCopyDetails = (bankDetails: BankDetails, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    
    // Add click effect immediately
    button.classList.add(styles.clicked);
    
    // Remove the effect after animation
    setTimeout(() => {
      button.classList.remove(styles.clicked);
    }, 300);
    
    const detailsText = [
      `Bank Name: ${bankDetails.bankName}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `IFSC Code: ${bankDetails.ifscCode}`,
      `Account Holder: ${bankDetails.accountHolderName}`,
      ``,
      `UPI ID: ${bankDetails.upiIds.join(', ')}`
    ].join('\n');

    navigator.clipboard.writeText(detailsText).then(() => {
      addMessage('Bank details copied to clipboard!', 'success');
    }).catch(() => {
      addMessage('Failed to copy bank details', 'error');
    });
  };

  return (
    <section className={styles.bankDetailsSection} aria-labelledby="bank-details-heading">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 id="bank-details-heading">Bank Details (From Google Sheets)</h3>
            <div className={styles.totalBalanceSummary}>
              <span className={styles.totalBalanceLabel}>Total Current Balance:</span>
              <span className={styles.totalBalanceValue}>
                {dataProcessingService.formatCurrency(totalCurrentBalance)}
              </span>
            </div>
          </div>
          <div className={styles.tableControls}>
            <div className={styles.lastUpdatedInfo}>
              <span className={styles.lastUpdatedLabel}>Last Updated:</span>
              <span className={styles.lastUpdatedValue}>
                {lastUpdated.date && lastUpdated.time 
                  ? `${lastUpdated.date} at ${lastUpdated.time}`
                  : 'No data available'
                }
              </span>
            </div>
            <span className={styles.recordCount} aria-live="polite">
              {data.length} bank{data.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.tableContainer}>
            {data.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden="true">🏦</div>
                <div className={styles.emptyTitle}>No Bank Details Available</div>
                <div className={styles.emptyDescription}>
                  Connect to Google Sheets to load your bank details
                </div>
              </div>
            ) : (
              <table className={styles.dataTable} role="table" aria-label="Bank details table">
                <thead>
                  <tr>
                    <th className={styles.headerCell} scope="col">Bank Details</th>
                    <th className={styles.headerCell} scope="col">IFSC Code</th>
                    <th className={styles.headerCell} scope="col">UPI IDs</th>
                    <th className={styles.headerCell} scope="col">Account Holder</th>
                    <th className={styles.headerCell} scope="col">Main Purpose</th>
                    <th className={styles.headerCell} scope="col">Current Balance</th>
                    <th className={styles.headerCell} scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((bankDetails, index) => (
                    <tr key={index} className={styles.dataRow}>
                      <td className={styles.dataCell}>
                        <div className={styles.bankDetailsCell}>
                          {bankDetails.bankDetails}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.ifscCell}>
                          {bankDetails.ifscCode}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.upiCell}>
                          {bankDetails.upiIds.length > 0 ? (
                            <div className={styles.upiList}>
                              {bankDetails.upiIds.map((upiId, upiIndex) => (
                                <span key={upiIndex} className={styles.upiItem}>
                                  {upiId}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className={styles.noData}>No UPI IDs</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.accountHolderCell}>
                          {bankDetails.accountHolderName}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.purposeCell}>
                          {bankDetails.mainPurpose}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.balanceCell}>
                          {(() => {
                            const balance = bankDetails.currentBalance;
                            if (balance !== undefined && balance !== null && !isNaN(Number(balance))) {
                              return dataProcessingService.formatCurrency(Number(balance));
                            }
                            return '₹0.00';
                          })()}
                        </div>
                      </td>
                      <td className={styles.dataCell}>
                        <div className={styles.actionsCell}>
                           <button
                             className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                             onClick={(event) => handleCopyDetails(bankDetails, event)}
                             aria-label={`Copy all details for ${bankDetails.bankDetails}`}
                             title="Copy all bank details"
                           >
                             📋 Copy All
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
