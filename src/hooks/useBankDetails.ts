import { useState, useEffect, useCallback } from 'react';
import { BankDetails, BankDetailsConfig } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { useMessages } from './useMessages';

export interface UseBankDetailsReturn {
  data: BankDetails[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  testConnection: (config: BankDetailsConfig) => Promise<boolean>;
}

export const useBankDetails = (config: BankDetailsConfig | null): UseBankDetailsReturn => {
  const [data, setData] = useState<BankDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage } = useMessages();

  const fetchData = useCallback(async () => {
    if (!config) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bankDetails = await googleSheetsService.fetchBankDetails(config);
      setData(bankDetails);
      addMessage(`Loaded ${bankDetails.length} bank details`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bank details';
      setError(errorMessage);
      addMessage(`Error loading bank details: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [config, addMessage]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const testConnection = useCallback(async (testConfig: BankDetailsConfig): Promise<boolean> => {
    try {
      // Test with a small range to verify connection
      const testConfigWithRange = { ...testConfig, range: `${testConfig.range.split('!')[0]}!A1:F1` };
      await googleSheetsService.fetchBankDetails(testConfigWithRange);
      return true;
    } catch (err) {
      console.error('Bank details connection test failed:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    testConnection
  };
};
