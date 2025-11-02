import { useState, useEffect, useCallback } from 'react';
import { BankDetailsConfig } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';

export interface UseIskconEmpowerPrayagrajReturn {
  value: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch ISKCON Empower Prayagraj Fund balance from Google Sheets
 */
export const useIskconEmpowerPrayagraj = (config: BankDetailsConfig | null): UseIskconEmpowerPrayagrajReturn => {
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!config || !config.apiKey || !config.spreadsheetId || !config.range) {
      setValue(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balance = await googleSheetsService.fetchSingleValue(config);
      setValue(balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ISKCON Empower Prayagraj balance';
      setError(errorMessage);
      console.error('Error fetching ISKCON Empower Prayagraj balance:', err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    value,
    loading,
    error,
    refresh
  };
};

