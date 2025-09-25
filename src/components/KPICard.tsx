import React from 'react';
import { KPICardProps } from '../types';
import styles from './KPICard.module.css';

export const KPICard: React.FC<KPICardProps> = ({ 
  icon, 
  value, 
  label, 
  secondary, 
  growth, 
  growthType = 'neutral' 
}) => {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.cardHeader}>
        <div className={styles.icon} aria-hidden="true">{icon}</div>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.label}>{label}</div>
        {secondary && <div className={styles.secondary}>{secondary}</div>}
        {growth && (
          <div className={`${styles.growth} ${styles[growthType]}`}>
            {growth}
          </div>
        )}
      </div>
    </div>
  );
};