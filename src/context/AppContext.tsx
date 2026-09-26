import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Product,
  Sale,
  StockTransaction,
  PaymentRecord,
  AppNotification,
  AdminLog,
  BusinessSettings,
  SaleType,
  SaleItem,
  UnitType,
  StockTransactionType,
  MongoStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_SALES,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LOGS,
  INITIAL_SETTINGS,
} from '../data/seedData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  products: Product[];
  users: User[];
  sales: Sale[];
  stockTransactions: StockTransaction[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  logs: AdminLog[];
  settings: BusinessSettings;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Modals
  isSellModalOpen: boolean;
  setIsSellModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  isStockModalOpen: boolean;
  setIsStockModalOpen: (open: boolean) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  isGoogleSheetModalOpen: boolean;
  setIsGoogleSheetModalOpen: (open: boolean) => void;
  isMongoModalOpen: boolean;
  setIsMongoModalOpen: (open: boolean) => void;
  mongoStatus: MongoStatus | null;
  checkMongoStatus: () => Promise<MongoStatus | null>;
  connectMongo: (uri: string) => Promise<{ success: boolean; message: string }>;
  syncMongo: (direction?: 'push' | 'pull') => Promise<{ success: boolean; message: string }>;

  selectedSaleForInvoice: Sale | null;
  setSelectedSaleForInvoice: (sale: Sale | null) => void;
  selectedAgentForPayment: User | null;
  setSelectedAgentForPayment: (agent: User | null) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;

  // Actions
  login: (phone: string, pass: string) => Promise<boolean>;
  registerAgent: (data: { name: string; phone: string; password: string; address?: string }) => Promise<boolean>;
  logout: () => void;
  createSale: (data: {
    saleType: SaleType;
    items: SaleItem[];
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    discount?: number;
    assignedAgentId?: string;
    paymentStatus?: 'PAID' | 'UNPAID';
  }) => Promise<Sale | null>;
  recordPayment: (data: {
    agentId: string;
    amount: number;
    paymentMethod: string;
    referenceNote?: string;
  }) => Promise<boolean>;
  saveProduct: (prodData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  recordStockChange: (data: {
    productId: string;
    type: StockTransactionType;
    quantity: number;
    unit: UnitType;
    referenceNote?: string;
  }) => Promise<boolean>;
  deleteStockTransaction: (id: string) => Promise<boolean>;
  updateAgentStatus: (agentId: string, status: 'ACTIVE' | 'REJECTED' | 'SUSPENDED') => Promise<boolean>;
  markNotificationsAsRead: () => Promise<void>;
  syncWithGoogleSheets: (scriptUrl?: string) => Promise<boolean>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<boolean>;
  updateProfile: (data: { email?: string; address?: string }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      // Strictly require authentication: shared links or fresh sessions default to null (Login page)
      const sessionUser = sessionStorage.getItem('deshi_bite_user');
      if (sessionUser) return JSON.parse(sessionUser);
      return null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(() =>
    INITIAL_USERS.map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    })
  );
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [logs, setLogs] = useState<AdminLog[]>(INITIAL_LOGS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [mongoStatus, setMongoStatus] = useState<MongoStatus | null>(null);

  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [selectedAgentForPayment, setSelectedAgentForPayment] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const checkMongoStatus = async (): Promise<MongoStatus | null> => {
    try {
      const res = await fetch('/api/mongodb/status');
      if (res.ok) {
        const data = await res.json();
        setMongoStatus(data);
        return data;
      }
    } catch (e) {
      console.warn('Failed to check MongoDB status:', e);
    }
    return null;
  };

  const connectMongo = async (uri: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri }),
      });
      const data = await res.json();
      if (data.status) {
        setMongoStatus(data.status);
      }
      if (data.success) {
        showToast(data.message || 'Connected to MongoDB Atlas Cloud!', 'success');
        await refreshData();
      } else {
        showToast(data.message || 'Failed to connect to MongoDB', 'error');
      }
      setLoading(false);
      return { success: data.success, message: data.message };
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Network error connecting to MongoDB';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const syncMongo = async (direction: 'push' | 'pull' = 'push'): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/mongodb/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'MongoDB Cloud sync completed!', 'success');
        await refreshData();
        await checkMongoStatus();
      } else {
        showToast(data.error || 'MongoDB Cloud sync failed', 'error');
      }
      setLoading(false);
      return { success: data.success, message: data.message || data.error };
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Sync failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch full state from server on mount
  const refreshData = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || INITIAL_PRODUCTS);
        setUsers(data.users || INITIAL_USERS);
        setSales(data.sales || INITIAL_SALES);
        setStockTransactions(data.stockTransactions || INITIAL_STOCK_TRANSACTIONS);
        setPayments(data.payments || INITIAL_PAYMENTS);
        setNotifications(data.notifications || INITIAL_NOTIFICATIONS);
        setLogs(data.logs || INITIAL_LOGS);
        if (data.settings) setSettings(data.settings);

        // Also update currentUser if currently logged in
        if (currentUser) {
          const freshUser = (data.users || []).find((u: User) => u.id === currentUser.id);
          if (freshUser) {
            setCurrentUser(freshUser);
            sessionStorage.setItem('deshi_bite_user', JSON.stringify(freshUser));
          }
        }
      }
    } catch (e) {
      console.warn('Using client-side store:', e);
    }
  };

  useEffect(() => {
    // Clear any legacy persistent storage so previously leaked sessions are cleanly revoked
    try {
      localStorage.removeItem('deshi_bite_user');
    } catch (e) {
      // ignore
    }
    refreshData();
    checkMongoStatus();
  }, []);

  const login = async (phone: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: pass.trim() }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        showToast(data?.error || `Login failed (${res.status}). Please check credentials.`, 'error');
        setLoading(false);
        return false;
      }

      setCurrentUser(data.user);
      sessionStorage.setItem('deshi_bite_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      setActiveTab('dashboard');
      setLoading(false);
      return true;
    } catch (err: any) {
      showToast('Network error while connecting to authentication service. Please check your connection.', 'error');
      setLoading(false);
      return false;
    }
  };

  const registerAgent = async (data: { name: string; phone: string; password: string; address?: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const resData = isJson ? await res.json() : null;

      if (!res.ok) {
        showToast(resData?.error || 'Registration failed', 'error');
        setLoading(false);
        return false;
      }
      showToast(resData?.message || 'Registration submitted! Please await Admin approval.', 'success');
      await refreshData();
      setLoading(false);
      return true;
    } catch (err: any) {
      showToast('Registration error occurred. Please try again.', 'error');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('deshi_bite_user');
    localStorage.removeItem('deshi_bite_user');
    showToast('Logged out successfully', 'info');
  };

  const createSale = async (saleData: {
    saleType: SaleType;
    items: SaleItem[];
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    discount?: number;
    assignedAgentId?: string;
    paymentStatus?: 'PAID' | 'UNPAID';
  }): Promise<Sale | null> => {
    if (!currentUser) {
      showToast('Please sign in to record a sale', 'error');
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentUser.id,
          ...saleData,
        }),
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        showToast(data?.error || `Unable to record sale (${res.status})`, 'error');
        setLoading(false);
        return null;
      }

      showToast(`Sale confirmed! Invoice ${data.sale.invoiceNo} generated`, 'success');
      await refreshData();
      setLoading(false);
      return data.sale;
    } catch (err: any) {
      showToast('Network error while recording sale. Please check your connection.', 'error');
      setLoading(false);
      return null;
    }
  };

  const recordPayment = async (data: {
    agentId: string;
    amount: number;
    paymentMethod: string;
    referenceNote?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recordedBy: currentUser?.name || 'Admin Manager',
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to record payment', 'error');
        setLoading(false);
        return false;
      }
      showToast(`Payment of ৳${data.amount.toLocaleString()} successfully recorded!`, 'success');
      await refreshData();
      setLoading(false);
      return true;
    } catch (e: any) {
      showToast('Failed to record payment', 'error');
      setLoading(false);
      return false;
    }
  };

  const saveProduct = async (prodData: Partial<Product>): Promise<boolean> => {
    setLoading(true);
    try {
      const isEdit = Boolean(prodData.id);
      const url = isEdit ? `/api/products/${prodData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Error saving product', 'error');
        setLoading(false);
        return false;
      }

      showToast(`Product "${data.product.name}" saved successfully!`, 'success');
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error connecting to server', 'error');
      setLoading(false);
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete product', 'error');
        setLoading(false);
        return false;
      }
      showToast(data.message || 'Product deleted successfully!', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error connecting to server', 'error');
      setLoading(false);
      return false;
    }
  };

  const deleteAgent = async (agentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to remove executive', 'error');
        setLoading(false);
        return false;
      }
      showToast(data.message || 'Executive removed successfully!', 'success');
      setUsers((prev) => prev.filter((u) => u.id !== agentId));
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error connecting to server', 'error');
      setLoading(false);
      return false;
    }
  };

  const recordStockChange = async (data: {
    productId: string;
    type: StockTransactionType;
    quantity: number;
    unit: UnitType;
    referenceNote?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recordedBy: currentUser?.name || 'Admin Manager',
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to update stock', 'error');
        setLoading(false);
        return false;
      }
      showToast(`Stock updated: ${data.type} of ${data.quantity} ${data.unit}`, 'success');
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Stock change error', 'error');
      setLoading(false);
      return false;
    }
  };

  const deleteStockTransaction = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to delete transaction', 'error');
        setLoading(false);
        return false;
      }
      showToast('Stock transaction removed', 'success');
      setStockTransactions((prev) => prev.filter((tx) => tx.id !== id));
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Failed to delete transaction', 'error');
      setLoading(false);
      return false;
    }
  };

  const updateAgentStatus = async (agentId: string, status: 'ACTIVE' | 'REJECTED' | 'SUSPENDED'): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminName: currentUser?.name || 'Admin' }),
      });
      if (!res.ok) {
        showToast('Failed to update executive status', 'error');
        setLoading(false);
        return false;
      }
      if (status === 'REJECTED') {
        showToast('Executive registration rejected and removed from system', 'info');
        setUsers((prev) => prev.filter((u) => u.id !== agentId));
      } else {
        showToast(`Executive status updated to ${status}`, 'success');
      }
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error updating executive', 'error');
      setLoading(false);
      return false;
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // client update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const syncWithGoogleSheets = async (scriptUrl?: string): Promise<boolean> => {
    const url = scriptUrl || settings.googleAppsScriptUrl;
    if (!url) {
      showToast('Please enter your deployed Google Apps Script Web App URL first', 'error');
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sync/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Google Sheets sync failed. Check URL permissions.', 'error');
        setLoading(false);
        return false;
      }
      showToast('Google Sheets synchronized successfully!', 'success');
      setLoading(false);
      return true;
    } catch (e: any) {
      showToast('Error connecting to Google Sheets endpoint', 'error');
      setLoading(false);
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        showToast('Settings saved successfully', 'success');
        return true;
      }
      return false;
    } catch (e) {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      showToast('Settings saved', 'success');
      return true;
    }
  };

  const updateProfile = async (data: { email?: string; address?: string }): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to update profile', 'error');
        setLoading(false);
        return false;
      }
      showToast(resData.message || 'Profile updated successfully!', 'success');
      if (resData.user) {
        setCurrentUser(resData.user);
        sessionStorage.setItem('deshi_bite_user', JSON.stringify(resData.user));
      }
      await refreshData();
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error connecting to server', 'error');
      setLoading(false);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword,
          newPassword,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to change password', 'error');
        setLoading(false);
        return false;
      }
      showToast(resData.message || 'Password changed successfully!', 'success');
      setLoading(false);
      return true;
    } catch (e) {
      showToast('Error connecting to server', 'error');
      setLoading(false);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        products,
        users,
        sales,
        stockTransactions,
        payments,
        notifications,
        logs,
        settings,
        loading,
        activeTab,
        setActiveTab,
        toasts,
        showToast,
        removeToast,
        isSellModalOpen,
        setIsSellModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isProductModalOpen,
        setIsProductModalOpen,
        isStockModalOpen,
        setIsStockModalOpen,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isGoogleSheetModalOpen,
        setIsGoogleSheetModalOpen,
        isMongoModalOpen,
        setIsMongoModalOpen,
        mongoStatus,
        checkMongoStatus,
        connectMongo,
        syncMongo,
        selectedSaleForInvoice,
        setSelectedSaleForInvoice,
        selectedAgentForPayment,
        setSelectedAgentForPayment,
        editingProduct,
        setEditingProduct,
        login,
        registerAgent,
        logout,
        createSale,
        recordPayment,
        saveProduct,
        deleteProduct,
        deleteAgent,
        recordStockChange,
        deleteStockTransaction,
        updateAgentStatus,
        markNotificationsAsRead,
        syncWithGoogleSheets,
        updateSettings,
        updateProfile,
        changePassword,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
