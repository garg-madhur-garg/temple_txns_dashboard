import React, { useEffect } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { DateFilterBar } from './components/DateFilterBar';
import { KPISection } from './components/KPISection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { ChartsSection } from './components/ChartsSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { BankDetailsSection } from './components/BankDetailsSection';
import { DataTableSection } from './components/DataTableSection';
import { ShareModal } from './components/ShareModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { MessageContainer } from './components/MessageContainer';
import { ThemeProvider } from './contexts/ThemeContext';
import { useIncomeData } from './hooks/useIncomeData';
import { useFilters } from './hooks/useFilters';
import { useConnection } from './hooks/useConnection';
import { useMessages } from './hooks/useMessages';
import { useBankDetails } from './hooks/useBankDetails';
import { bankDetailsConfig } from './config/bankDetailsConfig';
import styles from './App.module.css';

/**
 * MAIN APP COMPONENT - ENHANCED WITH DATE RANGE SUPPORT
 * =====================================================
 * 
 * Main React component for the Temple Transactions Dashboard.
 * Enhanced to support date range filtering functionality.
 * 
 * @author Temple Management System
 * @lastUpdated 2025
 */

function App() {
  const { data, loading, refresh } = useIncomeData();
  const { currentFilter, setFilter, setDateRange, filteredData } = useFilters(data);
  const { connectionState, connect, disconnect, sync } = useConnection();
  const { messages, addMessage, removeMessage } = useMessages();
  const { data: bankDetails, loading: bankLoading } = useBankDetails(bankDetailsConfig);

  // Auto-connect to Google Sheets on app load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const config = {
          apiKey: 'AIzaSyCndZeCj6CHI3c4aZ0NhllTEbBev6Mg3mg',
          spreadsheetId: '1sIKmerb68mazwhs4DUE3XQK9vvsKxUi7tBD6DPSrrcI',
          range: 'Sheet1!A:E',
          refreshInterval: 30000
        };
        await connect(config);
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    };
    
    autoConnect();
  }, [connect]);

  const handleSync = async () => {
    try {
      await sync();
      addMessage('Data synchronized successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      addMessage(errorMessage, 'error');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      addMessage('Data refreshed successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      addMessage(errorMessage, 'error');
    }
  };

  return (
    <ThemeProvider>
      <div className={styles.app}>
        <DashboardHeader 
          connectionState={connectionState}
          onSync={handleSync}
          onRefresh={handleRefresh}
        />
        
        <DateFilterBar 
          currentFilter={currentFilter}
          onFilterChange={setFilter}
          onDateRangeChange={setDateRange}
          dataCount={filteredData.length}
        />
        
        <main className={styles.dashboardMain}>
          <div className={styles.container}>
            <KPISection data={filteredData} />
            <DepartmentsSection data={filteredData} />
            <ChartsSection data={filteredData} />
            <AnalyticsSection data={data} />
            <BankDetailsSection data={bankDetails} />
            <DataTableSection data={filteredData} />
          </div>
        </main>
        
        <ShareModal />
        <LoadingOverlay visible={loading || bankLoading} />
        <MessageContainer messages={messages} onRemove={removeMessage} />
      </div>
    </ThemeProvider>
  );
}

export default App;
