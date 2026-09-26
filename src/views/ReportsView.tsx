import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Printer, TrendingUp, Users, Package, Award } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, users, products } = useApp();

  const totalSalesGross = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const retailSales = sales.filter((s) => s.saleType === 'RETAIL').reduce((acc, s) => acc + s.grandTotal, 0);
  const wholesaleSales = sales.filter((s) => s.saleType === 'WHOLESALE').reduce((acc, s) => acc + s.grandTotal, 0);

  // Agent Performance Leaderboard
  const agentPerformance = users
    .filter((u) => u.role === 'AGENT')
    .map((agent) => {
      const agentSales = sales.filter((s) => s.agentId === agent.id);
      const totalRevenue = agentSales.reduce((acc, s) => acc + s.grandTotal, 0);
      return {
        ...agent,
        ordersCount: agentSales.length,
        totalRevenue,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Product volume sold
  const productVolumeMap: Record<string, { name: string; kg: number; pcs: number; revenue: number }> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productVolumeMap[item.productId]) {
        productVolumeMap[item.productId] = {
          name: item.productName,
          kg: 0,
          pcs: 0,
          revenue: 0,
        };
      }
      if (item.unit === 'KG') {
        productVolumeMap[item.productId].kg += item.quantity;
      } else {
        productVolumeMap[item.productId].pcs += item.quantity;
      }
      productVolumeMap[item.productId].revenue += item.subtotal;
    });
  });

  const productPerformance = Object.values(productVolumeMap).sort((a, b) => b.revenue - a.revenue);

  const handleExportCSV = () => {
    let csv = 'Invoice No,Date,Time,Executive,Customer,Type,Grand Total\n';
    sales.forEach((s) => {
      csv += `"${s.invoiceNo}","${s.createdAtDate}","${s.createdAtTime}","${s.agentName}","${s.customerName}","${s.saleType}",${s.grandTotal}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deshi_bite_sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Reports & Business Intelligence</h2>
          <p className="text-xs text-slate-600 font-medium">
            Financial analytics, top performing executives, and frozen food demand velocities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Channel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Gross Sales Volume</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-1 flex items-baseline gap-0.5">
            <span className="font-black select-none">৳</span>
            <span>{totalSalesGross.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">{sales.length} customer invoices issued</p>
        </div>

        <div className="app-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
            Retail Channel (খুচরা)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-0.5">
            <span className="font-black select-none">৳</span>
            <span>{retailSales.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {totalSalesGross > 0 ? Math.round((retailSales / totalSalesGross) * 100) : 0}% of gross revenue
          </p>
        </div>

        <div className="app-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
            Wholesale Channel (পাইকারি)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-0.5">
            <span className="font-black select-none">৳</span>
            <span>{wholesaleSales.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {totalSalesGross > 0 ? Math.round((wholesaleSales / totalSalesGross) * 100) : 0}% of gross revenue
          </p>
        </div>
      </div>

      {/* Two columns: Agent Performance & Product Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Leaderboard */}
        <div className="app-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Executive Performance Leaderboard</h3>
              <p className="text-[11px] text-slate-600 font-medium">Ranked by total confirmed sales revenue</p>
            </div>
          </div>

          <div className="space-y-3">
            {agentPerformance.map((agent, rank) => (
              <div
                key={agent.id}
                className="app-box p-3.5 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    #{rank + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{agent.name}</h4>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {agent.ordersCount} Orders &bull; Outstanding Due: ৳{agent.currentDue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-purple-700">৳{agent.totalRevenue.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Lifetime Gross</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Demand Performance */}
        <div className="app-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Top Frozen Food Demand</h3>
              <p className="text-[11px] text-slate-600 font-medium">Breakdown by kilograms and pieces sold</p>
            </div>
          </div>

          <div className="space-y-3">
            {productPerformance.map((p) => (
              <div
                key={p.name}
                className="app-box p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{p.name}</h4>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Volume: {p.kg > 0 ? `${p.kg} KG ` : ''}
                    {p.pcs > 0 ? `${p.pcs} PCS` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">৳{p.revenue.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
