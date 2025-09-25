import React, { useState } from 'react';
import styles from './ShareModal.module.css';

export const ShareModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dashboardUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(dashboardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div className={`${styles.modal} ${!isOpen ? styles.hidden : ''}`} role="dialog" aria-labelledby="share-modal-title" aria-modal="true">
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}></div>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3 id="share-modal-title">Share Dashboard</h3>
            <button 
              className={styles.modalClose}
              onClick={handleClose}
              aria-label="Close share modal"
            >
              ×
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.shareInfo}>
              <div className={styles.shareSection}>
                <label className={styles.formLabel}>Dashboard URL:</label>
                <div className={styles.urlCopyGroup}>
                  <input 
                    type="text" 
                    className={styles.formControl} 
                    value={dashboardUrl}
                    readOnly
                    aria-label="Dashboard URL"
                  />
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleCopyUrl}
                    aria-label="Copy dashboard URL"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className={styles.shareSection}>
                <h4>Google Sheets Integration:</h4>
                <div className={styles.accessInfo}>
                  <div className={styles.accessItem}>
                    <strong>Read-Only Access:</strong> Dashboard fetches data from Google Sheets automatically
                  </div>
                  <div className={styles.accessItem}>
                    <strong>Data Entry:</strong> All data modifications must be done directly in Google Sheets
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
