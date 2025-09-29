/**
 * USE FILTERS HOOK - ENHANCED WITH DATE RANGE SUPPORT
 * ==================================================
 * 
 * Custom React hook for managing date filtering with support for date ranges.
 * Provides state management and filtering logic for the dashboard.
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import { useState, useMemo } from 'react';
import { IncomeRecord, DateFilter, UseFiltersReturn } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';

/**
 * Enhanced UseFiltersReturn interface with date range support
 */
interface UseFiltersReturnEnhanced extends UseFiltersReturn {
  setDateRange: (startDate: string, endDate: string) => void;
  startDate: string;
  endDate: string;
}

/**
 * Custom hook for managing date filters with date range support
 * 
 * @param {IncomeRecord[]} data - Array of income records to filter
 * @returns {UseFiltersReturnEnhanced} Filter state and methods
 */
export const useFilters = (data: IncomeRecord[]): UseFiltersReturnEnhanced => {
  const [currentFilter, setCurrentFilter] = useState<DateFilter>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  /**
   * Set filter type and optional specific date
   * 
   * @param {DateFilter} filter - Filter type to apply
   * @param {string} date - Optional specific date
   */
  const setFilter = (filter: DateFilter, date?: string) => {
    setCurrentFilter(filter);
    if (date) {
      setSpecificDate(date);
    } else {
      setSpecificDate('');
    }
    // Clear date range when using quick filters
    if (filter !== 'specific') {
      setStartDate('');
      setEndDate('');
    }
  };

  /**
   * Set custom date range
   * 
   * @param {string} start - Start date in M/D/YYYY format
   * @param {string} end - End date in M/D/YYYY format
   */
  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentFilter('specific');
    setSpecificDate(''); // Clear specific date when using range
  };

  const filteredData = useMemo(() => {
    return dataProcessingService.filterDataByDate(data, currentFilter, specificDate, startDate, endDate);
  }, [data, currentFilter, specificDate, startDate, endDate]);

  return {
    currentFilter,
    setFilter,
    setDateRange,
    startDate,
    endDate,
    filteredData
  };
};
