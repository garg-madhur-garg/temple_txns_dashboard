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

import React, { useState } from 'react';
import { IncomeRecord, ALL_DEPARTMENTS, DepartmentTotals } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentModal } from './DepartmentModal';
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
  // State for modal
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [modalTotals, setModalTotals] = useState<DepartmentTotals | null>(null);

  // Handle department card click
  const handleDepartmentClick = (departmentName: string) => {
    // Use main department totals calculation for departments with sub-sections
    const isMainDepartment = ['Gaushala', 'Kitchen', 'Hundi', 'Other Donations'].includes(departmentName);
    const totals = isMainDepartment 
      ? dataProcessingService.calculateMainDepartmentTotals(data, departmentName)
      : dataProcessingService.calculateDepartmentTotals(data, departmentName);
    
    setSelectedDepartment(departmentName);
    setModalTotals(totals);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedDepartment(null);
    setModalTotals(null);
  };
  return (
    <section className={styles.departmentsSection} aria-labelledby="departments-heading">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 id="departments-heading">Department Overview</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.departmentsGrid}>
            {ALL_DEPARTMENTS.map((departmentName, index) => {
              // Use main department totals calculation for departments with sub-sections
              const isMainDepartment = ['Gaushala', 'Kitchen', 'Hundi', 'Other Donations'].includes(departmentName);
              const totals = isMainDepartment 
                ? dataProcessingService.calculateMainDepartmentTotals(data, departmentName)
                : dataProcessingService.calculateDepartmentTotals(data, departmentName);
              
              return (
                <DepartmentCard
                  key={departmentName}
                  name={departmentName}
                  totals={totals}
                  index={index}
                  onClick={handleDepartmentClick}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Department Modal */}
      {selectedDepartment && modalTotals && (
        <DepartmentModal
          departmentName={selectedDepartment}
          totals={modalTotals}
          data={data}
          isOpen={!!selectedDepartment}
          onClose={handleModalClose}
        />
      )}
    </section>
  );
};
