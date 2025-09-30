import React, { useState } from 'react';
import { IncomeRecord, SortState } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { exportService } from '../services/exportService';
import { useMessages } from '../hooks/useMessages';
import styles from './DataTableSection.module.css';

interface DataTableSectionProps {
  data: IncomeRecord[];
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({ data }) => {
  const [sortState, setSortState] = useState<SortState>({ column: 'date', direction: 'descending' });
  const [isExpanded, setIsExpanded] = useState(false);
  const { addMessage } = useMessages();

  const handleSort = (column: string) => {
    setSortState(prev => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'ascending' ? 'descending' : 'ascending'
        };
      } else {
        return {
          column,
          direction: 'descending'
        };
      }
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: any = a[sortState.column as keyof IncomeRecord];
      let bVal: any = b[sortState.column as keyof IncomeRecord];
      
      if (sortState.column === 'total') {
        aVal = a.cash + a.online;
        bVal = b.cash + b.online;
      }
      
      if (sortState.column === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortState.direction === 'ascending') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [data, sortState]);

  const handleExport = () => {
    try {
      const filename = exportService.generateFilename('income_data', 'csv');
      exportService.exportToCSV(data, filename);
      addMessage('Data exported successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      addMessage(errorMessage, 'error');
    }
  };

  return (
    <section className={styles.dataTableSection} aria-labelledby="table-heading">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <h3 id="table-heading">Income Records (From Google Sheets)</h3>
            <button
              className={styles.toggleBtn}
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Collapse income records" : "Expand income records"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
          <div className={styles.tableControls}>
            <span className={styles.recordCount} aria-live="polite">
              {data.length} records
            </span>
            <button 
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
              onClick={handleExport}
              disabled={data.length === 0}
              aria-label="Export table data to CSV"
            >
              📋 Export Table
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.cardBody}>
            <div className={styles.tableContainer}>
            {data.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden="true">📋</div>
                <div className={styles.emptyTitle}>No Data Available</div>
                <div className={styles.emptyDescription}>
                  Connect to Google Sheets to load your income data
                </div>
              </div>
            ) : (
              <table className={styles.dataTable} role="table" aria-label="Income records table">
                <thead>
                  <tr>
                    <th 
                      className={`${styles.sortable} ${sortState.column === 'date' ? styles[sortState.direction] : ''}`}
                      onClick={() => handleSort('date')}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={sortState.column === 'date' ? sortState.direction : 'none'}
                    >
                      Date
                    </th>
                    <th 
                      className={`${styles.sortable} ${sortState.column === 'department' ? styles[sortState.direction] : ''}`}
                      onClick={() => handleSort('department')}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={sortState.column === 'department' ? sortState.direction : 'none'}
                    >
                      Department
                    </th>
                    <th 
                      className={`${styles.sortable} ${sortState.column === 'cash' ? styles[sortState.direction] : ''}`}
                      onClick={() => handleSort('cash')}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={sortState.column === 'cash' ? sortState.direction : 'none'}
                    >
                      Cash Income
                    </th>
                    <th 
                      className={`${styles.sortable} ${sortState.column === 'online' ? styles[sortState.direction] : ''}`}
                      onClick={() => handleSort('online')}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={sortState.column === 'online' ? sortState.direction : 'none'}
                    >
                      Online Income
                    </th>
                    <th 
                      className={`${styles.sortable} ${sortState.column === 'total' ? styles[sortState.direction] : ''}`}
                      onClick={() => handleSort('total')}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={sortState.column === 'total' ? sortState.direction : 'none'}
                    >
                      Total Income
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((record, index) => {
                    const total = record.cash + record.online;
                    return (
                      <tr key={`${record.date}-${record.department}-${index}`}>
                        <td>{dataProcessingService.formatDate(record.date)}</td>
                        <td>{record.department}</td>
                        <td className={styles.currency}>
                          {dataProcessingService.formatCurrency(record.cash)}
                        </td>
                        <td className={styles.currency}>
                          {dataProcessingService.formatCurrency(record.online)}
                        </td>
                        <td className={styles.currency}>
                          <strong>{dataProcessingService.formatCurrency(total)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
