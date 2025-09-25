import React from 'react';
import { IncomeRecord } from '../../types';
import { exportService } from '../../services/exportService';
import { useMessages } from '../../hooks/useMessages';
import styles from './PaymentMethodChart.module.css';

interface PaymentMethodChartProps {
  data: IncomeRecord[];
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const { addMessage } = useMessages();

  const handleExport = () => {
    try {
      const filename = exportService.generateFilename('payment_methods', 'csv');
      exportService.exportToCSV(data, filename);
      addMessage('Payment methods data exported successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      addMessage(errorMessage, 'error');
    }
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <h3>Payment Methods Distribution</h3>
        <button 
          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
          onClick={handleExport}
          disabled={data.length === 0}
          aria-label="Export payment methods data"
        >
          📊 Export
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartPlaceholder}>
          <div className={styles.placeholderIcon} aria-hidden="true">📊</div>
          <div className={styles.placeholderText}>
            Payment methods chart will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
};