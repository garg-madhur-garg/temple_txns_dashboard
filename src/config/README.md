# Bank Details Configuration

This directory contains configuration files for the Bank Details feature.

## Files

- `bankDetailsConfig.ts` - Configuration for fetching bank details from Google Sheets

## Setup Instructions

### 1. Google Sheets Setup

Create a Google Sheet with the following structure:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Bank Details | IFSC Code | UPI IDs | Account Holder Name | Main Purpose | Current Balance |

**Example data:**
```
State Bank of India - Main Branch | SBIN0001234 | bank@upi, bank2@paytm | Temple Trust | Donations and Offerings | 50000
HDFC Bank - Branch | HDFC0005678 | temple@hdfc | Temple Trust | Maintenance Fund | 25000
```

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Copy the API Key

### 3. Configuration

Update `bankDetailsConfig.ts` with your details:

```typescript
export const bankDetailsConfig: BankDetailsConfig = {
  apiKey: 'YOUR_GOOGLE_SHEETS_API_KEY',
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  range: 'Bank Details!A:F'
};
```

### 4. Sheet Permissions

Make sure your Google Sheet is:
- **Public** (for API access without authentication)
- **Shared with "Anyone with the link can view"** (recommended)

## Features

- **Copy All Details**: Copies all bank information to clipboard
- **Copy UPI IDs**: Copies only UPI IDs for quick sharing
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Fetches latest data from Google Sheets

## Troubleshooting

### Common Issues

1. **"Failed to fetch bank details"**
   - Check API key is correct
   - Verify spreadsheet ID
   - Ensure sheet is publicly accessible

2. **"No bank details available"**
   - Check if data exists in the specified range
   - Verify column structure matches expected format

3. **UPI IDs not displaying**
   - Ensure UPI IDs are comma-separated in the sheet
   - Check for extra spaces in the data

### Testing Connection

The system will automatically test the connection when the app loads. Check the browser console for any error messages.

## Data Format

### UPI IDs Column
- Multiple UPI IDs should be comma-separated
- Example: `bank@upi, bank2@paytm, temple@phonepe`
- Spaces around commas are automatically trimmed

### Current Balance Column
- Should contain numeric values only
- Currency formatting is handled automatically
- Example: `50000` (will display as ₹50,000.00)
