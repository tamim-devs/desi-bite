import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserCheck, UserX, DollarSign, ShieldAlert, CheckCircle2, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { User } from '../types';

export const AgentsView: React.FC = () => {
  const { users, updateAgentStatus, deleteAgent, setIsPaymentModalOpen, setSelectedAgentForPayment } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [agentToReject, setAgentToReject] = useState<User | null>(null);

  // Strictly exclude REJECTED agents from the admin panel
  const agentUsers = useMemo(() => {
    return users
      .filter((u) => u.role === 'AGENT' && u.status !== 'REJECTED')
      .filter((u) => {
        if (filter === 'ALL') return true;
        return u.status === filter;
      });
  }, [users, filter]);

  const activeCount = users.filter((u) => u.role === 'AGENT' && u.status === 'ACTIVE').length;
  const pendingCount = users.filter((u) => u.role === 'AGENT' && u.status === 'PENDING').length;
  const totalDue = users.filter((u) => u.role === 'AGENT' && u.status !== 'REJECTED').reduce((acc, u) => acc + u.currentDue, 0);

  const confirmRejectAgent = async () => {
    if (!agentToReject) return;
    await updateAgentStatus(agentToReject.id, 'REJECTED');
    setAgentToReject(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sales Executives Management</h2>
          <p className="text-xs text-slate-600 font-medium">
            Review new executive registrations, enforce status controls, and audit collections
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="app-card p-3.5 sm:p-5 rounded-2xl">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">Active Sales Executives</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{activeCount} Executives</div>
          <p className="text-[11px] text-slate-600 mt-0.5">Authorized to record orders</p>
        </div>

        <div className="app-card p-3.5 sm:p-5 rounded-2xl">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Registrations</span>
          <div
            className={`text-xl sm:text-2xl font-extrabold mt-1 ${
              pendingCount > 0 ? 'text-amber-600 font-extrabold' : 'text-slate-900'
            }`}
          >
            {pendingCount} Pending
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">Awaiting Administrator review</p>
        </div>

        <div className="app-card p-3.5 sm:p-5 rounded-2xl">
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${totalDue < 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {totalDue < 0 ? 'Total Advance Balance' : 'Total Outstanding Due'}
          </span>
          <div className={`text-xl sm:text-2xl font-black mt-1 flex items-baseline gap-0.5 ${totalDue < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className="font-black select-none">{totalDue < 0 ? '-৳' : '৳'}</span>
            <span>{Math.abs(totalDue).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {totalDue < 0 ? 'Advance credit across executives' : 'Cumulative executive balance'}
          </p>
        </div>
      </div>

      {/* Filter Tabs (Responsive: Uniform 4-col grid on mobile, flex on desktop, no scrollbar line) */}
      <div className="app-card p-1.5 sm:p-2 rounded-2xl">
        <div className="grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none">
          {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`py-2 px-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
                filter === mode
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {mode === 'ALL'
                ? 'All Executives'
                : mode === 'ACTIVE'
                ? 'Active'
                : mode === 'PENDING'
                ? `Pending (${pendingCount})`
                : 'Suspended'}
            </button>
          ))}
        </div>
      </div>

      {/* Agents List / Table */}
      <div className="pb-8 sm:pb-0">
        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3.5">
          {agentUsers.length === 0 ? (
            <div className="app-card p-8 text-center text-slate-500 text-xs rounded-2xl">No sales executives found.</div>
          ) : (
            agentUsers.map((agent) => (
              <div key={agent.id} className="app-card p-4 rounded-2xl space-y-3.5 hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{agent.name}</h3>
                    <p className="text-xs text-slate-600 font-mono font-medium">{agent.phone}</p>
                    <p className="text-[11px] text-slate-500">{agent.address || 'Dhaka, Bangladesh'}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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

                <div className="app-box p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {agent.currentDue < 0 ? 'Advance Balance' : 'Current Due'}
                    </span>
                    <span className={`font-black text-base ${agent.currentDue < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {agent.currentDue < 0 ? `-৳${Math.abs(agent.currentDue).toLocaleString()} (Advance)` : `৳${agent.currentDue.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {agent.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => updateAgentStatus(agent.id, 'ACTIVE')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setAgentToReject(agent)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : agent.status === 'ACTIVE' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAgentForPayment(agent);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Payment
                        </button>
                        <button
                          onClick={() => updateAgentStatus(agent.id, 'SUSPENDED')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 cursor-pointer"
                        >
                          Suspend
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateAgentStatus(agent.id, 'ACTIVE')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block app-card rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Executive Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Outstanding / Advance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentUsers.map((agent) => (
                <tr key={agent.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 text-sm">{agent.name}</div>
                    <div className="text-[10px] text-slate-600">Joined: {agent.createdAt}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{agent.phone}</td>

                  <td className="py-3 px-4 text-slate-600">{agent.address || 'Dhaka, Bangladesh'}</td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        agent.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : agent.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {agent.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                      {agent.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {agent.status === 'SUSPENDED' && <ShieldAlert className="w-3 h-3" />}
                      <span>{agent.status}</span>
                    </span>
                  </td>

                  <td className={`py-3 px-4 text-right font-extrabold text-sm ${
                    agent.currentDue < 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {agent.currentDue < 0 ? `-৳${Math.abs(agent.currentDue).toLocaleString()} (Advance)` : `৳${agent.currentDue.toLocaleString()}`}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {agent.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => updateAgentStatus(agent.id, 'ACTIVE')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setAgentToReject(agent)}
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : agent.status === 'ACTIVE' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAgentForPayment(agent);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Record Payment
                          </button>
                          <button
                            onClick={() => updateAgentStatus(agent.id, 'SUSPENDED')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 font-medium text-xs transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => setAgentToReject(agent)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title="Reject & Remove Executive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => updateAgentStatus(agent.id, 'ACTIVE')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Re-activate
                          </button>
                          <button
                            onClick={() => setAgentToReject(agent)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title="Reject & Remove Executive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Agent Rejection / Removal */}
      {agentToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  Reject & Remove Executive?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to reject <span className="font-bold text-slate-900">{agentToReject.name}</span> ({agentToReject.phone})? This executive will be removed from the system and will no longer appear in the admin panel.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAgentToReject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejectAgent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Yes, Reject & Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
