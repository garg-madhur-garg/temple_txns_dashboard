import { useState, useCallback, useEffect } from 'react';
import { IncomeRecord, UseIncomeDataReturn } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { GoogleSheetsConfig } from '../types';

export const useIncomeData = (): UseIncomeDataReturn => {
  const [data, setData] = useState<IncomeRecord[]>([]);
  const [filteredData, setFilteredData] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use environment variables (required)
      const config: GoogleSheetsConfig = {
        apiKey: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || '',
        spreadsheetId: process.env.REACT_APP_INCOME_SPREADSHEET_ID || '',
        range: process.env.REACT_APP_INCOME_SHEET_RANGE || '',
        refreshInterval: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '0', 10)
      };
      
      // Validate required environment variables
      if (!config.apiKey || !config.spreadsheetId || !config.range || config.refreshInterval <= 0) {
        throw new Error('Missing required environment variables: REACT_APP_GOOGLE_SHEETS_API_KEY, REACT_APP_INCOME_SPREADSHEET_ID, REACT_APP_INCOME_SHEET_RANGE, and REACT_APP_REFRESH_INTERVAL');
      }
      
      const newData = await googleSheetsService.fetchData(config);
      setData(newData);
      setFilteredData(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching income data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    filteredData,
    loading,
    error,
    refresh
  };
};
