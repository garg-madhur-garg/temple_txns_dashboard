# Temple Transactions Dashboard - Development Guide

## Table of Contents
1. [Codebase Architecture](#codebase-architecture)
2. [Folder Structure](#folder-structure)
3. [Key Files and Their Purposes](#key-files-and-their-purposes)
4. [Data Flow](#data-flow)
5. [Common Change Scenarios](#common-change-scenarios)
6. [Best Practices](#best-practices)
7. [Important Patterns](#important-patterns)

---

## Codebase Architecture

### Technology Stack
- **React 18.2.0** - UI framework
- **TypeScript 4.9.5** - Type safety
- **Chart.js 4.4.0** - Data visualization
- **CSS Modules** - Component-scoped styling
- **Google Sheets API** - Data source

### Architecture Overview
The application follows a component-based architecture with:
- **Components**: React components for UI rendering
- **Services**: Business logic and data processing
- **Hooks**: Custom React hooks for state management
- **Types**: TypeScript type definitions
- **Config**: Configuration files for external services

---

## Folder Structure

```
src/
├── components/           # React components
│   ├── charts/          # Chart components
│   ├── *.tsx            # Component files
│   └── *.module.css     # Component styles
├── services/            # Business logic services
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── config/              # Configuration files
├── contexts/            # React contexts (Theme)
├── styles/              # Global styles and themes
└── assets/              # Static assets

public/                  # Public assets
├── index.html
└── manifest.json
```

### Key Directories

#### `/src/components`
Contains all React components organized by functionality:
- **Sections**: Main dashboard sections (KPISection, DepartmentsSection, etc.)
- **Charts**: Chart components (DailyTrendChart, DepartmentPerformanceChart, etc.)
- **UI Elements**: Reusable UI components (KPICard, DepartmentCard, etc.)
- **Modals**: Modal dialogs (DepartmentModal, ShareModal, etc.)

#### `/src/services`
Business logic and data processing:
- **dataProcessingService.ts**: All data calculations and transformations
- **googleSheetsService.ts**: Google Sheets API integration
- **exportService.ts**: Data export functionality

#### `/src/hooks`
Custom React hooks for state management:
- **useIncomeData.ts**: Manages income data fetching
- **useFilters.ts**: Manages date filtering
- **useConnection.ts**: Manages Google Sheets connection
- **useBankDetails.ts**: Manages bank details data
- **useMessages.ts**: Manages toast notifications

#### `/src/types`
TypeScript type definitions:
- **index.ts**: All type definitions and constants (including `ALL_DEPARTMENTS`)

#### `/src/config`
Configuration files for external services:
- **bankDetailsConfig.ts**: Bank details sheet configuration
- **iskconEmpowerPrayagrajConfig.ts**: ISKCON Empower configuration
- **manualKpiConfig.ts**: Manual KPI configuration

---

## Key Files and Their Purposes

### Core Application Files

#### `src/App.tsx`
- **Purpose**: Main application component
- **Responsibilities**:
  - Orchestrates all sections
  - Manages global state through hooks
  - Handles connection to Google Sheets
  - Renders dashboard layout

#### `src/types/index.ts`
- **Purpose**: Central type definitions and constants
- **Key Exports**:
  - `ALL_DEPARTMENTS`: Array defining department order
  - `IncomeRecord`: Data structure for income records
  - `DepartmentTotals`: Department totals structure
  - `KPIData`: KPI data structure
  - All TypeScript interfaces

#### `src/services/dataProcessingService.ts`
- **Purpose**: All data processing and calculations
- **Key Methods**:
  - `calculateKPIs()`: Calculate KPI metrics
  - `calculateDepartmentTotals()`: Calculate department totals
  - `calculateMainDepartmentTotals()`: Calculate totals for departments with sub-sections
  - `calculateAnalytics()`: Calculate analytics metrics
  - `filterDataByDate()`: Filter data by date range
- **Important**: Contains sub-sections definition for main departments

### Component Files

#### `src/components/DepartmentsSection.tsx`
- **Purpose**: Displays department overview cards
- **Key Features**:
  - Renders all departments from `ALL_DEPARTMENTS`
  - Handles department card clicks
  - Opens DepartmentModal for departments with sub-sections

#### `src/components/DepartmentModal.tsx`
- **Purpose**: Modal showing department details and sub-sections
- **Key Features**:
  - Displays department totals
  - Shows sub-sections for main departments (Gaushala, Kitchen, Hundi, Other Donations)
  - Handles sub-section rendering and styling

#### `src/components/AnalyticsSection.tsx`
- **Purpose**: Performance insights and analytics
- **Key Features**:
  - Monthly, yearly, and custom date range filtering
  - Best performing day
  - Top department
  - Cash vs Online ratio
  - Average daily revenue

#### Chart Components
- **DailyTrendChart.tsx**: Daily income trends
- **DepartmentPerformanceChart.tsx**: Department performance comparison
- **PaymentMethodChart.tsx**: Payment method distribution

---

## Data Flow

### Data Flow Overview

```
Google Sheets API
    ↓
googleSheetsService.ts
    ↓
useIncomeData hook
    ↓
App.tsx (filtered data)
    ↓
Components (KPISection, DepartmentsSection, Charts, etc.)
    ↓
dataProcessingService.ts (calculations)
    ↓
UI Display
```

### Step-by-Step Data Flow

1. **Data Fetching**:
   - `useIncomeData` hook fetches data from Google Sheets
   - Data is parsed into `IncomeRecord[]` format

2. **Data Filtering**:
   - `useFilters` hook applies date filters
   - Filtered data is passed to components

3. **Data Processing**:
   - Components call `dataProcessingService` methods
   - Calculations are performed (totals, KPIs, analytics)

4. **Data Display**:
   - Processed data is rendered in UI components
   - Charts are updated with new data

---

## Common Change Scenarios

### Scenario 1: Adding a New Department

#### Steps:

1. **Update `ALL_DEPARTMENTS` array** (`src/types/index.ts`):
   ```typescript
   export const ALL_DEPARTMENTS = [
     // ... existing departments
     "New Department Name",  // Add your new department
   ] as const;
   ```

2. **Verify Google Sheet**:
   - Ensure the department name in Google Sheets matches exactly
   - Department name is case-sensitive

3. **Test the changes**:
   - Department should appear in DepartmentsSection
   - Department should appear in chart filters
   - Department data should be calculated correctly

**Files to Modify**:
- `src/types/index.ts` (add to ALL_DEPARTMENTS array)

**Files That Auto-Update**:
- `src/components/DepartmentsSection.tsx` (automatically includes new department)
- `src/components/charts/*.tsx` (automatically includes in filters)

---

### Scenario 2: Adding a Sub-Section to an Existing Department

#### Steps:

1. **Update sub-sections in `dataProcessingService.ts`**:
   ```typescript
   const subSections: Record<string, string[]> = {
     'Kitchen': [
       'Kitchen',
       'Journey Prasad',
       'Kitchen Seva Office',
       'Kitchen Hundi',
       'Prasadam Coupan',
       'Vaishnav Bhoj',
       'New Sub-Section'  // Add your new sub-section
     ],
     // ... other departments
   };
   ```

2. **Update sub-sections in chart components**:
   - `src/components/charts/DepartmentPerformanceChart.tsx`
   - `src/components/charts/PaymentMethodChart.tsx`
   
   Update the same `subSections` object in both files.

3. **Add sub-section display in `DepartmentModal.tsx`**:
   - Find the department's sub-section rendering block
   - Add a new `<div className={styles.subSection}>` block
   - Include title, description, and income cards

4. **Update Google Sheet**:
   - Ensure the sub-section name in Google Sheets matches exactly
   - Data should be tagged with the exact sub-section name

**Files to Modify**:
- `src/services/dataProcessingService.ts` (line ~157-162)
- `src/components/charts/DepartmentPerformanceChart.tsx` (line ~108-113)
- `src/components/charts/PaymentMethodChart.tsx` (line ~110-115)
- `src/components/DepartmentModal.tsx` (add new sub-section UI block)

**Example for Kitchen Department**:
```typescript
// In DepartmentModal.tsx, add after existing Kitchen sub-sections:
<div className={styles.subSection}>
  <h4 className={styles.sectionTitle}>New Sub-Section</h4>
  <p className={styles.subSectionDescription}>
    Description of the new sub-section.
  </p>
  <div className={styles.subSectionIncomeGrid}>
    {(() => {
      const newSubSectionTotals = getSubSectionTotals('New Sub-Section');
      return (
        <>
          <div className={styles.subIncomeCard}>
            <span className={styles.incomeLabel}>Cash Income</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(newSubSectionTotals.cash)}
            </span>
          </div>
          <div className={styles.subIncomeCard}>
            <span className={styles.incomeLabel}>Online Income</span>
            <span className={styles.incomeValue}>
              {dataProcessingService.formatCurrency(newSubSectionTotals.online)}
            </span>
          </div>
          <div className={styles.subIncomeCard}>
            <span className={styles.incomeLabel}>Total</span>
            <span className={`${styles.incomeValue} ${styles.total}`}>
              {dataProcessingService.formatCurrency(newSubSectionTotals.total)}
            </span>
          </div>
        </>
      );
    })()}
  </div>
</div>
```

---

### Scenario 3: Changing Department Display Order

#### Steps:

1. **Update `ALL_DEPARTMENTS` array** (`src/types/index.ts`):
   - Reorder the array elements in the desired order
   - Order in array = display order in UI

**Files to Modify**:
- `src/types/index.ts` (reorder ALL_DEPARTMENTS array)

**Note**: Charts may still sort by revenue, but the initial department list will follow this order.

---

### Scenario 4: Removing/Hiding a Department or Sub-Section

#### Steps:

1. **To Hide a Department**:
   - Remove from `ALL_DEPARTMENTS` array in `src/types/index.ts`
   - Department will no longer appear in UI

2. **To Hide a Sub-Section**:
   - Remove from sub-sections array in `dataProcessingService.ts`
   - Remove from chart components' sub-sections arrays
   - Remove or comment out the sub-section UI block in `DepartmentModal.tsx`

**Files to Modify**:
- `src/types/index.ts` (remove from ALL_DEPARTMENTS)
- `src/services/dataProcessingService.ts` (remove from subSections)
- `src/components/charts/DepartmentPerformanceChart.tsx` (remove from subSections)
- `src/components/charts/PaymentMethodChart.tsx` (remove from subSections)
- `src/components/DepartmentModal.tsx` (remove UI block)

---

### Scenario 5: Changing Department or Sub-Section Name

#### Steps:

1. **Update name in `ALL_DEPARTMENTS`** (if main department):
   - Update in `src/types/index.ts`

2. **Update name in sub-sections arrays**:
   - Update in `dataProcessingService.ts`
   - Update in chart components
   - Update in `DepartmentModal.tsx` (both in subSections array and UI)

3. **Update Google Sheet**:
   - **CRITICAL**: Update the department name in Google Sheets to match exactly
   - Old data will not be fetched if name doesn't match

**Files to Modify**:
- `src/types/index.ts` (if main department)
- `src/services/dataProcessingService.ts`
- `src/components/charts/DepartmentPerformanceChart.tsx`
- `src/components/charts/PaymentMethodChart.tsx`
- `src/components/DepartmentModal.tsx`

---

### Scenario 6: Adding Custom Styling to a Sub-Section

#### Steps:

1. **Add CSS class to sub-section div** in `DepartmentModal.tsx`:
   ```typescript
   <div className={`${styles.subSection} ${styles.customClassName}`}>
   ```

2. **Add CSS styles** in `DepartmentModal.module.css`:
   ```css
   .customClassName {
     background: linear-gradient(135deg, #color1 0%, #color2 100%) !important;
     border-color: #borderColor !important;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
   }

   .customClassName .sectionTitle {
     color: #titleColor !important;
     border-bottom-color: #borderColor !important;
   }
   ```

**Files to Modify**:
- `src/components/DepartmentModal.tsx` (add className)
- `src/components/DepartmentModal.module.css` (add styles)

---

### Scenario 7: Adding a New KPI Metric

#### Steps:

1. **Update `KPIData` interface** in `src/types/index.ts`:
   ```typescript
   export interface KPIData {
     // ... existing properties
     newMetric: number;
   }
   ```

2. **Update `calculateKPIs` method** in `dataProcessingService.ts`:
   ```typescript
   calculateKPIs(data: IncomeRecord[]): KPIData {
     // ... existing calculations
     const newMetric = /* your calculation */;
     
     return {
       // ... existing properties
       newMetric
     };
   }
   ```

3. **Add KPI card** in `KPISection.tsx`:
   ```typescript
   <KPICard
     icon="🎯"
     value={formatCurrency(kpis.newMetric)}
     label="New Metric"
   />
   ```

**Files to Modify**:
- `src/types/index.ts` (update KPIData interface)
- `src/services/dataProcessingService.ts` (update calculateKPIs)
- `src/components/KPISection.tsx` (add KPI card)

---

### Scenario 8: Modifying Chart Display

#### Steps:

1. **Identify the chart component**:
   - `DailyTrendChart.tsx` - Daily trends
   - `DepartmentPerformanceChart.tsx` - Department comparison
   - `PaymentMethodChart.tsx` - Payment distribution

2. **Modify chart configuration**:
   - Update Chart.js options
   - Modify data processing logic
   - Change chart type or styling

3. **Update chart CSS** if needed:
   - Modify corresponding `.module.css` file

**Files to Modify**:
- `src/components/charts/[ChartName].tsx`
- `src/components/charts/[ChartName].module.css`

---

### Scenario 9: Adding Date Range Filter to a Component

#### Steps:

1. **Add state for date range**:
   ```typescript
   const [startDate, setStartDate] = useState<string>('');
   const [endDate, setEndDate] = useState<string>('');
   ```

2. **Add date input fields** in JSX:
   ```typescript
   <input
     type="date"
     value={startDate}
     onChange={(e) => setStartDate(e.target.value)}
   />
   <input
     type="date"
     value={endDate}
     onChange={(e) => setEndDate(e.target.value)}
   />
   ```

3. **Filter data based on date range**:
   ```typescript
   const filteredData = useMemo(() => {
     return data.filter(record => {
       // Parse and compare dates
       // Return true if within range
     });
   }, [data, startDate, endDate]);
   ```

**Reference**: See `AnalyticsSection.tsx` for a complete example.

---

### Scenario 10: Updating Google Sheets Configuration

#### Steps:

1. **Update environment variables** (`.env` file):
   ```
   REACT_APP_GOOGLE_SHEETS_API_KEY=your_key
   REACT_APP_INCOME_SPREADSHEET_ID=your_sheet_id
   REACT_APP_INCOME_SHEET_RANGE=your_range
   ```

2. **Update config files** if using custom configs:
   - `src/config/bankDetailsConfig.ts`
   - `src/config/iskconEmpowerPrayagrajConfig.ts`
   - `src/config/manualKpiConfig.ts`

**Files to Modify**:
- `.env` file (environment variables)
- `src/config/*.ts` files (if applicable)

---

## Best Practices

### 1. Department Management

- **Always update `ALL_DEPARTMENTS` in `src/types/index.ts`** when adding/removing departments
- **Keep department names consistent** across all files
- **Match Google Sheets exactly** - department names are case-sensitive

### 2. Sub-Section Management

- **Update sub-sections in 3 places**:
  1. `dataProcessingService.ts`
  2. `DepartmentPerformanceChart.tsx`
  3. `PaymentMethodChart.tsx`

- **Always add UI block in `DepartmentModal.tsx`** for new sub-sections

### 3. Data Processing

- **Use `dataProcessingService` methods** for all calculations
- **Don't duplicate calculation logic** - centralize in service
- **Use `calculateMainDepartmentTotals`** for departments with sub-sections

### 4. Type Safety

- **Use TypeScript types** from `src/types/index.ts`
- **Don't use string literals** - use `ALL_DEPARTMENTS` constant
- **Update interfaces** when adding new data structures

### 5. Styling

- **Use CSS Modules** for component-specific styles
- **Follow naming conventions** - use kebab-case for CSS classes
- **Use theme variables** for colors (see `src/styles/themes.css`)

### 6. Component Organization

- **Keep components focused** - one responsibility per component
- **Use hooks for state management** - don't duplicate logic
- **Pass data as props** - avoid global state where possible

### 7. Error Handling

- **Handle missing data gracefully** - show appropriate messages
- **Validate date ranges** - ensure start <= end
- **Handle API errors** - show user-friendly error messages

---

## Important Patterns

### Pattern 1: Department with Sub-Sections

Main departments with sub-sections:
- **Gaushala**: Gaushala, Gaushala Seva Office, Gaushala Hundi
- **Kitchen**: Kitchen, Journey Prasad, Kitchen Seva Office, Kitchen Hundi, Prasadam Coupan, Vaishnav Bhoj
- **Hundi**: Hundi, Temple Hundi, Yamuna Hundi
- **Other Donations**: Other Donations, General, PWS

**How it works**:
1. Main department card shows aggregated totals
2. Clicking opens modal with sub-sections
3. Sub-sections show individual totals
4. Charts filter by main department (includes all sub-sections)

### Pattern 2: Date Filtering

Date filtering is handled at multiple levels:
1. **Global filter** (`DateFilterBar`) - filters all dashboard data
2. **Component-level filter** (e.g., `AnalyticsSection`) - additional filtering within component
3. **Chart filters** - date range selection in charts

### Pattern 3: Data Calculation

Data calculations follow this pattern:
1. **Raw data** from Google Sheets
2. **Filtered data** based on date range
3. **Processed data** using `dataProcessingService`
4. **Display data** in UI components

### Pattern 4: Component Structure

Components follow this structure:
```
Component.tsx
  - Props interface
  - Component function
  - State management
  - Data processing
  - Event handlers
  - JSX rendering

Component.module.css
  - Component styles
  - Responsive styles
  - Theme variants
```

---

## Quick Reference

### Key Constants Location

| Constant | Location |
|----------|----------|
| `ALL_DEPARTMENTS` | `src/types/index.ts` (line 255) |
| Sub-sections | `src/services/dataProcessingService.ts` (line 157) |
| Chart sub-sections | `src/components/charts/*.tsx` (line ~108-113) |

### Key Service Methods

| Method | Location | Purpose |
|--------|----------|---------|
| `calculateKPIs()` | `dataProcessingService.ts` | Calculate KPI metrics |
| `calculateDepartmentTotals()` | `dataProcessingService.ts` | Calculate single department totals |
| `calculateMainDepartmentTotals()` | `dataProcessingService.ts` | Calculate department with sub-sections |
| `calculateAnalytics()` | `dataProcessingService.ts` | Calculate analytics |

### Main Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `KPISection` | `src/components/KPISection.tsx` | Display KPI cards |
| `DepartmentsSection` | `src/components/DepartmentsSection.tsx` | Display department cards |
| `DepartmentModal` | `src/components/DepartmentModal.tsx` | Show department details |
| `AnalyticsSection` | `src/components/AnalyticsSection.tsx` | Show performance insights |
| `ChartsSection` | `src/components/ChartsSection.tsx` | Display all charts |

### Common File Modifications

When making changes, you typically need to modify:

1. **Adding Department**: `src/types/index.ts`
2. **Adding Sub-Section**: 
   - `src/services/dataProcessingService.ts`
   - `src/components/charts/DepartmentPerformanceChart.tsx`
   - `src/components/charts/PaymentMethodChart.tsx`
   - `src/components/DepartmentModal.tsx`
3. **Changing Order**: `src/types/index.ts`
4. **Styling**: Component's `.module.css` file
5. **Calculations**: `src/services/dataProcessingService.ts`

---

## Troubleshooting

### Department Not Showing

1. Check if department is in `ALL_DEPARTMENTS` array
2. Verify department name matches Google Sheets exactly (case-sensitive)
3. Check browser console for errors

### Sub-Section Not Showing

1. Check if sub-section is in `dataProcessingService.ts` sub-sections array
2. Check if sub-section is in chart components' sub-sections arrays
3. Verify UI block exists in `DepartmentModal.tsx`
4. Verify sub-section name matches Google Sheets exactly

### Data Not Updating

1. Check Google Sheets connection
2. Verify data format in Google Sheets
3. Check date format (MM/DD/YYYY)
4. Verify department names match exactly

### Styling Issues

1. Check CSS class names match
2. Verify CSS Module imports
3. Check for conflicting styles
4. Verify responsive styles

---

## Testing Checklist

After making changes, test the following:

- [ ] Department appears in DepartmentsSection
- [ ] Department data is calculated correctly
- [ ] Department appears in chart filters
- [ ] Sub-sections appear in modal
- [ ] Sub-section data is calculated correctly
- [ ] Date filtering works correctly
- [ ] Charts update with new data
- [ ] Styling looks correct on desktop and mobile
- [ ] No console errors
- [ ] No TypeScript errors

---

## Additional Resources

### Environment Variables

Required environment variables (in `.env` file):
```
REACT_APP_GOOGLE_SHEETS_API_KEY=your_api_key
REACT_APP_INCOME_SPREADSHEET_ID=your_sheet_id
REACT_APP_INCOME_SHEET_RANGE=Sheet1!A1:D1000
REACT_APP_REFRESH_INTERVAL=300000
```

### Google Sheets Format

Expected Google Sheets format:
- **Date**: MM/DD/YYYY format
- **Department**: Exact match with `ALL_DEPARTMENTS` or sub-section names
- **Cash**: Numeric value
- **Online**: Numeric value

### Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## Conclusion

This guide provides a comprehensive overview of the codebase structure and common change scenarios. When making changes:

1. **Identify the type of change** (department, sub-section, styling, etc.)
2. **Follow the step-by-step instructions** for that scenario
3. **Update all related files** as specified
4. **Test thoroughly** using the checklist
5. **Verify Google Sheets** data matches your changes

For questions or issues, refer to this guide or check the code comments in the relevant files.

---

**Last Updated**: 2025
**Version**: 2.0.0

