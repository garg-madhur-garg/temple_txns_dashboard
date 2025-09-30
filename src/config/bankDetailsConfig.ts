import { BankDetailsConfig } from '../types';

/**
 * Bank Details Configuration
 * 
 * Configuration for fetching bank details from Google Sheets.
 * This configuration now uses environment variables for security.
 * 
 * Instructions:
 * 1. Copy .env.example to .env
 * 2. Get your Google Sheets API key from Google Cloud Console
 * 3. Get your spreadsheet ID from the Google Sheets URL
 * 4. Set the range to match your bank details sheet (e.g., 'Bank Details!A:G')
 * 5. Update the values in your .env file with your specific details
 * 
 * Environment Variables Required:
 * - REACT_APP_GOOGLE_SHEETS_API_KEY
 * - REACT_APP_BANK_SPREADSHEET_ID
 * - REACT_APP_BANK_SHEET_RANGE
 */

export const bankDetailsConfig: BankDetailsConfig = {
  // Google Sheets API key from environment variables (required)
  apiKey: process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || '',
  
  // Google Sheets spreadsheet ID from environment variables (required)
  // Found in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  spreadsheetId: process.env.REACT_APP_BANK_SPREADSHEET_ID || '',
  
  // Range that contains your bank details from environment variables (required)
  // Format: 'SheetName!A:G' (adjust based on your sheet structure)
  // Expected columns: Bank Details, IFSC Code, UPI IDs, Account Holder Name, Main Purpose, Current Balance, Account Number
  range: process.env.REACT_APP_BANK_SHEET_RANGE || ''
};

// Validate required environment variables
if (!bankDetailsConfig.apiKey || !bankDetailsConfig.spreadsheetId || !bankDetailsConfig.range) {
  console.error('Missing required environment variables for bank details: REACT_APP_GOOGLE_SHEETS_API_KEY, REACT_APP_BANK_SPREADSHEET_ID, and REACT_APP_BANK_SHEET_RANGE');
}

/**
 * Bank Details Sheet Structure
 * 
 * Expected columns in your Google Sheet:
 * A: Bank Details (e.g., "State Bank of India - Main Branch")
 * B: IFSC Code (e.g., "SBIN0001234")
 * C: UPI IDs (comma-separated if multiple, e.g., "bank@upi, bank2@paytm")
 * D: Account Holder Name (e.g., "Temple Trust")
 * E: Main Purpose (e.g., "Donations and Offerings")
 * F: Current Balance (numeric value, e.g., 50000)
 * G: Account Number (e.g., "1234567890")
 * 
 * Note: The UPI IDs column can contain multiple UPI IDs separated by commas.
 * The system will automatically split them into an array.
 */
