import React from 'react';
import { ConnectionState } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { ThemeToggle } from './ThemeToggle';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  connectionState: ConnectionState;
  onSync: () => void;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  connectionState,
  onSync,
  onRefresh
}) => {
  const currentDate = dataProcessingService.getCurrentDate();

  return (
    <header className={styles.dashboardHeader} role="banner">
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.dashboardTitle}>
              Google Sheets Income Dashboard
            </h1>
            <div className={styles.dashboardDate} aria-live="polite">
              {currentDate}
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.connectionStatus} role="status" aria-live="polite">
              <span 
                className={`${styles.statusIndicator} ${styles[connectionState.status]}`}
                aria-label={`Connection status: ${connectionState.status}`}
              >
                ●
              </span>
              <span className={styles.statusText}>
                {connectionState.message}
              </span>
            </div>
            <ThemeToggle />
            <button 
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
              onClick={onSync}
              disabled={connectionState.status !== 'connected'}
              aria-label="Sync data with Google Sheets"
            >
              🔄 Sync Now
            </button>
            <button 
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
              onClick={onRefresh}
              aria-label="Refresh dashboard data"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
