// Core data types
export interface IncomeRecord {
  date: string;
  department: string;
  cash: number;
  online: number;
}

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
}

// Google Sheets configuration
export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  range: string;
  refreshInterval: number;
}

// Connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface ConnectionState {
  status: ConnectionStatus;
  message: string;
  lastSync?: string;
}

// Filter types
export type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'specific';

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
export const ALL_DEPARTMENTS = [
  "Guest House",
  "Govindas Res", 
  "Govindas Stall",
  "Gift Shop",
  "Snacks Shop",
  "Seva Office",
  "Railway Book Stall",
  "Kitchen"
] as const;

export type DepartmentName = typeof ALL_DEPARTMENTS[number];
