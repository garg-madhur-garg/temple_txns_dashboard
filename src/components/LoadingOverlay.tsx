import React from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Syncing...' 
}) => {
  if (!visible) return null;

  return (
    <div className={styles.loadingOverlay} role="status" aria-live="polite" aria-label="Loading">
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner} aria-hidden="true"></div>
        <div className={styles.loadingText}>{message}</div>
      </div>
    </div>
  );
};
