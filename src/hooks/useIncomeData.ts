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
        console.warn('Missing required environment variables. Using sample data.');
        // Return sample data instead of throwing error
        const sampleData: IncomeRecord[] = [
          { date: '01/01/25', department: 'Temple', cash: 1000, online: 500 },
          { date: '02/01/25', department: 'Donation', cash: 800, online: 300 },
          { date: '03/01/25', department: 'Events', cash: 1200, online: 400 }
        ];
        setData(sampleData);
        setFilteredData(sampleData);
        return;
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
