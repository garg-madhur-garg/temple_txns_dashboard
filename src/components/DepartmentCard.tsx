import React from 'react';
import { DepartmentCardProps } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './DepartmentCard.module.css';

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ name, totals }) => {
  const status = totals.hasData ? 'active' : 'inactive';
  const statusText = totals.hasData ? 'Active' : 'No Data';

  return (
    <div className={`${styles.departmentCard} ${styles[status]}`}>
      <div className={styles.cardHeader}>
        <h4 className={styles.departmentName}>{name}</h4>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {statusText}
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.incomeBreakdown}>
          <div className={styles.incomeItem}>
            <span className={styles.incomeLabel}>Cash</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.cash)}
            </span>
          </div>
          <div className={styles.incomeItem}>
            <span className={styles.incomeLabel}>Online</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.online)}
            </span>
          </div>
          <div className={`${styles.incomeItem} ${styles.total}`}>
            <span className={styles.incomeLabel}>Total Income</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};