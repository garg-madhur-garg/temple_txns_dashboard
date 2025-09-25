import React from 'react';
import { DateFilter } from '../types';
import styles from './DateFilterBar.module.css';

interface DateFilterBarProps {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter, specificDate?: string) => void;
  dataCount: number;
}

const FILTER_LABELS: Record<DateFilter, string> = {
  all: 'All Time',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  specific: 'Specific Date'
};

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  dataCount
}) => {
  const [specificDate, setSpecificDate] = React.useState<string>('');

  const handleFilterClick = (filter: DateFilter) => {
    onFilterChange(filter);
  };

  const handleDateChange = (date: string) => {
    setSpecificDate(date);
    if (date) {
      // Convert from YYYY-MM-DD to M/D/YYYY format to match data
      const [year, month, day] = date.split('-');
      const formattedDate = `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
      onFilterChange('specific', formattedDate);
    }
  };

  const getFilterInfo = () => {
    if (currentFilter === 'specific' && specificDate) {
      // Convert from YYYY-MM-DD to M/D/YYYY format for display
      const [year, month, day] = specificDate.split('-');
      const formattedDate = `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
      return `Showing data for ${formattedDate}`;
    }
    
    const filterLabels: Record<DateFilter, string> = {
      'today': 'today',
      'yesterday': 'yesterday',
      'week': 'this week',
      'month': 'this month',
      'year': 'this year',
      'all': 'all data',
      'specific': 'specific date'
    };
    
    return `Showing data for ${filterLabels[currentFilter] || 'all data'}`;
  };

  return (
    <section className={styles.dateFilterBar} role="search" aria-label="Filter data by date">
      <div className={styles.container}>
        <div className={styles.filterControls}>
          <div className={styles.datePickerGroup}>
            <label htmlFor="dateFilter" className={styles.filterLabel}>
              Filter by Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              className={`${styles.formControl} ${styles.formControlInline}`}
              value={specificDate}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-label="Select specific date to filter data"
            />
          </div>
          
          <div className={styles.quickFilters} role="group" aria-label="Quick date filters">
            {(['all', 'today', 'yesterday', 'week', 'month', 'year'] as DateFilter[]).map((filter) => (
              <button
                key={filter}
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm} ${styles.filterBtn} ${
                  currentFilter === filter ? styles.active : ''
                }`}
                onClick={() => handleFilterClick(filter)}
                aria-pressed={currentFilter === filter}
                aria-label={`Filter by ${FILTER_LABELS[filter]}`}
              >
                {FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
          
          <div className={styles.filterInfo} aria-live="polite">
            <span id="filterInfo">{getFilterInfo()}</span>
            <span className={styles.recordCount}>
              ({dataCount} records)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
