import { useState, useMemo } from 'react';
import { IncomeRecord, DateFilter, UseFiltersReturn } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';

export const useFilters = (data: IncomeRecord[]): UseFiltersReturn => {
  const [currentFilter, setCurrentFilter] = useState<DateFilter>('all');
  const [specificDate, setSpecificDate] = useState<string>('');

  const setFilter = (filter: DateFilter, date?: string) => {
    setCurrentFilter(filter);
    if (date) {
      setSpecificDate(date);
    } else {
      setSpecificDate('');
    }
  };

  const filteredData = useMemo(() => {
    return dataProcessingService.filterDataByDate(data, currentFilter, specificDate);
  }, [data, currentFilter, specificDate]);

  return {
    currentFilter,
    setFilter,
    filteredData
  };
};
