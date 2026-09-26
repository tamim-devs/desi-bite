import React from 'react';
import { useApp } from '../context/AppContext';
import { Banner } from '../components/Banner';
import { StatCards } from '../components/StatCards';
import { WeeklySalesChart } from '../components/WeeklySalesChart';
import { getProductUnit, getProductStockValue, isProductLowStock } from '../types';
import {
  Package,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Database,
  Cloud,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    sales,
    products,
    users,
    setSelectedSaleForInvoice,
    setIsInvoiceModalOpen,
    setActiveTab,
    setIsStockModalOpen,
    updateAgentStatus,
    mongoStatus,
    setIsMongoModalOpen,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Relevant sales
  const relevantSales = isAdmin ? sales : sales.filter((s) => s.agentId === currentUser?.id);
  const recentSales = [...relevantSales].slice(0, 5);

  // Pending agents for Admin
  const pendingAgents = users.filter((u) => u.role === 'AGENT' && u.status === 'PENDING');

  // Low stock products
  const lowStockItems = products.filter(isProductLowStock);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Banner />

      {/* Pending Agent Registration Alert Banner for Admin */}
      {isAdmin && pendingAgents.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">
                {pendingAgents.length} Executive Registration{pendingAgents.length > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-[11px] text-amber-700">
                {pendingAgents.map((a) => `${a.name} (${a.phone})`).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateAgentStatus(pendingAgents[0].id, 'ACTIVE')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Approve First ({pendingAgents[0].name})
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Numerical Stat Cards */}
      <StatCards />

      {/* MongoDB Cloud Database Persistence Indicator - Admin Only */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 mr-2">
                Cloud Database Engine:
              </span>
              <span className="text-slate-600 font-medium">
                {mongoStatus?.connected ? (
                  <span className="text-emerald-800 font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    MongoDB Atlas Cloud (DB: {mongoStatus.database}) • Real-time Sync Active
                  </span>
                ) : (
                  <span className="text-slate-600">
                    Local Memory & Storage Mode (MongoDB Atlas Driver Ready)
                  </span>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMongoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer w-fit"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{mongoStatus?.connected ? 'Manage MongoDB Atlas' : 'Connect MongoDB Atlas'}</span>
          </button>
        </div>
      )}

      {/* Grid: Weekly Chart & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <WeeklySalesChart />
        </div>

        {/* Side Panel: Inventory Alerts or Agent Top Items */}
        <div className="space-y-6">
          {/* Low Stock Warning Card */}
          <div className="app-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Stock Alert Advisory
                </h3>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsStockModalOpen(true)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  + Add Stock
                </button>
              )}
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All frozen food items have healthy stock levels.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.slice(0, 3).map((item) => {
                  const unit = getProductUnit(item);
                  const stock = getProductStockValue(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-amber-800 font-medium">
                          Remaining: {stock} {unit}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300">
                        Critical
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Catalog Snapshot */}
          <div className="app-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Top Products</h3>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
              >
                View Products &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {products.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                  <span className="font-bold text-purple-700 shrink-0">
                    {p.retailPriceKg ? `৳${p.retailPriceKg}/KG` : `৳${p.retailPricePcs}/PCS`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="app-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Recent Sales & Invoices</h3>
            <p className="text-xs text-slate-600 font-medium">
              {isAdmin ? 'Latest customer transactions across all executives' : 'Your recent sales transactions'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All Sales</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-600">No sales recorded yet.</div>
        ) : (
          <>
            {/* Mobile View: Clean Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <div key={sale.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">{sale.invoiceNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sale.saleType === 'RETAIL'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {sale.saleType}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 flex items-baseline">
                      <span className="font-black mr-0.5">৳</span>
                      <span>{sale.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {sale.customerName || 'Direct Customer'}
                      {isAdmin && sale.agentName && (
                        <span className="text-purple-700 ml-1 font-semibold">({sale.agentName})</span>
                      )}
                    </span>
                    <span>{sale.createdAtDate}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSaleForInvoice(sale);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Cash Memo</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Data Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Invoice No</th>
                    <th className="py-3 px-3">Date & Time</th>
                    {isAdmin && <th className="py-3 px-3">Executive</th>}
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-center">Cash Memo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{sale.invoiceNo}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{sale.createdAtDate}</div>
                        <div className="text-[10px] text-slate-600">{sale.createdAtTime}</div>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-3 font-semibold text-purple-800">{sale.agentName}</td>
                      )}
                      <td className="py-3 px-3 font-medium text-slate-800">{sale.customerName || 'Direct Customer'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.saleType === 'RETAIL'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {sale.saleType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        ৳{sale.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedSaleForInvoice(sale);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-bold text-xs transition-colors cursor-pointer"
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
          </>
        )}
      </div>
    </div>
  );
};
