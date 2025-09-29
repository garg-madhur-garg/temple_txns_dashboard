import React, { useState } from 'react';
import { ConnectionState, GoogleSheetsConfig } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { useMessages } from '../hooks/useMessages';
import styles from './GoogleSheetsSetup.module.css';

interface GoogleSheetsSetupProps {
  onConnect: (config: GoogleSheetsConfig) => Promise<boolean>;
  onDisconnect: () => void;
  connectionState: ConnectionState;
}

export const GoogleSheetsSetup: React.FC<GoogleSheetsSetupProps> = ({
  onConnect,
  onDisconnect,
  connectionState
}) => {
  const [isSetupVisible, setIsSetupVisible] = useState(false);
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    apiKey: '',
    spreadsheetId: '',
    range: 'Sheet1!A:E',
    refreshInterval: 30000
  });
  const [isTesting, setIsTesting] = useState(false);
  const { addMessage } = useMessages();

  const handleConfigChange = (field: keyof GoogleSheetsConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    if (!config.apiKey.trim() || !config.spreadsheetId.trim()) {
      addMessage('Please enter both API key and Spreadsheet ID', 'error');
      return;
    }

    setIsTesting(true);
    try {
      const success = await onConnect(config);
      if (success) {
        addMessage('Successfully connected to Google Sheets!', 'success');
        setIsSetupVisible(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      addMessage(errorMessage, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    addMessage('Disconnected from Google Sheets', 'info');
  };

  return (
    <section className={styles.googleSheetsSetup} aria-labelledby="setup-heading">
      <div className={styles.container}>
        <div className={styles.setupCard}>
          <div className={styles.setupHeader}>
            <h3 id="setup-heading">📊 Google Sheets Integration Setup</h3>
            <button 
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
              onClick={() => setIsSetupVisible(!isSetupVisible)}
              aria-expanded={isSetupVisible}
              aria-controls="setup-content"
            >
              {isSetupVisible ? 'Hide Setup' : 'Show Setup'}
            </button>
          </div>
          
          <div 
            id="setup-content"
            className={`${styles.setupContent} ${!isSetupVisible ? styles.hidden : ''}`}
            aria-hidden={!isSetupVisible}
          >
            <div className={styles.setupGrid}>
              <div className={styles.setupSection}>
                <h4>1. API Configuration</h4>
                <div className={styles.formGroup}>
                  <label htmlFor="apiKey" className={styles.formLabel}>
                    Google Sheets API Key
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    className={styles.formControl}
                    placeholder="Enter your API key"
                    value={config.apiKey}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    disabled={connectionState.status === 'connected'}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="spreadsheetId" className={styles.formLabel}>
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    id="spreadsheetId"
                    className={styles.formControl}
                    placeholder="Enter spreadsheet ID from URL"
                    value={config.spreadsheetId}
                    onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                    disabled={connectionState.status === 'connected'}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="sheetRange" className={styles.formLabel}>
                    Sheet Range
                  </label>
                  <input
                    type="text"
                    id="sheetRange"
                    className={styles.formControl}
                    value={config.range}
                    placeholder="e.g., Sheet1!A:E"
                    onChange={(e) => handleConfigChange('range', e.target.value)}
                    disabled={connectionState.status === 'connected'}
                  />
                </div>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleTestConnection}
                  disabled={isTesting || connectionState.status === 'connected'}
                  aria-describedby="connection-status"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              
              <div className={styles.setupSection}>
                <h4>2. Required Sheet Format</h4>
                <div className={styles.templateTable}>
                  <table className={styles.dataTable} role="table">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Department</th>
                        <th scope="col">Cash_Income</th>
                        <th scope="col">Online_Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2025-09-24</td>
                        <td>Guest House</td>
                        <td>8000</td>
                        <td>12000</td>
                      </tr>
                      <tr>
                        <td>2025-09-24</td>
                        <td>Seva Office</td>
                        <td>5000</td>
                        <td>8000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className={styles.setupSection}>
                <h4>3. Setup Instructions</h4>
                <div className={styles.instructions}>
                  <ol>
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                    <li>Enable Google Sheets API for your project</li>
                    <li>Create an API key with Sheets API access</li>
                    <li>Make your Google Sheet public or share with API key</li>
                    <li>Copy your spreadsheet ID from the URL</li>
                    <li>Format your sheet with the columns shown above</li>
                    <li>Enter your credentials and test the connection</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.syncInfo}>
          <span className={styles.lastSync}>
            Last sync: <span id="lastSync">{connectionState.lastSync || 'Never'}</span>
          </span>
          <span className={styles.autoSync}>
            Auto-sync: <span id="autoSyncStatus">
              {connectionState.status === 'connected' ? 'Every 30 seconds (Active)' : 'Disabled'}
            </span>
          </span>
        </div>
        
        {connectionState.status === 'connected' && (
          <div className={styles.connectionActions}>
            <button 
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
