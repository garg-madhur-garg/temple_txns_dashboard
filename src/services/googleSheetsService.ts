import { GoogleSheetsConfig, IncomeRecord, GoogleSheetsService, BankDetailsConfig, BankDetails } from '../types';

export class GoogleSheetsServiceImpl implements GoogleSheetsService {
  /**
   * Test connection to Google Sheets
   */
  async testConnection(config: GoogleSheetsConfig): Promise<boolean> {
    if (!config.apiKey || !config.spreadsheetId) {
      throw new Error('API key and Spreadsheet ID are required');
    }
    
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.range}?key=${config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got valid data
      if (!data.values || data.values.length === 0) {
        throw new Error('No data found in the specified range');
      }
      
      return true;
      
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      throw new Error('Failed to connect to Google Sheets. Please check your credentials.');
    }
  }

  /**
   * Fetch data from Google Sheets
   */
  async fetchData(config: GoogleSheetsConfig): Promise<IncomeRecord[]> {
    if (!config.apiKey || !config.spreadsheetId) {
      throw new Error('API key and Spreadsheet ID are required');
    }
    
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.range}?key=${config.apiKey}`;
      // console.log('Fetching data from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      // console.log('Raw Google Sheets data:', data);
      return this.parseGoogleSheetsData(data);
      
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw new Error(`Failed to fetch data from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Google Sheets API response into IncomeRecord array
   */
  private parseGoogleSheetsData(data: any): IncomeRecord[] {
    // console.log('Parsing Google Sheets data:', data);
    
    if (!data.values || data.values.length < 2) {
      console.warn('No data or insufficient rows in spreadsheet');
      return [];
    }
    
    const [headers, ...rows] = data.values;
    // console.log('Headers found:', headers);
    // console.log('Number of data rows:', rows.length);
    
    // Find column indices - be more flexible with column names
    const dateIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('date') || 
      h.toLowerCase().includes('day') ||
      h.toLowerCase().includes('time')
    );
    const departmentIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('department') || 
      h.toLowerCase().includes('dept') ||
      h.toLowerCase().includes('category') ||
      h.toLowerCase().includes('location')
    );
    const cashIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('cash') || 
      h.toLowerCase().includes('cash amount') ||
      h.toLowerCase().includes('cash revenue')
    );
    const onlineIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('online') || 
      h.toLowerCase().includes('digital') ||
      h.toLowerCase().includes('card') ||
      h.toLowerCase().includes('online amount') ||
      h.toLowerCase().includes('online revenue')
    );
    
    // If we can't find the expected columns, try to use the first 4 columns as fallback
    if (dateIndex === -1 || departmentIndex === -1 || cashIndex === -1 || onlineIndex === -1) {
      console.warn('Could not find expected column names, using first 4 columns as fallback');
      if (headers.length < 4) {
        throw new Error('Spreadsheet must have at least 4 columns: Date, Department, Cash, Online');
      }
      
      return rows.map((row: any[]) => ({
        date: row[0] || '',
        department: row[1] || '',
        cash: parseFloat(row[2]) || 0,
        online: parseFloat(row[3]) || 0
      })).filter((record: IncomeRecord) => record.date && record.department);
    }
    
    return rows.map((row: any[]) => ({
      date: row[dateIndex] || '',
      department: row[departmentIndex] || '',
      cash: parseFloat(row[cashIndex]) || 0,
      online: parseFloat(row[onlineIndex]) || 0
    })).filter((record: IncomeRecord) => record.date && record.department);
  }

  /**
   * Get sample data for demonstration
   */
  private getSampleData(): IncomeRecord[] {
    return [
      { date: "2025-09-24", department: "Guest House", cash: 8000, online: 12000 },
      { date: "2025-09-24", department: "Seva Office", cash: 5000, online: 8000 },
      { date: "2025-09-24", department: "Gift Shop", cash: 2800, online: 1200 },
      { date: "2025-09-23", department: "Govindas Res", cash: 3200, online: 4800 },
      { date: "2025-09-23", department: "Snacks Shop", cash: 1800, online: 0 },
      { date: "2025-09-22", department: "Guest House", cash: 12000, online: 18000 },
      { date: "2025-09-22", department: "Gift Shop", cash: 2100, online: 900 },
      { date: "2025-09-21", department: "Kitchen", cash: 1500, online: 0 },
      { date: "2025-09-21", department: "Railway Book Stall", cash: 800, online: 200 }
    ];
  }

  /**
   * Validate Google Sheets configuration
   */
  validateConfig(config: Partial<GoogleSheetsConfig>): string[] {
    const errors: string[] = [];
    
    if (!config.apiKey?.trim()) {
      errors.push('API key is required');
    }
    
    if (!config.spreadsheetId?.trim()) {
      errors.push('Spreadsheet ID is required');
    }
    
    if (!config.range?.trim()) {
      errors.push('Sheet range is required');
    }
    
    if (config.refreshInterval && (config.refreshInterval < 1000 || config.refreshInterval > 300000)) {
      errors.push('Refresh interval must be between 1 and 300 seconds');
    }
    
    return errors;
  }

  /**
   * Fetch bank details from Google Sheets
   */
  async fetchBankDetails(config: BankDetailsConfig): Promise<BankDetails[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.range}?key=${config.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        return [];
      }
      
      // Skip header row and process data
      const rows = data.values.slice(1);
      
      return rows.map((row: any[], index: number) => {
        // Ensure we have at least 10 columns (A through J)
        const paddedRow = [...row, '', '', '', '', '', '', '', '', '', ''];
        
        // Debug logging for balance parsing
        const rawBalance = paddedRow[5];
        const cleanedBalance = (rawBalance || '0').replace(/[^\d.-]/g, '');
        const parsedBalance = parseFloat(cleanedBalance) || 0;
        
        // console.log(`Row ${index}: Raw balance: "${rawBalance}", Cleaned: "${cleanedBalance}", Parsed: ${parsedBalance}`);
        
        return {
          bankDetails: paddedRow[0] || '',
          ifscCode: paddedRow[1] || '',
          upiIds: paddedRow[2] ? paddedRow[2].split(',').map((id: string) => id.trim()) : [],
          accountHolderName: paddedRow[3] || '',
          mainPurpose: paddedRow[4] || '',
          currentBalance: parsedBalance,
          accountNumber: paddedRow[6] || '',
          lastUpdatedDate: paddedRow[7] || '',
          lastUpdatedTime: paddedRow[8] || '',
          bankName: paddedRow[9] || ''
        };
      });
    } catch (error) {
      console.error('Error fetching bank details:', error);
      throw error;
    }
  }

  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsServiceImpl();
