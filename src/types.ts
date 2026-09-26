export type UserRole = 'ADMIN' | 'AGENT';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  status: UserStatus;
  totalSales: number;
  totalPaid: number;
  currentDue: number;
  email?: string;
  address?: string;
  joinedDate: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  unit?: UnitType;
  retailPriceKg?: number | null;
  retailPricePcs?: number | null;
  wholesalePriceKg?: number | null;
  wholesalePricePcs?: number | null;
  stockKg: number;
  stockPcs: number;
  lowStockThresholdKg: number;
  lowStockThresholdPcs: number;
  active: boolean;
  updatedAt?: string;
}

export type SaleType = 'RETAIL' | 'WHOLESALE';
export type UnitType = 'KG' | 'PCS';

export function getProductUnit(p: Partial<Product> | null | undefined): UnitType {
  if (!p) return 'KG';
  if (p.unit === 'KG' || p.unit === 'PCS') return p.unit;

  const hasKgPrice = Boolean((p.retailPriceKg && p.retailPriceKg > 0) || (p.wholesalePriceKg && p.wholesalePriceKg > 0));
  const hasPcsPrice = Boolean((p.retailPricePcs && p.retailPricePcs > 0) || (p.wholesalePricePcs && p.wholesalePricePcs > 0));

  if (hasKgPrice && !hasPcsPrice) return 'KG';
  if (hasPcsPrice && !hasKgPrice) return 'PCS';

  const hasKgStock = (p.stockKg ?? 0) > 0 || (p.lowStockThresholdKg ?? 0) > 0;
  const hasPcsStock = (p.stockPcs ?? 0) > 0 || (p.lowStockThresholdPcs ?? 0) > 0;
  if (hasPcsStock && !hasKgStock) return 'PCS';
  if (hasKgStock && !hasPcsStock) return 'KG';

  return 'KG';
}

export function getProductStockValue(p: Partial<Product> | null | undefined): number {
  if (!p) return 0;
  const unit = getProductUnit(p);
  return unit === 'KG' ? (p.stockKg ?? 0) : (p.stockPcs ?? 0);
}

export function getProductThresholdValue(p: Partial<Product> | null | undefined): number {
  if (!p) return 0;
  const unit = getProductUnit(p);
  return unit === 'KG' ? (p.lowStockThresholdKg ?? 0) : (p.lowStockThresholdPcs ?? 0);
}

export function isProductLowStock(p: Partial<Product> | null | undefined): boolean {
  if (!p) return false;
  const unit = getProductUnit(p);
  const stock = unit === 'KG' ? (p.stockKg ?? 0) : (p.stockPcs ?? 0);
  const threshold = unit === 'KG' ? (p.lowStockThresholdKg ?? 0) : (p.lowStockThresholdPcs ?? 0);
  return stock <= threshold;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  agentId: string;
  agentName: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  saleType: SaleType;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  createdAtDate: string;
  createdAtTime: string;
  timestamp: number;
}

export type StockTransactionType = 'INITIAL' | 'STOCK_IN' | 'STOCK_OUT' | 'SALE' | 'SALE_OUT' | 'ADJUSTMENT' | 'RETURN';

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: StockTransactionType;
  quantity: number;
  unit: UnitType;
  referenceNote?: string;
  recordedBy: string;
  date: string;
  time: string;
  timestamp: number;
  createdAtDate?: string;
  createdAtTime?: string;
  stockBefore?: number;
  stockAfter?: number;
}

export interface PaymentRecord {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  previousDue: number;
  remainingDue: number;
  paymentMethod: string;
  referenceNote?: string;
  recordedBy: string;
  date: string;
  time: string;
  timestamp: number;
  createdAtDate?: string;
  createdAtTime?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'AGENT_REGISTERED' | 'LOW_STOCK' | 'PAYMENT_RECEIVED' | 'NEW_SALE';
  isRead: boolean;
  date: string;
  time: string;
  targetRole: 'ADMIN' | 'AGENT' | 'ALL';
  agentId?: string;
  timestamp: number;
}

export interface AdminLog {
  id: string;
  user: string;
  role: string;
  action: string;
  referenceId: string;
  details: string;
  date: string;
  time: string;
  timestamp: number;
}

export interface BusinessSettings {
  businessName: string;
  subtitle: string;
  phone: string;
  address: string;
  currency: string;
  invoiceFooter: string;
  googleAppsScriptUrl: string;
  timezone: string;
  lowStockDefaultKg: number;
  lowStockDefaultPcs: number;
}

export interface MongoStatus {
  connected: boolean;
  database: string;
  hasUri: boolean;
  maskedUri?: string;
  counts?: {
    products: number;
    users: number;
    sales: number;
    stockTransactions: number;
    payments: number;
    logs: number;
    notifications: number;
  };
  error?: string | null;
  lastChecked?: string;
  source: 'mongodb' | 'local';
}
