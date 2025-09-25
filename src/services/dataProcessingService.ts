import { 
  IncomeRecord, 
  KPIData, 
  AnalyticsData, 
  DepartmentTotals, 
  DateFilter,
  ALL_DEPARTMENTS 
} from '../types';

export class DataProcessingService {
  /**
   * Calculate KPIs from income data
   */
  calculateKPIs(data: IncomeRecord[]): KPIData {
    const totalCash = data.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = data.reduce((sum, record) => sum + record.online, 0);
    const totalRevenue = totalCash + totalOnline;
    
    // Count active departments (departments with data)
    const activeDepartments = new Set(data.map(record => record.department)).size;
    
    const cashPercentage = totalRevenue > 0 ? Number(((totalCash / totalRevenue) * 100).toFixed(1)) : 0;
    const onlinePercentage = totalRevenue > 0 ? Number(((totalOnline / totalRevenue) * 100).toFixed(1)) : 0;
    
    return {
      totalRevenue,
      totalCash,
      totalOnline,
      cashPercentage,
      onlinePercentage,
      activeDepartments,
      totalDepartments: ALL_DEPARTMENTS.length
    };
  }

  /**
   * Calculate analytics insights from income data
   */
  calculateAnalytics(data: IncomeRecord[]): AnalyticsData {
    if (data.length === 0) {
      return {
        bestDay: '--',
        topDepartment: '--',
        cashOnlineRatio: '--',
        avgDailyRevenue: 0
      };
    }
    
    // Daily revenue by date
    const dailyRevenue: Record<string, number> = {};
    data.forEach(record => {
      if (!dailyRevenue[record.date]) {
        dailyRevenue[record.date] = 0;
      }
      dailyRevenue[record.date] += record.cash + record.online;
    });
    
    // Best performing day
    const bestDay = Object.entries(dailyRevenue)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    const bestDayFormatted = bestDay ? 
      `${this.formatDate(bestDay[0])} (${this.formatCurrency(bestDay[1])})` : '--';
    
    // Top department
    const deptRevenue: Record<string, number> = {};
    data.forEach(record => {
      if (!deptRevenue[record.department]) {
        deptRevenue[record.department] = 0;
      }
      deptRevenue[record.department] += record.cash + record.online;
    });
    
    const topDept = Object.entries(deptRevenue)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    const topDeptFormatted = topDept ? 
      `${topDept[0]} (${this.formatCurrency(topDept[1])})` : '--';
    
    // Cash vs Online ratio
    const totalCash = data.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = data.reduce((sum, record) => sum + record.online, 0);
    const ratio = totalOnline > 0 ? (totalCash / totalOnline).toFixed(2) : '--';
    const ratioFormatted = ratio !== '--' ? `${ratio}:1` : '--';
    
    // Average daily revenue
    const uniqueDates = Array.from(new Set(data.map(record => record.date)));
    const avgDaily = uniqueDates.length > 0 ? 
      (totalCash + totalOnline) / uniqueDates.length : 0;
    
    return {
      bestDay: bestDayFormatted,
      topDepartment: topDeptFormatted,
      cashOnlineRatio: ratioFormatted,
      avgDailyRevenue: avgDaily
    };
  }

  /**
   * Calculate totals for a specific department
   */
  calculateDepartmentTotals(data: IncomeRecord[], departmentName: string): DepartmentTotals {
    const deptData = data.filter(record => record.department === departmentName);
    const totalCash = deptData.reduce((sum, record) => sum + record.cash, 0);
    const totalOnline = deptData.reduce((sum, record) => sum + record.online, 0);
    const totalIncome = totalCash + totalOnline;
    
    return {
      cash: totalCash,
      online: totalOnline,
      total: totalIncome,
      hasData: deptData.length > 0
    };
  }

  /**
   * Filter data by date range
   */
  filterDataByDate(data: IncomeRecord[], filter: DateFilter, specificDate?: string): IncomeRecord[] {
    if (filter === 'all') {
      return [...data];
    }
    
    if (filter === 'specific' && specificDate) {
      return data.filter(record => record.date === specificDate);
    }
    
    const range = this.getDateRange(filter);
    if (!range) {
      return [...data];
    }
    
    const startStr = this.formatDateForComparison(range.start);
    const endStr = this.formatDateForComparison(range.end);
    
    return data.filter(record => {
      // Parse the record date (M/D/YYYY format)
      const recordDate = this.parseDateString(record.date);
      const startDate = this.parseDateString(startStr);
      const endDate = this.parseDateString(endStr);
      
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Get date range for filter
   */
  private getDateRange(filter: DateFilter): { start: Date; end: Date } | null {
    // Get current IST date
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);
    
    const today = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    switch (filter) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday':
        return { start: yesterday, end: yesterday };
      case 'week':
        return { start: startOfWeek, end: today };
      case 'month':
        return { start: startOfMonth, end: today };
      case 'year':
        return { start: startOfYear, end: today };
      default:
        return null;
    }
  }

  /**
   * Format date for comparison (M/D/YYYY format to match data)
   */
  private formatDateForComparison(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Parse date string (M/D/YYYY format) to Date object for comparison
   */
  private parseDateString(dateStr: string): Date {
    const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get current date formatted
   */
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get current time formatted
   */
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

// Export singleton instance
export const dataProcessingService = new DataProcessingService();
