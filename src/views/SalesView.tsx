import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SaleType } from '../types';
import { ShoppingCart, Search, FileText, ShoppingBag, Filter, Calendar } from 'lucide-react';

export const SalesView: React.FC = () => {
  const {
    sales,
    currentUser,
    setSelectedSaleForInvoice,
    setIsInvoiceModalOpen,
    setIsSellModalOpen,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<'ALL' | SaleType>('ALL');

  // Filter sales
  const relevantSales = isAdmin ? sales : sales.filter((s) => s.agentId === currentUser?.id);

  const filteredSales = useMemo(() => {
    return relevantSales.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        s.invoiceNo.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.agentName && s.agentName.toLowerCase().includes(q));
      if (!matchSearch) return false;

      if (saleTypeFilter !== 'ALL' && s.saleType !== saleTypeFilter) return false;
      return true;
    });
  }, [relevantSales, search, saleTypeFilter]);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const retailCount = filteredSales.filter((s) => s.saleType === 'RETAIL').length;
  const wholesaleCount = filteredSales.filter((s) => s.saleType === 'WHOLESALE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'All Sales Orders & Invoices' : 'My Sales Orders & Cash Memos'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {isAdmin
              ? 'Complete sales history, digital cash memos, and itemized customer billing'
              : 'Keep track of all your confirmed retail and wholesale sales'}
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>SELL PRODUCT</span>
          </button>
        )}
      </div>

      {/* Summary KPI chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card p-4 sm:p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Filtered Sales</span>
          <div className="text-2xl font-black text-purple-900 mt-1 flex items-baseline gap-0.5">
            <span className="font-black select-none">৳</span>
            <span>{totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">{filteredSales.length} total orders</p>
        </div>

        <div className="app-card p-4 sm:p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Retail Orders (খুচরা)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{retailCount} Orders</div>
          <p className="text-[11px] text-slate-600 mt-0.5">End-consumer purchases</p>
        </div>

        <div className="app-card p-4 sm:p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Wholesale Orders (পাইকারি)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{wholesaleCount} Orders</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Bulk dealer store supply</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer or executive..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'RETAIL', 'WHOLESALE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSaleTypeFilter(t)}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate sm:whitespace-nowrap ${
                saleTypeFilter === t
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Invoices' : t === 'RETAIL' ? 'Retail (খুচরা)' : 'Wholesale (পাইকারি)'}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Invoices List: Responsive Mobile Cards (sm:hidden) + Desktop Table (hidden sm:block) */}
      <div>
        {/* Mobile View: Distinct Individual Elevated Cards */}
        <div className="sm:hidden space-y-3.5">
          {filteredSales.length === 0 ? (
            <div className="app-card p-8 text-center text-xs text-slate-500 rounded-2xl">
              No invoices found matching criteria.
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div key={sale.id} className="app-card p-4 rounded-2xl space-y-3.5 border border-slate-200/90 shadow-sm">
                {/* Header: Invoice No + Sale Type */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900 block">{sale.invoiceNo}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {sale.createdAtDate} • {sale.createdAtTime}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                      sale.saleType === 'RETAIL'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {sale.saleType === 'RETAIL' ? 'Retail (খুচরা)' : 'Wholesale (পাইকারি)'}
                  </span>
                </div>

                {/* Info Card: Distinct Elevated Details Box */}
                <div className="app-box p-3.5 rounded-xl space-y-2 text-xs">
                  {isAdmin && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] font-semibold">Executive:</span>
                      <span className="font-bold text-purple-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {sale.agentName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] font-semibold">Customer:</span>
                    <span className="font-bold text-slate-800 text-right">
                      {sale.customerName || 'Direct Customer'}
                      {sale.customerPhone && <span className="text-slate-500 text-[10px] font-mono ml-1">({sale.customerPhone})</span>}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/90">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                      Ordered Items
                    </span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed bg-white p-2 rounded-lg border border-slate-200/90 shadow-2xs">
                      {sale.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Grand Total + Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grand Total</span>
                    <div className="text-lg font-black text-slate-900 flex items-baseline gap-0.5">
                      <span className="font-black select-none">৳</span>
                      <span>{sale.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSaleForInvoice(sale);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Memo</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Data Table in Elevated Card */}
        <div className="hidden sm:block app-card rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date & Time</th>
                {isAdmin && <th className="py-3 px-4">Executive Name</th>}
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Cash Memo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{sale.invoiceNo}</td>

                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{sale.createdAtDate}</div>
                    <div className="text-[10px] text-slate-600">{sale.createdAtTime}</div>
                  </td>

                  {isAdmin && (
                    <td className="py-3 px-4 font-bold text-purple-900 whitespace-nowrap">
                      {sale.agentName}
                    </td>
                  )}

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{sale.customerName || 'Direct Customer'}</div>
                    {sale.customerPhone && (
                      <div className="text-[10px] text-slate-600">{sale.customerPhone}</div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.saleType === 'RETAIL'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {sale.saleType}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs truncate text-slate-700 font-medium">
                    {sale.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                  </td>

                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    <span className="font-black select-none">৳</span>
                    <span>{sale.grandTotal.toLocaleString()}</span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedSaleForInvoice(sale);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Memo</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
