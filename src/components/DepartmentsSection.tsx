/**
 * DEPARTMENTS SECTION COMPONENT
 * =============================
 * 
 * This React component displays the department overview section of the dashboard.
 * It renders department cards for all temple departments, showing income totals
 * and status indicators for each department.
 * 
 * Features:
 * - Displays all departments in priority order
 * - Shows income breakdown (cash vs online)
 * - Visual status indicators (active/inactive)
 * - Responsive grid layout
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React from 'react';
import { IncomeRecord, ALL_DEPARTMENTS } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { DepartmentCard } from './DepartmentCard';
import styles from './DepartmentsSection.module.css';

/**
 * Props interface for DepartmentsSection component
 * 
 * @interface DepartmentsSectionProps
 * @property {IncomeRecord[]} data - Array of income records to process and display
 */
interface DepartmentsSectionProps {
  data: IncomeRecord[];
}

/**
 * Departments Section Component
 * 
 * Renders the department overview section with all temple departments.
 * Each department is displayed as a card showing income totals and status.
 * 
 * @param {DepartmentsSectionProps} props - Component props
 * @returns {JSX.Element} Rendered departments section
 */
export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({ data }) => {
  return (
    <section className={styles.departmentsSection} aria-labelledby="departments-heading">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 id="departments-heading">Department Overview</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.departmentsGrid}>
            {ALL_DEPARTMENTS.map((departmentName) => {
              const totals = dataProcessingService.calculateDepartmentTotals(data, departmentName);
              return (
                <DepartmentCard
                  key={departmentName}
                  name={departmentName}
                  totals={totals}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
