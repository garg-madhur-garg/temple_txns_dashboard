import { IncomeRecord } from '../types';

export class ExportService {
  /**
   * Export data to CSV format
   */
  exportToCSV(data: IncomeRecord[], filename: string): void {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = ['Date', 'Department', 'Cash Income', 'Online Income', 'Total Income'];
    const csvContent = [
      headers.join(','),
      ...data.map(record => [
        record.date,
        `"${record.department}"`,
        record.cash,
        record.online,
        record.cash + record.online
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export generic data to CSV format
   */
  exportGenericToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(record => 
        headers.map(header => {
          const value = record[header];
          // Quote strings that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export chart as image
   */
  exportChartAsImage(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Validate data before export
   */
  validateDataForExport(data: IncomeRecord[]): { isValid: boolean; error?: string } {
    if (!data || data.length === 0) {
      return { isValid: false, error: 'No data available to export' };
    }
    
    const hasInvalidRecords = data.some(record => 
      !record.date || 
      !record.department || 
      typeof record.cash !== 'number' || 
      typeof record.online !== 'number'
    );
    
    if (hasInvalidRecords) {
      return { isValid: false, error: 'Data contains invalid records' };
    }
    
    return { isValid: true };
  }
}

// Export singleton instance
export const exportService = new ExportService();
