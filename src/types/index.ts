/**
 * TEMPLE TRANSACTIONS DASHBOARD - TYPE DEFINITIONS
 * ===============================================
 * 
 * This file contains all TypeScript type definitions for the Temple Transactions Dashboard.
 * It provides type safety and IntelliSense support for the React components and services.
 * 
 * Key Type Categories:
 * - Core data structures (IncomeRecord, DepartmentTotals)
 * - Component props and interfaces
 * - Service contracts and configurations
 * - Utility types and constants
 * 
 * Author: Temple Management System
 * Last Updated: 2025
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

/**
 * Income Record Interface
 * 
 * Represents a single income transaction record from temple departments.
 * This is the fundamental data structure used throughout the application.
 * 
 * @interface IncomeRecord
 * @property {string} date - Transaction date in YYYY-MM-DD format
 * @property {string} department - Department name (must match ALL_DEPARTMENTS)
 * @property {number} cash - Cash income amount in INR
 * @property {number} online - Online payment income amount in INR
 */
export interface IncomeRecord {
  date: string;
  department: string;
  cash: number;
  online: number;
}

/**
 * Bank Details Interface
 * 
 * Represents bank account information from Google Sheets.
 * Used for displaying bank details above income records.
 * 
 * @interface BankDetails
 * @property {string} bankDetails - Bank name and details
 * @property {string} ifscCode - IFSC code of the bank
 * @property {string[]} upiIds - Array of UPI IDs (can be multiple)
 * @property {string} accountHolderName - Name of the account holder
 * @property {string} mainPurpose - Main purpose of the account
 * @property {number} currentBalance - Current balance in the account
 * @property {string} accountNumber - Bank account number
 */
export interface BankDetails {
  bankDetails: string;
  ifscCode: string;
  upiIds: string[];
  accountHolderName: string;
  mainPurpose: string;
  currentBalance: number;
  accountNumber: string;
}

/**
 * Department Totals Interface
 * 
 * Represents aggregated income data for a specific department.
 * Used in department cards and summary displays.
 * 
 * @interface DepartmentTotals
 * @property {number} cash - Total cash income for the department
 * @property {number} online - Total online income for the department
 * @property {number} total - Combined total income (cash + online)
 * @property {boolean} hasData - Whether the department has any income data
 */
export interface DepartmentTotals {
  cash: number;
  online: number;
  total: number;
  hasData: boolean;
}

export interface KPIData {
  totalRevenue: number;
  totalCash: number;
  totalOnline: number;
  cashPercentage: number;
  onlinePercentage: number;
  activeDepartments: number;
  totalDepartments: number;
}

export interface AnalyticsData {
  bestDay: string;
  topDepartment: string;
  cashOnlineRatio: string;
  avgDailyRevenue: number;
  avgMonthlyRevenue: number;
  avgYearlyRevenue: number;
}

// Google Sheets configuration
export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  range: string;
  refreshInterval: number;
}

// Bank Details Google Sheets configuration
export interface BankDetailsConfig {
  apiKey: string;
  spreadsheetId: string;
  range: string;
}

// Connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface ConnectionState {
  status: ConnectionStatus;
  message: string;
  lastSync?: string;
}

// Filter types
export type DateFilter = 'all' | 'yesterday' | 'week' | 'month' | 'year' | 'specific';

/**
 * Date Range Interface
 * 
 * Represents a date range for filtering data
 * 
 * @interface DateRange
 * @property {Date} start - Start date of the range
 * @property {Date} end - End date of the range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DailyTrendData {
  labels: string[];
  cashData: number[];
  onlineData: number[];
}

export interface DepartmentChartData {
  labels: string[];
  data: number[];
}

export interface PaymentMethodData {
  labels: string[];
  data: number[];
}

// Component props types
export interface KPICardProps {
  icon: string;
  value: string;
  label: string;
  secondary?: string;
  growth?: string;
  growthType?: 'positive' | 'negative' | 'neutral';
}

export interface DepartmentCardProps {
  name: string;
  totals: DepartmentTotals;
}

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  onExport?: () => void;
}

export interface DataTableProps {
  data: IncomeRecord[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  currentSort: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

// Service types
export interface GoogleSheetsService {
  testConnection: (config: GoogleSheetsConfig) => Promise<boolean>;
  fetchData: (config: GoogleSheetsConfig) => Promise<IncomeRecord[]>;
  fetchBankDetails: (config: BankDetailsConfig) => Promise<BankDetails[]>;
}

export interface DataProcessingService {
  calculateKPIs: (data: IncomeRecord[]) => KPIData;
  calculateAnalytics: (data: IncomeRecord[]) => AnalyticsData;
  calculateDepartmentTotals: (data: IncomeRecord[], department: string) => DepartmentTotals;
  filterDataByDate: (data: IncomeRecord[], filter: DateFilter, specificDate?: string) => IncomeRecord[];
}

// Hook types
export interface UseIncomeDataReturn {
  data: IncomeRecord[];
  filteredData: IncomeRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseFiltersReturn {
  currentFilter: DateFilter;
  setFilter: (filter: DateFilter, specificDate?: string) => void;
  filteredData: IncomeRecord[];
}

export interface UseConnectionReturn {
  connectionState: ConnectionState;
  connect: (config: GoogleSheetsConfig) => Promise<boolean>;
  disconnect: () => void;
  sync: () => Promise<void>;
}

// Utility types
export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  column: string;
  direction: SortDirection;
}

// Message types
export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface Message {
  text: string;
  type: MessageType;
  id: string;
}

// Constants
// Updated department names and reordered as requested:
// - Govindas Res -> Govindas (simplified name)
// - Govindas Stall -> Vrinda's Food Court (new name)
// - Snacks Shop -> Gopal's Sweet Shop (new name)
// Priority order: Govindas, Vrinda's Food Court, Gopal's Sweet Shop, Seva Office at top
export const ALL_DEPARTMENTS = [
  "Govindas",                    // Main restaurant (formerly Govindas Res)
  "Vrinda's Food Court",         // Food court (formerly Govindas Stall)
  "Gopal's Sweet Shop",          // Sweet shop (formerly Snacks Shop)
  "Seva Office",                 // Administrative office
  "Guest House",                 // Accommodation services
  "Gift Shop",                   // Retail merchandise
  "Railway Book Stall",          // Book sales
  "Kitchen"                      // Food preparation (currently inactive)
] as const;

export type DepartmentName = typeof ALL_DEPARTMENTS[number];
