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
        avgDailyRevenue: 0,
        avgMonthlyRevenue: 0,
        avgYearlyRevenue: 0
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
    
    // Calculate average monthly revenue
    const monthlyRevenue: Record<string, number> = {};
    data.forEach(record => {
      const [month, , year] = record.date.split('/').map(num => parseInt(num, 10));
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += record.cash + record.online;
    });
    
    const uniqueMonths = Object.keys(monthlyRevenue).length;
    const avgMonthly = uniqueMonths > 0 ? (totalCash + totalOnline) / uniqueMonths : 0;

    // Calculate average yearly revenue
    const yearlyRevenue: Record<string, number> = {};
    data.forEach(record => {
      const [, , year] = record.date.split('/').map(num => parseInt(num, 10));
      if (!yearlyRevenue[year.toString()]) {
        yearlyRevenue[year.toString()] = 0;
      }
      yearlyRevenue[year.toString()] += record.cash + record.online;
    });
    
    const uniqueYears = Object.keys(yearlyRevenue).length;
    const avgYearly = uniqueYears > 0 ? (totalCash + totalOnline) / uniqueYears : 0;

    return {
      bestDay: bestDayFormatted,
      topDepartment: topDeptFormatted,
      cashOnlineRatio: ratioFormatted,
      avgDailyRevenue: avgDaily,
      avgMonthlyRevenue: avgMonthly,
      avgYearlyRevenue: avgYearly
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
    
    // A department has data if it has records AND the total income is greater than 0
    const hasData = deptData.length > 0 && totalIncome > 0;
    
    return {
      cash: totalCash,
      online: totalOnline,
      total: totalIncome,
      hasData: hasData
    };
  }

  /**
   * Filter data by date range
   * Enhanced to support custom date ranges
   */
  filterDataByDate(data: IncomeRecord[], filter: DateFilter, specificDate?: string, startDate?: string, endDate?: string): IncomeRecord[] {
    if (filter === 'all') {
      return [...data];
    }
    
    // Handle custom date range
    if (filter === 'specific' && startDate && endDate) {
      return data.filter(record => {
        const recordDate = this.parseDateString(record.date);
        const startDateParsed = this.parseDateString(startDate);
        const endDateParsed = this.parseDateString(endDate);
        
        return recordDate >= startDateParsed && recordDate <= endDateParsed;
      });
    }
    
    // Handle single specific date (legacy support)
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
    // Get current IST date - use local time instead of manual offset
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfWeek = new Date(today);
    // Calculate Monday as start of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday (0), go back 6 days to Monday
    startOfWeek.setDate(today.getDate() + daysToMonday);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    switch (filter) {
      case 'yesterday':
        return { start: yesterday, end: yesterday };
      case 'week':
        // End of week is Sunday (6 days after Monday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { start: startOfWeek, end: endOfWeek };
      case 'month':
        // Get the last day of the current month
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: startOfMonth, end: endOfMonth };
      case 'year':
        // Get the last day of the current year
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return { start: startOfYear, end: endOfYear };
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
  parseDateString(dateStr: string): Date {
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
      minimumFractionDigits: 2,
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
