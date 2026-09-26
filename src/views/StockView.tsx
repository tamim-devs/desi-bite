import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StockTransaction, isProductLowStock } from '../types';
import {
  Boxes,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Undo2,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { stockTransactions, products, setIsStockModalOpen, currentUser, deleteStockTransaction } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [txToDelete, setTxToDelete] = useState<StockTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Overview metrics
  const totalStockKg = products.reduce((acc, p) => acc + p.stockKg, 0);
  const totalStockPcs = products.reduce((acc, p) => acc + p.stockPcs, 0);
  const lowStockCount = products.filter(isProductLowStock).length;

  const filteredTransactions = useMemo(() => {
    return stockTransactions.filter((tx) => {
      const matchSearch = tx.productName.toLowerCase().includes(search.toLowerCase().trim());
      if (!matchSearch) return false;

      if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
      return true;
    });
  }, [stockTransactions, search, selectedType]);

  const handleDeleteTx = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    await deleteStockTransaction(txToDelete.id);
    setIsDeleting(false);
    setTxToDelete(null);
  };

  const getTxDate = (tx: StockTransaction) => {
    if (tx.date) return tx.date;
    if (tx.createdAtDate) return tx.createdAtDate;
    if (tx.timestamp) {
      return new Date(tx.timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return 'Recent';
  };

  const getTxTime = (tx: StockTransaction) => {
    if (tx.time) return tx.time;
    if (tx.createdAtTime) return tx.createdAtTime;
    if (tx.timestamp) {
      return new Date(tx.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return '';
  };

  const getActionTypeBadge = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return {
          style: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
          icon: <ArrowDownRight className="w-3 h-3 shrink-0" />,
          isPositive: true,
        };
      case 'SALE':
      case 'SALE_OUT':
        return {
          style: 'bg-purple-100 text-purple-800 border border-purple-200/60',
          icon: <ArrowUpRight className="w-3 h-3 shrink-0" />,
          isPositive: false,
        };
      case 'RETURN':
        return {
          style: 'bg-indigo-100 text-indigo-800 border border-indigo-200/60',
          icon: <Undo2 className="w-3 h-3 shrink-0" />,
          isPositive: true,
        };
      case 'ADJUSTMENT':
      default:
        return {
          style: 'bg-amber-100 text-amber-800 border border-amber-200/60',
          icon: <RefreshCw className="w-3 h-3 shrink-0" />,
          isPositive: false,
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Stock Management & Ledger</h2>
          <p className="text-xs text-slate-600 font-medium">
            Real-time warehouse inventory audits, factory arrivals, and sales deductions
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Stock Change</span>
          </button>
        )}
      </div>

      {/* Top Metrics Row - Optimized for Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="app-card p-3 sm:p-4.5 rounded-xl sm:rounded-2xl">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Stock (KG)
          </span>
          <div className="text-lg sm:text-2xl font-black text-purple-900 mt-1 truncate">
            {totalStockKg.toLocaleString()} KG
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
            Across {products.length} products
          </p>
        </div>

        <div className="app-card p-3 sm:p-4.5 rounded-xl sm:rounded-2xl">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Stock (PCS)
          </span>
          <div className="text-lg sm:text-2xl font-black text-indigo-900 mt-1 truncate">
            {totalStockPcs.toLocaleString()} PCS
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
            Individually packaged pieces
          </p>
        </div>

        <div className="app-card p-3 sm:p-4.5 rounded-xl sm:rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider block truncate">
            Low Stock Alert
          </span>
          <div
            className={`text-lg sm:text-2xl font-black mt-1 truncate ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {lowStockCount} Products
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
            Below reorder alert limit
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products in ledger..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-slate-300/90 focus:outline-hidden focus:border-purple-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar -mx-1 px-1">
          {['ALL', 'STOCK_IN', 'SALE', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedType === t
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {t === 'ALL' ? 'ALL' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Transactions Audit Ledger */}
      <div className="app-card rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Inventory Ledger Audit History</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Real-time audited movement of warehouse goods</p>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl whitespace-nowrap">
            {filteredTransactions.length} records
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Stock Transactions Recorded</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Previous records have been cleared. When you perform a stock in, the record will automatically appear here.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsStockModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Stock In Now</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Responsive Card View */}
            <div className="sm:hidden p-3 space-y-2.5">
              {filteredTransactions.map((tx) => {
                const txDate = getTxDate(tx);
                const txTime = getTxTime(tx);
                const { style: badgeStyle, icon: typeIcon, isPositive } = getActionTypeBadge(tx.type);
                const hasFlow = tx.stockBefore !== undefined && tx.stockAfter !== undefined;

                return (
                  <div key={tx.id} className="app-box p-3 rounded-xl space-y-2">
                    {/* Top Row: Date & Time + Action Type Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-bold text-slate-900">{txDate}</span>
                        {txTime && <span className="text-slate-500 font-normal text-[11px]">• {txTime}</span>}
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badgeStyle}`}>
                        {typeIcon}
                        <span>{tx.type.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Middle Row: Product Name + Quantity Change */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                          {tx.productName}
                        </h4>
                        {hasFlow ? (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>Flow:</span>
                            <span>{tx.stockBefore}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <strong className="text-slate-800">{tx.stockAfter} {tx.unit}</strong>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 mt-0.5 block">Unit: {tx.unit}</span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm sm:text-base font-black font-mono ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : '-'}
                          {tx.quantity} {tx.unit}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Recorded By & Delete button for Admin */}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/80">
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          By: <strong className="text-slate-700 font-semibold">{tx.recordedBy}</strong>
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-center">Stock Flow</th>
                    <th className="py-3 px-4">Recorded By</th>
                    {isAdmin && <th className="py-3 px-4 text-center w-16">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const txDate = getTxDate(tx);
                    const txTime = getTxTime(tx);
                    const { style: badgeStyle, icon: typeIcon, isPositive } = getActionTypeBadge(tx.type);
                    const hasFlow = tx.stockBefore !== undefined && tx.stockAfter !== undefined;

                    return (
                      <tr key={tx.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{txDate}</span>
                          </div>
                          {txTime && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 pl-5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{txTime}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-extrabold text-slate-900">{tx.productName}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}
                          >
                            {typeIcon}
                            <span>{tx.type.replace('_', ' ')}</span>
                          </span>
                        </td>

                        <td
                          className={`py-3 px-4 text-right font-extrabold font-mono ${
                            isPositive ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isPositive ? '+' : '-'}
                          {tx.quantity} {tx.unit}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-slate-600 whitespace-nowrap">
                          {hasFlow ? (
                            <div className="inline-flex items-center gap-1">
                              <span>{tx.stockBefore}</span>
                              <span className="text-slate-400">&rarr;</span>
                              <span className="font-bold text-slate-900">{tx.stockAfter}</span>
                              <span className="text-[10px] text-slate-500">{tx.unit}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{tx.recordedBy}</td>

                        {isAdmin && (
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setTxToDelete(tx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-rose-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900">Delete Stock Record?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to remove this ledger entry for{' '}
              <strong className="text-slate-900 font-bold">{txToDelete.productName}</strong> ({txToDelete.quantity}{' '}
              {txToDelete.unit})? This will remove it from the audit ledger.
            </p>
            <div className="flex gap-2 justify-end mt-5">
              <button
                disabled={isDeleting}
                onClick={() => setTxToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteTx}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
