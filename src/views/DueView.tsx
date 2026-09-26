import React from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Plus, CreditCard, ShieldCheck, CheckCircle2, Calendar, Clock, Phone, MapPin } from 'lucide-react';

export const DueView: React.FC = () => {
  const {
    currentUser,
    users,
    payments,
    setIsPaymentModalOpen,
    setSelectedAgentForPayment,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Calculations
  const agentUsers = users.filter((u) => u.role === 'AGENT');
  const totalSystemDue = agentUsers.reduce((acc, u) => acc + u.currentDue, 0);
  const totalClearedPayments = payments.reduce((acc, p) => acc + p.amount, 0);

  // Relevant payments
  const relevantPayments = isAdmin ? payments : payments.filter((p) => p.agentId === currentUser?.id);
  const agentClearedPayments = currentUser?.totalPaid !== undefined
    ? currentUser.totalPaid
    : relevantPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleOpenPaymentForAgent = (agent: any) => {
    setSelectedAgentForPayment(agent);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Executive Due & Payment Reconciliation' : 'My Due & Payment Ledger'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {isAdmin
              ? 'Track individual executive outstanding balances, due settlements, and official payment receipts'
              : 'View your outstanding payable balance to Admin and past payment receipts'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedAgentForPayment(null);
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(() => {
          const dueVal = isAdmin ? totalSystemDue : (currentUser?.currentDue || 0);
          const isAdvance = dueVal < 0;
          return (
            <div className="app-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isAdvance ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isAdmin
                    ? isAdvance ? 'Total Advance Balance' : 'Total Outstanding Due'
                    : isAdvance ? 'My Advance Balance' : 'My Current Due Balance'}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAdvance ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-black flex items-baseline gap-0.5 ${isAdvance ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span className="font-black select-none">{isAdvance ? '-৳' : '৳'}</span>
                <span>{Math.abs(dueVal).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {isAdmin
                  ? isAdvance ? `Advance credited from executives` : `Payable across ${agentUsers.length} sales executives`
                  : isAdvance ? 'Advance credit deposited to Admin (offsets next sales)' : 'Payable to Admin for sold inventory'}
              </p>
            </div>
          );
        })()}

        <div className="app-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {isAdmin ? 'Total Cleared Payments' : 'My Cleared Payments'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 flex items-baseline gap-0.5">
            <span className="font-black select-none">৳</span>
            <span>{(isAdmin ? totalClearedPayments : agentClearedPayments).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {isAdmin ? 'Settled & deposited into business accounts' : 'Payments verified & cleared by Admin'}
          </p>
        </div>

        <div className="app-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              {isAdmin ? 'Payment Status' : 'Account Standing'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {isAdmin
              ? 'Reconciliation Active'
              : (currentUser?.currentDue || 0) < 0
              ? 'Advance Balance Active'
              : (currentUser?.currentDue || 0) > 0
              ? 'Due Settlement Pending'
              : 'Account Good Standing'}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {isAdmin
              ? 'Double-entry ledger accuracy'
              : (currentUser?.currentDue || 0) < 0
              ? 'Advance balance will deduct from future sales'
              : (currentUser?.currentDue || 0) > 0
              ? 'Outstanding balance payable to Admin'
              : 'Zero outstanding dues'}
          </p>
        </div>
      </div>

      {/* Admin: Agent Ledgers Table */}
      {isAdmin && (
        <div className="app-card rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-extrabold text-slate-900">Executive Accounts & Due Balances</h3>
            <p className="text-xs text-slate-600 font-medium">
              Click "Clear / Record Payment" to log cash receipt from any executive
            </p>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden p-3.5 space-y-3">
            {agentUsers.map((agent) => (
              <div key={agent.id} className="app-box p-3.5 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{agent.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono">{agent.phone}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      agent.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : agent.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      {agent.currentDue < 0 ? 'Advance Balance' : 'Outstanding Due'}
                    </span>
                    <span className={`font-black text-base ${agent.currentDue < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {agent.currentDue < 0 ? `-৳${Math.abs(agent.currentDue).toLocaleString()} (Advance)` : `৳${agent.currentDue.toLocaleString()}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenPaymentForAgent(agent)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Executive Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Outstanding / Advance</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentUsers.map((agent) => (
                  <tr key={agent.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{agent.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono font-medium">{agent.phone}</td>
                    <td className="py-3 px-4 text-slate-600">{agent.address || 'Dhaka, Bangladesh'}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          agent.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : agent.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-black text-sm ${
                      agent.currentDue < 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {agent.currentDue < 0 ? `-৳${Math.abs(agent.currentDue).toLocaleString()} (Advance)` : `৳${agent.currentDue.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenPaymentForAgent(agent)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Clear / Record Payment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History Audit Table */}
      <div className="app-card rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-extrabold text-slate-900">Payment Collection History</h3>
          <p className="text-xs text-slate-600 font-medium">Audited records of received payments and due clearances</p>
        </div>

        {relevantPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-600">No payment records found.</div>
        ) : (
          <>
            {/* Mobile Responsive Cards (No sideways scroll, fully visible date & details) */}
            <div className="sm:hidden p-3.5 space-y-3">
              {relevantPayments.map((p) => {
                const payDate = p.date || p.createdAtDate || (p.timestamp ? new Date(p.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent');
                const payTime = p.time || p.createdAtTime || (p.timestamp ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');

                return (
                  <div key={p.id} className="app-box p-3.5 rounded-xl space-y-2.5">
                    {/* Top Row: Date & Time + Amount Paid */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-bold text-slate-900">{payDate}</span>
                        {payTime && <span className="text-slate-500 font-normal">• {payTime}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700">
                          ৳{p.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Agent Name (if Admin) & Payment Method Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      {isAdmin ? (
                        <div className="flex items-center gap-1 text-slate-800">
                          <span className="text-[11px] text-slate-500 font-medium">Executive:</span>
                          <span className="font-bold text-slate-900">{p.agentName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {p.id.replace('PAY-', '')}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
                        <CreditCard className="w-3 h-3 shrink-0" />
                        <span>{p.paymentMethod}</span>
                      </span>
                    </div>

                    {/* Bottom Row: Recorded By */}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                      <span>
                        Recorded By: <strong className="text-slate-700 font-semibold">{p.recordedBy}</strong>
                      </span>
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
                    {isAdmin && <th className="py-3 px-4">Executive Name</th>}
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relevantPayments.map((p) => {
                    const payDate = p.date || p.createdAtDate || (p.timestamp ? new Date(p.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent');
                    const payTime = p.time || p.createdAtTime || (p.timestamp ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');

                    return (
                      <tr key={p.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span>{payDate}</span>
                          </div>
                          {payTime && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 pl-5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{payTime}</span>
                            </div>
                          )}
                        </td>

                        {isAdmin && (
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{p.agentName}</td>
                        )}

                        <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                          ৳{p.amount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 whitespace-nowrap">
                            <CreditCard className="w-3 h-3 shrink-0" />
                            <span>{p.paymentMethod}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{p.recordedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
