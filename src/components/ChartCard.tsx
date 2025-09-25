import React from 'react';
import { ChartCardProps } from '../types';
import styles from './ChartCard.module.css';

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, onExport }) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <h3>{title}</h3>
        {onExport && (
          <button 
            className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
            onClick={onExport}
            aria-label={`Export ${title} data`}
          >
            📊 Export
          </button>
        )}
      </div>
      <div className={styles.cardBody}>
        {children}
      </div>
    </div>
  );
};