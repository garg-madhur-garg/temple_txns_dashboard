import { BankDetailsConfig } from '../types';

/**
 * ISKCON Empower Prayagraj Fund Configuration
 * 
 * Configuration for fetching ISKCON Empower Prayagraj Fund balance from Google Sheets.
 * Uses environment variables: REACT_APP_GOOGLE_SHEETS_API_KEY, REACT_APP_ISKCON_EMPOWER_SPREADSHEET_ID, REACT_APP_ISKCON_EMPOWER_SHEET_RANGE
 */

export const iskconEmpowerPrayagrajConfig: BankDetailsConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || '',
  spreadsheetId: process.env.REACT_APP_ISKCON_EMPOWER_SPREADSHEET_ID || '',
  range: process.env.REACT_APP_ISKCON_EMPOWER_SHEET_RANGE || ''
};

// Validate required environment variables
if (!iskconEmpowerPrayagrajConfig.apiKey || !iskconEmpowerPrayagrajConfig.spreadsheetId || !iskconEmpowerPrayagrajConfig.range) {
  console.error('Missing required environment variables for ISKCON Empower Prayagraj: REACT_APP_GOOGLE_SHEETS_API_KEY, REACT_APP_ISKCON_EMPOWER_SPREADSHEET_ID, and REACT_APP_ISKCON_EMPOWER_SHEET_RANGE');
}

