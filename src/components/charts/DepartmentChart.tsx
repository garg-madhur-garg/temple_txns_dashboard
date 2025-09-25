import React from 'react';
import { IncomeRecord } from '../../types';
import { exportService } from '../../services/exportService';
import { useMessages } from '../../hooks/useMessages';
import { ChartCard } from '../ChartCard';
import styles from './DepartmentChart.module.css';

interface DepartmentChartProps {
  data: IncomeRecord[];
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  const { addMessage } = useMessages();

  const handleExport = () => {
    try {
      const filename = exportService.generateFilename('department_performance', 'csv');
      exportService.exportToCSV(data, filename);
      addMessage('Department performance data exported successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      addMessage(errorMessage, 'error');
    }
  };

  return (
    <ChartCard title="Department Performance" onExport={handleExport}>
      <div className={styles.chartContainer}>
        <div className={styles.chartPlaceholder}>
          <div className={styles.placeholderIcon} aria-hidden="true">📊</div>
          <div className={styles.placeholderText}>
            Department performance chart will be displayed here
          </div>
        </div>
      </div>
    </ChartCard>
  );
};