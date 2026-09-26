import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
import { MobileBottomNav } from './components/MobileBottomNav';

// Modals
import { SellModal } from './components/SellModal';
import { PaymentModal } from './components/PaymentModal';
import { ProductModal } from './components/ProductModal';
import { StockModal } from './components/StockModal';
import { InvoiceModal } from './components/InvoiceModal';
import { NotificationModal } from './components/NotificationModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { MongoModal } from './components/MongoModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { StockView } from './views/StockView';
import { SalesView } from './views/SalesView';
import { DueView } from './views/DueView';
import { AgentsView } from './views/AgentsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center">
        <ToastContainer />
        <LoginView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-hidden w-full">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-36 sm:pb-28 lg:pb-12 space-y-5 sm:space-y-6">
        {/* Navigation Tabs (Desktop) */}
        <NavigationTabs />

        {/* Dynamic Tab Render with Role-Based Access Control */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'stock' && (currentUser.role === 'ADMIN' ? <StockView /> : <DashboardView />)}
        {activeTab === 'sales' && <SalesView />}
        {activeTab === 'due' && <DueView />}
        {activeTab === 'agents' && (currentUser.role === 'ADMIN' ? <AgentsView /> : <DashboardView />)}
        {activeTab === 'reports' && (currentUser.role === 'ADMIN' ? <ReportsView /> : <DashboardView />)}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Bottom Bar */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <SellModal />
      <PaymentModal />
      <ProductModal />
      <StockModal />
      <InvoiceModal />
      <NotificationModal />
      <GoogleSheetModal />
      <MongoModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
