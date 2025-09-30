# 🚀 GitHub Pages Deployment Guide

## **Prerequisites**
- GitHub account
- Your project already pushed to GitHub
- Environment variables configured

## **Step 1: Update Homepage URL**

**IMPORTANT:** Before deploying, update the homepage URL in `package.json`:

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/temple_txns_dashboard"
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## **Step 2: Environment Variables Setup**

Since GitHub Pages is a static hosting service, you'll need to set up your environment variables differently:

### **Option A: Build-time Environment Variables (Recommended)**

1. **Create a `.env.production` file** in your project root:
```env
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key_here
REACT_APP_INCOME_SPREADSHEET_ID=your_income_spreadsheet_id_here
REACT_APP_INCOME_SHEET_RANGE=Sheet1!A:E
REACT_APP_BANK_SPREADSHEET_ID=your_bank_spreadsheet_id_here
REACT_APP_BANK_SHEET_RANGE=Current_Balance!A:I
REACT_APP_REFRESH_INTERVAL=30000
```

2. **Add `.env.production` to `.gitignore`** to keep your credentials secure:
```gitignore
.env.production
```

### **Option B: GitHub Secrets (Advanced)**

For more security, you can use GitHub Actions with secrets, but this requires additional setup.

## **Step 3: Deploy to GitHub Pages**

### **Method 1: Using npm scripts (Easiest)**

1. **Install dependencies:**
```bash
npm install
```

2. **Deploy:**
```bash
npm run deploy
```

This will:
- Build your project
- Create a `gh-pages` branch
- Push the build files to GitHub Pages

### **Method 2: Manual Deployment**

1. **Build the project:**
```bash
npm run build
```

2. **Push to gh-pages branch manually:**
```bash
git subtree push --prefix build origin gh-pages
```

## **Step 4: Enable GitHub Pages**

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **gh-pages** branch and **/ (root)** folder
6. Click **Save**

## **Step 5: Access Your Dashboard**

Your dashboard will be available at:
```
https://YOUR_GITHUB_USERNAME.github.io/temple_txns_dashboard
```

## **Important Notes**

### **🔒 Security Considerations**
- **Never commit `.env` files** with real credentials
- Use `.env.production` for production builds only
- Consider using GitHub Secrets for sensitive data

### **🔄 Updating Your Dashboard**
To update your deployed dashboard:
```bash
npm run deploy
```

### **📊 Google Sheets API**
- Ensure your Google Sheets API key has proper permissions
- Make sure your spreadsheets are publicly readable or properly shared
- Test your API access before deploying

### **🌐 CORS Issues**
If you encounter CORS issues:
- Check your Google Sheets sharing settings
- Ensure your API key is configured correctly
- Verify your spreadsheet IDs are correct

## **Troubleshooting**

### **Build Fails**
- Check for TypeScript errors: `npm run build`
- Ensure all environment variables are set
- Verify all dependencies are installed

### **Dashboard Doesn't Load**
- Check browser console for errors
- Verify your GitHub Pages URL is correct
- Ensure all environment variables are properly set

### **Data Not Loading**
- Check Google Sheets API permissions
- Verify spreadsheet IDs and ranges
- Test API access with your credentials

## **Production Checklist**

- [ ] Updated homepage URL in package.json
- [ ] Environment variables configured
- [ ] Build successful (`npm run build`)
- [ ] GitHub Pages enabled
- [ ] Dashboard accessible at GitHub Pages URL
- [ ] Data loading correctly
- [ ] All features working as expected

## **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Test your Google Sheets API access
4. Ensure your GitHub Pages settings are correct

---

**🎉 Congratulations!** Your Temple Transactions Dashboard is now live on GitHub Pages!
