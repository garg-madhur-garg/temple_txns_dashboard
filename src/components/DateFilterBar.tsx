/**
 * DATE FILTER BAR COMPONENT - ENHANCED WITH DATE RANGE
 * ===================================================
 * 
 * This React component provides date filtering functionality for the dashboard.
 * Enhanced to support date range selection instead of single date filtering.
 * 
 * Features:
 * - Date range picker (start date and end date)
 * - Quick filter buttons for common periods
 * - Real-time filter information display
 * - Responsive design for mobile and desktop
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React from 'react';
import { DateFilter } from '../types';
import styles from './DateFilterBar.module.css';

/**
 * Props interface for DateFilterBar component
 * 
 * @interface DateFilterBarProps
 * @property {DateFilter} currentFilter - Currently active filter type
 * @property {function} onFilterChange - Callback for filter changes
 * @property {number} dataCount - Number of records in current filter
 * @property {function} onDateRangeChange - Callback for date range changes
 */
interface DateFilterBarProps {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter, specificDate?: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  dataCount: number;
}

/**
 * Filter labels for display
 */
const FILTER_LABELS: Record<DateFilter, string> = {
  all: 'All Time',
  yesterday: 'Yesterday',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  specific: 'Custom Range'
};

/**
 * Date Filter Bar Component with Date Range Support
 * 
 * Renders date filtering controls with support for both quick filters
 * and custom date range selection.
 * 
 * @param {DateFilterBarProps} props - Component props
 * @returns {JSX.Element} Rendered date filter bar
 */
export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  onDateRangeChange,
  dataCount
}) => {
  // State for date range inputs
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');

  /**
   * Get date range for a specific filter
   * 
   * @param {DateFilter} filter - The filter type
   * @returns {object|null} Object with start and end dates in YYYY-MM-DD format
   */
  const getDateRangeForFilter = (filter: DateFilter): { start: string; end: string } | null => {
    // Get current local date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calculate Monday as start of week
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + daysToMonday);
    
    // Calculate Sunday as end of week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Get the last day of the current month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // Get the last day of the current year
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    
    // Format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    switch (filter) {
      case 'yesterday':
        return { start: formatDate(yesterday), end: formatDate(yesterday) };
      case 'week':
        return { start: formatDate(startOfWeek), end: formatDate(endOfWeek) };
      case 'month':
        return { start: formatDate(startOfMonth), end: formatDate(endOfMonth) };
      case 'year':
        return { start: formatDate(startOfYear), end: formatDate(endOfYear) };
      default:
        return null;
    }
  };

  /**
   * Handle quick filter button clicks
   * 
   * @param {DateFilter} filter - The filter type to apply
   */
  const handleFilterClick = (filter: DateFilter) => {
    onFilterChange(filter);
    
    // Auto-populate date range fields based on the selected filter
    if (filter === 'all') {
      setStartDate('');
      setEndDate('');
    } else {
      const dateRange = getDateRangeForFilter(filter);
      if (dateRange) {
        setStartDate(dateRange.start);
        setEndDate(dateRange.end);
      }
    }
  };

  /**
   * Handle start date change with validation
   * 
   * @param {string} date - Start date in YYYY-MM-DD format
   */
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    
    // Validate date range
    if (date && endDate && date > endDate) {
      // If start date is after end date, clear end date
      setEndDate('');
      return;
    }
    
    if (date && endDate) {
      // Convert dates to M/D/YYYY format to match data
      const [startYear, startMonth, startDay] = date.split('-');
      const [endYear, endMonth, endDay] = endDate.split('-');
      const formattedStartDate = `${parseInt(startMonth, 10)}/${parseInt(startDay, 10)}/${startYear}`;
      const formattedEndDate = `${parseInt(endMonth, 10)}/${parseInt(endDay, 10)}/${endYear}`;
      onDateRangeChange(formattedStartDate, formattedEndDate);
    } else if (date) {
      // If only start date is set, set it as both start and end for single date filtering
      const [startYear, startMonth, startDay] = date.split('-');
      const formattedDate = `${parseInt(startMonth, 10)}/${parseInt(startDay, 10)}/${startYear}`;
      onDateRangeChange(formattedDate, formattedDate);
    }
  };

  /**
   * Handle end date change with validation
   * 
   * @param {string} date - End date in YYYY-MM-DD format
   */
  const handleEndDateChange = (date: string) => {
    // Validate date range
    if (date && startDate && date < startDate) {
      // If end date is before start date, don't update
      return;
    }
    
    setEndDate(date);
    if (startDate && date) {
      // Convert dates to M/D/YYYY format to match data
      const [startYear, startMonth, startDay] = startDate.split('-');
      const [endYear, endMonth, endDay] = date.split('-');
      const formattedStartDate = `${parseInt(startMonth, 10)}/${parseInt(startDay, 10)}/${startYear}`;
      const formattedEndDate = `${parseInt(endMonth, 10)}/${parseInt(endDay, 10)}/${endYear}`;
      onDateRangeChange(formattedStartDate, formattedEndDate);
    } else if (date && !startDate) {
      // If only end date is set, set it as both start and end for single date filtering
      const [endYear, endMonth, endDay] = date.split('-');
      const formattedDate = `${parseInt(endMonth, 10)}/${parseInt(endDay, 10)}/${endYear}`;
      onDateRangeChange(formattedDate, formattedDate);
    }
  };

  /**
   * Get filter information text for display
   * 
   * @returns {string} Formatted filter information
   */
  const getFilterInfo = () => {
    if (currentFilter === 'specific' && startDate && endDate) {
      // Convert from YYYY-MM-DD to readable format for display
      const formatDisplayDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
      };
      return `Showing data from ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
    }
    
    if (currentFilter === 'specific' && (startDate || endDate)) {
      // Handle single date selection
      const date = startDate || endDate;
      const formatDisplayDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
      };
      return `Showing data for ${formatDisplayDate(date!)}`;
    }
    
    const filterLabels: Record<DateFilter, string> = {
      'yesterday': 'yesterday',
      'week': 'this week',
      'month': 'this month',
      'year': 'this year',
      'all': 'all data',
      'specific': 'custom range'
    };
    
    return `Showing data for ${filterLabels[currentFilter] || 'all data'}`;
  };

  return (
    <section className={styles.dateFilterBar} role="search" aria-label="Filter data by date range">
      <div className={styles.container}>
        <div className={styles.filterControls}>
          {/* Date Range Picker Section */}
          <div className={styles.dateRangeGroup}>
            <div className={styles.dateRangeInputs}>
              <div className={styles.dateInputGroup}>
                <label htmlFor="startDate" className={styles.dateLabel}>
                  From:
                </label>
                <input
                  type="date"
                  id="startDate"
                  className={`${styles.formControl} ${styles.formControlInline}`}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  max={endDate || undefined}
                  readOnly={currentFilter !== 'specific' && currentFilter !== 'all'}
                  aria-label="Select start date for date range"
                />
              </div>
              <div className={styles.dateInputGroup}>
                <label htmlFor="endDate" className={styles.dateLabel}>
                  To:
                </label>
                <input
                  type="date"
                  id="endDate"
                  className={`${styles.formControl} ${styles.formControlInline}`}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate || undefined}
                  readOnly={currentFilter !== 'specific' && currentFilter !== 'all'}
                  aria-label="Select end date for date range"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    onFilterChange('all');
                  }}
                  aria-label="Clear date range and reset to all data"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.quickFilters} role="group" aria-label="Quick date filters">
            {(['all', 'yesterday', 'week', 'month', 'year'] as DateFilter[]).map((filter) => (
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
