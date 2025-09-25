import React from 'react';
import { IncomeRecord, ALL_DEPARTMENTS } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import { DepartmentCard } from './DepartmentCard';
import styles from './DepartmentsSection.module.css';

interface DepartmentsSectionProps {
  data: IncomeRecord[];
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({ data }) => {
  return (
    <section className={styles.departmentsSection} aria-labelledby="departments-heading">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 id="departments-heading">Department Overview</h3>
          <div className={styles.departmentLegend} role="group" aria-label="Department status legend">
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.active}`} aria-hidden="true"></span>
              Has Data
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.inactive}`} aria-hidden="true"></span>
              No Data
            </span>
          </div>
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
