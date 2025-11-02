/**
 * Currency formatting utility for KPI values
 */

/**
 * Format currency for KPI values
 */
export const formatManualKpiCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
