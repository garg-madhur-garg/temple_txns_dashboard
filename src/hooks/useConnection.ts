import { useState, useCallback, useRef } from 'react';
import { GoogleSheetsConfig, ConnectionState, UseConnectionReturn } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { dataProcessingService } from '../services/dataProcessingService';

export const useConnection = (): UseConnectionReturn => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    message: 'Not Connected'
  });
  
  const autoSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef<GoogleSheetsConfig | null>(null);

  const connect = useCallback(async (config: GoogleSheetsConfig): Promise<boolean> => {
    setConnectionState({
      status: 'connecting',
      message: 'Testing connection...'
    });

    try {
      const isConnected = await googleSheetsService.testConnection(config);
      
      if (isConnected) {
        configRef.current = config;
        setConnectionState({
          status: 'connected',
          message: 'Connected to Google Sheets',
          lastSync: dataProcessingService.getCurrentTime()
        });
        
        // Start auto-sync
        startAutoSync();
        return true;
      } else {
        setConnectionState({
          status: 'disconnected',
          message: 'Connection failed'
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionState({
        status: 'disconnected',
        message: errorMessage
      });
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopAutoSync();
    configRef.current = null;
    setConnectionState({
      status: 'disconnected',
      message: 'Disconnected'
    });
  }, []);

  const sync = useCallback(async () => {
    if (!configRef.current) {
      throw new Error('Not connected to Google Sheets');
    }

    try {
      setConnectionState(prev => ({
        ...prev,
        status: 'connecting',
        message: 'Syncing...'
      }));

      // Fetch fresh data from Google Sheets
      const newData = await googleSheetsService.fetchData(configRef.current);
      console.log('Synced data:', newData);
      
      setConnectionState(prev => ({
        status: 'connected',
        message: 'Synced successfully',
        lastSync: dataProcessingService.getCurrentTime()
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setConnectionState({
        status: 'disconnected',
        message: errorMessage
      });
      throw error;
    }
  }, []);

  const startAutoSync = useCallback(() => {
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
    }

    if (configRef.current) {
      autoSyncIntervalRef.current = setInterval(async () => {
        try {
          await sync();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, configRef.current.refreshInterval);
    }
  }, [sync]);

  const stopAutoSync = useCallback(() => {
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopAutoSync();
  }, [stopAutoSync]);

  return {
    connectionState,
    connect,
    disconnect,
    sync
  };
};
