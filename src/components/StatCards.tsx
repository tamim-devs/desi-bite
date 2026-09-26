import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sale, isProductLowStock } from '../types';
import {
  getBangladeshWeekDays,
  getDhakaYMD,
  getBangladeshMonthInfo,
  isSaleInDhakaMonth,
} from '../utils/salesDateUtils';
import {
  TrendingUp,
  Calendar,
  CalendarDays,
  ShoppingBag,
  AlertTriangle,
  Users,
  Package,
  Clock,
  DollarSign,
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const { currentUser, sales, products, users } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Live timer state: automatically refreshes at midnight, at weekly reset (Saturday),
  // and at monthly reset (1st of the month) in Asia/Dhaka time without requiring manual reload.
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Ticks every 30 seconds
    return () => clearInterval(timer);
  }, []);

  // Filter sales for this agent if Agent
  const relevantSales = isAdmin ? sales : sales.filter((s) => s.agentId === currentUser?.id);

  // Accurate Today, Week, and Month calculations in Asia/Dhaka timezone
  const todayYmd = getDhakaYMD(currentTime);
  const todayDhaka = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentTime));

  const isSaleToday = (s: Sale) => {
    if (s.createdAtDate && s.createdAtDate.trim().toLowerCase() === todayDhaka.trim().toLowerCase()) return true;
    if (s.timestamp && !isNaN(s.timestamp)) {
      if (getDhakaYMD(s.timestamp) === todayYmd) return true;
    }
    if (s.createdAtDate) {
      if (getDhakaYMD(s.createdAtDate) === todayYmd) return true;
    }
    return false;
  };

  const todaySales = relevantSales
    .filter(isSaleToday)
    .reduce((acc, s) => acc + s.grandTotal, 0);

  // Current Week Sales (Bangladesh business calendar: Saturday to Friday)
  const { startDateYmd, endDateYmd, formattedRange } = getBangladeshWeekDays(0, currentTime);
  const isSaleThisWeek = (s: Sale) => {
    if (isSaleToday(s)) return true;
    let saleYmd = '';
    if (s.timestamp && !isNaN(s.timestamp)) {
      saleYmd = getDhakaYMD(s.timestamp);
    } else if (s.createdAtDate) {
      saleYmd = getDhakaYMD(s.createdAtDate);
    }
    if (!saleYmd) return false;
    return saleYmd >= startDateYmd && saleYmd <= endDateYmd;
  };

  const weekSales = relevantSales
    .filter(isSaleThisWeek)
    .reduce((acc, s) => acc + s.grandTotal, 0);

  // Month Sales (current calendar month in Asia/Dhaka)
  const { yearMonthYm, fullMonthName } = getBangladeshMonthInfo(currentTime);
  const isSaleThisMonth = (s: Sale) => {
    if (isSaleToday(s)) return true;
    return isSaleInDhakaMonth(s, yearMonthYm, fullMonthName);
  };

  const monthSales = relevantSales
    .filter(isSaleThisMonth)
    .reduce((acc, s) => acc + s.grandTotal, 0);

  // Total Lifetime Sales
  const totalSales = relevantSales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Due calculation
  const totalDueAcrossAgents = users
    .filter((u) => u.role === 'AGENT')
    .reduce((acc, u) => acc + u.currentDue, 0);

  const agentPersonalDue = currentUser?.currentDue || 0;

  // Products stock status
  const lowStockCount = products.filter(isProductLowStock).length;

  const totalAgents = users.filter((u) => u.role === 'AGENT').length;
  const pendingAgentsCount = users.filter((u) => u.role === 'AGENT' && u.status === 'PENDING').length;

  if (isAdmin) {
    return (
      <div className="space-y-4">
        {/* Row 1: Sales Revenue Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Today's Sales */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                TODAY'S SALE
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
              <span className="font-extrabold text-slate-900 select-none">৳</span>
              <span>{todaySales.toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">Confirmed orders today</p>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                THIS WEEK
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
              <span className="font-extrabold text-slate-900 select-none">৳</span>
              <span>{weekSales.toLocaleString()}</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug mt-1" title={`Sat – Fri (${formattedRange})`}>
              <span className="font-semibold text-slate-700 block sm:inline">Sat – Fri</span>
              <span className="text-[10px] sm:text-xs text-slate-500 block sm:inline sm:ml-1">
                ({formattedRange})
              </span>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                THIS MONTH
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
              <span className="font-extrabold text-slate-900 select-none">৳</span>
              <span>{monthSales.toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">{fullMonthName}</p>
          </div>

          {/* Total Sales */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                TOTAL SALES
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
              <span className="font-extrabold text-slate-900 select-none">৳</span>
              <span>{totalSales.toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">Lifetime system orders</p>
          </div>
        </div>

        {/* Row 2: Operational Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Due */}
          <div className={`bg-white rounded-3xl p-4 sm:p-6 border ${
            totalDueAcrossAgents < 0 ? 'border-emerald-100 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.08)]' : 'border-rose-100 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.08)]'
          } hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                totalDueAcrossAgents < 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {totalDueAcrossAgents < 0 ? 'TOTAL ADVANCE' : 'TOTAL DUE'}
              </span>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                totalDueAcrossAgents < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight flex items-baseline gap-1 my-1 ${
              totalDueAcrossAgents < 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              <span className="font-extrabold select-none">
                {totalDueAcrossAgents < 0 ? '-৳' : '৳'}
              </span>
              <span>{Math.abs(totalDueAcrossAgents).toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">
              {totalDueAcrossAgents < 0 ? 'Advance balance with Admin' : 'Executive outstanding payable'}
            </p>
          </div>

          {/* Total Agents */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                TOTAL EXECUTIVES
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight my-1">
              {totalAgents}
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">
              {pendingAgentsCount > 0 ? (
                <span className="text-amber-600 font-bold">{pendingAgentsCount} pending approval</span>
              ) : (
                'All active and verified'
              )}
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                TOTAL PRODUCTS
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight my-1">
              {products.length}
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">Frozen items catalog</p>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                LOW STOCK ITEMS
              </span>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  lowStockCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div
              className={`text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight my-1 ${
                lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {lowStockCount}
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">
              {lowStockCount > 0 ? 'Requires replenishing' : 'Optimal inventory levels'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AGENT STATS VIEW (Exact match to screenshot photo_2026-09-16_17-57-10.jpg)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Today's Sale */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
            TODAY'S SALE
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
          <span className="font-extrabold text-slate-900 select-none">৳</span>
          <span>{todaySales.toLocaleString()}</span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">Confirmed orders today</p>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
            THIS WEEK
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
          <span className="font-extrabold text-slate-900 select-none">৳</span>
          <span>{weekSales.toLocaleString()}</span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug mt-1" title={`Sat – Fri (${formattedRange})`}>
          <span className="font-semibold text-slate-700 block sm:inline">Sat – Fri</span>
          <span className="text-[10px] sm:text-xs text-slate-500 block sm:inline sm:ml-1">
            ({formattedRange})
          </span>
        </div>
      </div>

      {/* This Month */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
            THIS MONTH
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight flex items-baseline gap-1 my-1">
          <span className="font-extrabold text-slate-900 select-none">৳</span>
          <span>{monthSales.toLocaleString()}</span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">{fullMonthName}</p>
      </div>

      {/* Current Due */}
      <div className={`bg-white rounded-3xl p-4 sm:p-6 border ${
        agentPersonalDue < 0 ? 'border-emerald-100 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.08)]' : 'border-rose-100 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.08)]'
      } hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
            agentPersonalDue < 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {agentPersonalDue < 0 ? 'ADVANCE BALANCE' : 'CURRENT DUE'}
          </span>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            agentPersonalDue < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight flex items-baseline gap-1 my-1 ${
          agentPersonalDue < 0 ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          <span className="font-extrabold select-none">
            {agentPersonalDue < 0 ? '-৳' : '৳'}
          </span>
          <span>{Math.abs(agentPersonalDue).toLocaleString()}</span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-tight">
          {agentPersonalDue < 0 ? 'Advance deposited to Admin' : 'Payable to Admin'}
        </p>
      </div>
    </div>
  );
};
