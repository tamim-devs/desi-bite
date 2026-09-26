import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3 } from 'lucide-react';
import { getBangladeshWeekDays, getDhakaYMD } from '../utils/salesDateUtils';

export const WeeklySalesChart: React.FC = () => {
  const { sales, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [activeWeekTab, setActiveWeekTab] = useState<'THIS_WEEK' | 'LAST_WEEK'>('THIS_WEEK');

  // Live timer to automatically roll over to new week at Saturday 00:00 Dhaka time
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const relevantSales = isAdmin ? sales : sales.filter((s) => s.agentId === currentUser?.id);

  // Compute week days based on selected week tab (0 for this week, -1 for last week)
  const weekOffset = activeWeekTab === 'THIS_WEEK' ? 0 : -1;
  const { days, formattedRange } = getBangladeshWeekDays(weekOffset, currentTime);

  // Map of dateYmd -> DayBucket
  const daysByYmd = new Map(days.map((d) => [d.dateYmd, { ...d }]));

  // Populate sales into matching calendar day
  relevantSales.forEach((s) => {
    let saleYmd = '';
    if (s.timestamp && !isNaN(s.timestamp)) {
      saleYmd = getDhakaYMD(s.timestamp);
    } else if (s.createdAtDate) {
      saleYmd = getDhakaYMD(s.createdAtDate);
    }

    if (saleYmd && daysByYmd.has(saleYmd)) {
      const bucket = daysByYmd.get(saleYmd)!;
      bucket.total += s.grandTotal;
    }
  });

  const chartDays = days.map((d) => daysByYmd.get(d.dateYmd) || d);
  const totalWeekly = chartDays.reduce((acc, d) => acc + d.total, 0);
  const maxAmount = Math.max(...chartDays.map((d) => d.total), 100);

  return (
    <div className="app-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Weekly Sales Velocity</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {activeWeekTab === 'THIS_WEEK'
              ? `Current Week (${formattedRange})`
              : `Last Week (${formattedRange})`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
          {/* Week Selector Toggle */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveWeekTab('THIS_WEEK')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeWeekTab === 'THIS_WEEK'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setActiveWeekTab('LAST_WEEK')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeWeekTab === 'LAST_WEEK'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Week
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-600 font-medium">Total: </span>
            <span className="text-sm sm:text-base font-extrabold text-purple-700">
              ৳{totalWeekly.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Display */}
      <div className="h-44 sm:h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
        {chartDays.map((day) => {
          const val = day.total;
          const heightPercent = maxAmount > 0 ? Math.round((val / maxAmount) * 100) : 0;
          const isToday = activeWeekTab === 'THIS_WEEK' && day.isToday;

          return (
            <div key={day.dateYmd} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip / Value indicator */}
              <div
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap transition-all ${
                  isToday && val > 0
                    ? 'opacity-100 bg-purple-700 text-white font-extrabold shadow-sm'
                    : val > 0
                    ? 'opacity-80 group-hover:opacity-100 bg-purple-100 text-purple-800'
                    : 'opacity-0 group-hover:opacity-100 bg-slate-100 text-slate-600'
                }`}
              >
                ৳{val.toLocaleString()}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-purple-50 rounded-xl h-full flex items-end p-1">
                <div
                  style={{ height: `${val > 0 ? Math.max(14, heightPercent) : 4}%` }}
                  className={`w-full rounded-lg transition-all duration-500 ${
                    isToday
                      ? val > 0
                        ? 'bg-gradient-to-t from-purple-700 to-indigo-600 shadow-md shadow-purple-500/30'
                        : 'bg-purple-200'
                      : val > 0
                      ? 'bg-purple-500 hover:bg-purple-600 shadow-2xs'
                      : 'bg-slate-200'
                  }`}
                />
              </div>

              {/* Day Label */}
              <div className="text-center">
                <span
                  className={`text-[11px] font-bold block ${
                    isToday ? 'text-purple-700 font-extrabold' : 'text-slate-600'
                  }`}
                >
                  {day.dayKey}
                </span>
                {isToday ? (
                  <span className="text-[9px] text-purple-600 font-bold block -mt-1">Today</span>
                ) : (
                  <span className="text-[9px] text-slate-600 block -mt-1">{day.displayDate}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
