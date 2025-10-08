/**
 * DEPARTMENT MODAL COMPONENT
 * ==========================
 * 
 * This React component renders a modal popup for department details.
 * Used for displaying additional information about specific departments
 * when they are clicked.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Department-specific content area
 * - Close button and escape key handling
 * - Responsive design
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

import React, { useEffect } from 'react';
import { DepartmentTotals, IncomeRecord } from '../types';
import { dataProcessingService } from '../services/dataProcessingService';
import styles from './DepartmentModal.module.css';

/**
 * Props interface for DepartmentModal component
 * 
 * @interface DepartmentModalProps
 * @property {string} departmentName - Name of the department
 * @property {DepartmentTotals} totals - Department totals data
 * @property {IncomeRecord[]} data - Full income data array for sub-section calculations
 * @property {boolean} isOpen - Whether the modal is open
 * @property {() => void} onClose - Function to close the modal
 */
interface DepartmentModalProps {
  departmentName: string;
  totals: DepartmentTotals;
  data: IncomeRecord[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Department Modal Component
 * 
 * Renders a modal popup with department details.
 * 
 * @param {DepartmentModalProps} props - Component props
 * @returns {JSX.Element | null} Rendered modal or null if not open
 */
export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  departmentName,
  totals,
  data,
  isOpen,
  onClose
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Helper function to calculate totals for sub-sections
  const getSubSectionTotals = (subSectionName: string): DepartmentTotals => {
    return dataProcessingService.calculateDepartmentTotals(data, subSectionName);
  };

  // Get department-specific content
  const getDepartmentContent = (name: string) => {
    switch (name) {
       case 'Gaushala':
         return {
           title: 'Gaushala Details',
           hasSubSections: true
         };
       case 'Kitchen':
         return {
           title: 'Kitchen Operations',
           hasSubSections: true
         };
      case 'Hundi':
        return {
          title: 'Hundi Collections',
          hasSubSections: true
        };
      case 'Other Donations':
        return {
          title: 'Other Donations',
          hasSubSections: true
        };
      default:
        return {
          title: `${name} Details`
        };
    }
  };

  const content = getDepartmentContent(departmentName);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{content.title}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
         <div className={styles.modalBody}>

           <div className={styles.incomeSection}>
             <h4 className={styles.sectionTitle}>Current Income Summary</h4>
             <div className={styles.incomeGrid}>
               <div className={styles.incomeCard}>
                 <span className={styles.incomeLabel}>Cash Income</span>
                 <span className={styles.incomeValue}>
                   {dataProcessingService.formatCurrency(totals.cash)}
                 </span>
               </div>
               <div className={styles.incomeCard}>
                 <span className={styles.incomeLabel}>Online Income</span>
                 <span className={styles.incomeValue}>
                   {dataProcessingService.formatCurrency(totals.online)}
                 </span>
               </div>
               <div className={styles.incomeCard}>
                 <span className={styles.incomeLabel}>Total Income</span>
                 <span className={`${styles.incomeValue} ${styles.total}`}>
                   {dataProcessingService.formatCurrency(totals.total)}
                 </span>
               </div>
             </div>
           </div>

           {/* Gaushala Sub-sections */}
           {content.hasSubSections && departmentName === 'Gaushala' && (
             <>
               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Gaushala Seva Office</h4>
                 <p className={styles.subSectionDescription}>
                   Administrative office managing Gaushala operations and services.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const sevaOfficeTotals = getSubSectionTotals('Gaushala Seva Office');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(sevaOfficeTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(sevaOfficeTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(sevaOfficeTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Gaushala Hundi</h4>
                 <p className={styles.subSectionDescription}>
                   Donation collections specifically for Gaushala operations and maintenance.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const gaushalaHundiTotals = getSubSectionTotals('Gaushala Hundi');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(gaushalaHundiTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(gaushalaHundiTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(gaushalaHundiTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>
             </>
           )}

           {/* Kitchen Sub-sections */}
           {content.hasSubSections && departmentName === 'Kitchen' && (
             <>
               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Kitchen (Journey Prasad)</h4>
                 <p className={styles.subSectionDescription}>
                   Special prasad preparation and distribution for devotees' spiritual journeys.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const journeyPrasadTotals = getSubSectionTotals('Kitchen (Journey Prasad)');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(journeyPrasadTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(journeyPrasadTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(journeyPrasadTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Kitchen Seva Office</h4>
                 <p className={styles.subSectionDescription}>
                   Administrative office managing Kitchen operations and food services.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const kitchenSevaTotals = getSubSectionTotals('Kitchen Seva Office');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(kitchenSevaTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(kitchenSevaTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(kitchenSevaTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Kitchen Hundi</h4>
                 <p className={styles.subSectionDescription}>
                   Donation collections specifically for Kitchen operations and food services.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const kitchenHundiTotals = getSubSectionTotals('Kitchen Hundi');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(kitchenHundiTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(kitchenHundiTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(kitchenHundiTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>
             </>
           )}

           {/* Hundi Sub-sections */}
           {content.hasSubSections && departmentName === 'Hundi' && (
             <>
               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Temple Hundi</h4>
                 <p className={styles.subSectionDescription}>
                   General donation collections for temple maintenance and daily operations.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const templeHundiTotals = getSubSectionTotals('Temple Hundi');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(templeHundiTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(templeHundiTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(templeHundiTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Jagannath Hundi</h4>
                 <p className={styles.subSectionDescription}>
                   Dedicated donation collections for Lord Jagannath's seva and temple services.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const jagannathHundiTotals = getSubSectionTotals('Jagannath Hundi');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(jagannathHundiTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(jagannathHundiTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(jagannathHundiTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>Yamuna Hundi</h4>
                 <p className={styles.subSectionDescription}>
                   Special donation collections for Yamuna River related activities and conservation.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const yamunaHundiTotals = getSubSectionTotals('Yamuna Hundi');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(yamunaHundiTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(yamunaHundiTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(yamunaHundiTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>
             </>
           )}

           {/* Other Donations Sub-sections */}
           {content.hasSubSections && departmentName === 'Other Donations' && (
             <>
               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>General Donations</h4>
                 <p className={styles.subSectionDescription}>
                   General donation collections for various temple activities and maintenance.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const generalDonationsTotals = getSubSectionTotals('General Donations');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(generalDonationsTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(generalDonationsTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(generalDonationsTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>

               <div className={styles.subSection}>
                 <h4 className={styles.sectionTitle}>PWS Donations</h4>
                 <p className={styles.subSectionDescription}>
                   Special donation collections for PWS (Prabhu Wala Seva) related activities and services.
                 </p>
                 <div className={styles.subSectionIncomeGrid}>
                   {(() => {
                     const pwsDonationsTotals = getSubSectionTotals('PWS Donations');
                     return (
                       <>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Cash Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(pwsDonationsTotals.cash)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Online Income</span>
                           <span className={styles.incomeValue}>
                             {dataProcessingService.formatCurrency(pwsDonationsTotals.online)}
                           </span>
                         </div>
                         <div className={styles.subIncomeCard}>
                           <span className={styles.incomeLabel}>Total</span>
                           <span className={`${styles.incomeValue} ${styles.total}`}>
                             {dataProcessingService.formatCurrency(pwsDonationsTotals.total)}
                           </span>
                         </div>
                       </>
                     );
                   })()}
                 </div>
               </div>
             </>
           )}


        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
