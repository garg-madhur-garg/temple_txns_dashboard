/**
 * DEPARTMENT CARD COMPONENT
 * ==========================
 * 
 * This React component renders an individual department card showing
 * income totals, payment method breakdown, and status indicators.
 * 
 * Features:
 * - Displays department name and status
 * - Shows cash and online income breakdown
 * - Visual status indicators (active/inactive)
 * - Responsive design with hover effects
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React from 'react';
import { DepartmentCardProps } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './DepartmentCard.module.css';

/**
 * Department Card Component
 * 
 * Renders a single department card with income totals and status.
 * 
 * @param {DepartmentCardProps} props - Component props containing department name and totals
 * @returns {JSX.Element} Rendered department card
 */
export const DepartmentCard: React.FC<DepartmentCardProps> = ({ name, totals, index = 0, onClick }) => {
  // Check if this department should be clickable
  const clickableDepartments = ['Gaushala', 'Kitchen', 'Hundi', 'Other Donations'];
  const isClickable = clickableDepartments.includes(name);
  // Determine department status based on data availability
  const status = totals.hasData ? 'active' : 'inactive';
  
  // Apply alternating colors based on index
  const alternatingClass = index % 2 === 0 ? 'even' : 'odd';
  
  // Debug logging to help identify issues
  // console.log(`Department ${name}: hasData=${totals.hasData}, total=${totals.total}, cash=${totals.cash}, online=${totals.online}`);

  // Handle click event
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(name);
    }
  };

  return (
    <div 
      className={`${styles.departmentCard} ${styles[status]} ${styles[alternatingClass]} ${isClickable ? styles.clickable : ''}`}
      onClick={handleClick}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.departmentName}>{name}</h4>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.incomeBreakdown}>
          <div className={styles.incomeItem}>
            <span className={styles.incomeLabel}>Cash</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.cash)}
            </span>
          </div>
          <div className={styles.incomeItem}>
            <span className={styles.incomeLabel}>Online</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.online)}
            </span>
          </div>
          <div className={`${styles.incomeItem} ${styles.total}`}>
            <span className={styles.incomeLabel}>Total Income</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};