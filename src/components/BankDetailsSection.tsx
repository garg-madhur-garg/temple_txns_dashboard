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

  const handleCopyDetails = (bankDetails: BankDetails) => {
    const detailsText = [
      `Bank Details: ${bankDetails.bankDetails}`,
      `IFSC Code: ${bankDetails.ifscCode}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `UPI IDs: ${bankDetails.upiIds.join(', ')}`,
      `Account Holder: ${bankDetails.accountHolderName}`
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
          <h3 id="bank-details-heading">Bank Details (From Google Sheets)</h3>
          <div className={styles.tableControls}>
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
                    <th className={styles.headerCell} scope="col">Account Number</th>
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
                        <div className={styles.accountNumberCell}>
                          {bankDetails.accountNumber}
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
                            console.log('Displaying balance:', balance, 'Type:', typeof balance);
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
                            onClick={() => handleCopyDetails(bankDetails)}
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
