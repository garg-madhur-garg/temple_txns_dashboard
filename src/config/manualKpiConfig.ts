/**
 * Manual KPI Configuration
 * 
 * Configuration for manually setting KPI values that are not calculated from data.
 * This allows you to set specific values for KPI cards that require manual input.
 * 
 * Instructions:
 * 1. Update the values below with your desired amounts
 * 2. The values will be displayed in the KPI cards
 * 3. Use the formatCurrency function to ensure proper formatting
 */

export interface ManualKpiConfig {
  iskconEmpowerOtherCentersBalance: number;
  iskconEmpowerPrayagrajBalance: number;
}

/**
 * Manual KPI Values Configuration
 * 
 * Update these values with your desired amounts in INR (Indian Rupees)
 * Example: 1000000 = ₹10,00,000.00
 */
export const manualKpiConfig: ManualKpiConfig = {
  // ISKCON Empower Other Centers Balance
  iskconEmpowerOtherCentersBalance: 3329546.56 - 1244020,
  
  // ISKCON Empower Prayagraj Balance
  iskconEmpowerPrayagrajBalance: 1244020
};

/**
 * Helper function to format currency for manual KPI values
 */
export const formatManualKpiCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
