import { useState, useCallback, useEffect } from 'react';
import { IncomeRecord, UseIncomeDataReturn } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { GoogleSheetsConfig } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';

export const useIncomeData = (): UseIncomeDataReturn => {
  const [data, setData] = useState<IncomeRecord[]>([]);
  const [filteredData, setFilteredData] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the real Google Sheets configuration
      const config: GoogleSheetsConfig = {
        apiKey: 'AIzaSyCndZeCj6CHI3c4aZ0NhllTEbBev6Mg3mg',
        spreadsheetId: '1sIKmerb68mazwhs4DUE3XQK9vvsKxUi7tBD6DPSrrcI',
        range: 'Sheet2!B:F',
        refreshInterval: 30000
      };
      
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
