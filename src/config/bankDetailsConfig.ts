import { BankDetailsConfig } from '../types';

/**
 * Bank Details Configuration
 * 
 * Configuration for fetching bank details from Google Sheets.
 * This file should be updated with your specific Google Sheets details.
 * 
 * Instructions:
 * 1. Get your Google Sheets API key from Google Cloud Console
 * 2. Get your spreadsheet ID from the Google Sheets URL
 * 3. Set the range to match your bank details sheet (e.g., 'Bank Details!A:F')
 * 4. Update the values below with your specific details
 */

export const bankDetailsConfig: BankDetailsConfig = {
  // Replace with your Google Sheets API key
  apiKey: 'AIzaSyCndZeCj6CHI3c4aZ0NhllTEbBev6Mg3mg',
  
  // Replace with your Google Sheets spreadsheet ID
  // Found in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  spreadsheetId: '1sIKmerb68mazwhs4DUE3XQK9vvsKxUi7tBD6DPSrrcI',
  
  // Replace with the range that contains your bank details
  // Format: 'SheetName!A:G' (adjust based on your sheet structure)
  // Expected columns: Bank Details, IFSC Code, UPI IDs, Account Holder Name, Main Purpose, Current Balance, Account Number
  range: 'Current_Balance!A:G'
};

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
