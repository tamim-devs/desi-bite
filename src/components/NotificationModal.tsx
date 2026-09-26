import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, AlertTriangle, UserCheck, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    markNotificationsAsRead,
    updateAgentStatus,
    currentUser,
  } = useApp();

  if (!isNotificationModalOpen) return null;

  const relevantNotifications = notifications.filter(
    (n) => n.targetRole === 'ALL' || n.targetRole === currentUser?.role
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Notifications & Alerts</h2>
              <p className="text-xs text-slate-600 font-medium">Real-time inventory alerts, sales, and executive activities</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
          <span className="text-xs font-bold text-slate-600">
            {relevantNotifications.length} {relevantNotifications.length === 1 ? 'Message' : 'Messages'}
          </span>
          <button
            onClick={markNotificationsAsRead}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-2.5">
          {relevantNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-600">No notifications at this time.</div>
          ) : (
            relevantNotifications.map((n) => {
              const isPendingAgent = n.type === 'AGENT_REGISTERED' && n.title.includes('Registration');

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !n.isRead ? 'bg-purple-50/60 border-purple-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'LOW_STOCK' && (
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {n.type === 'AGENT_REGISTERED' && (
                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                      {n.type === 'PAYMENT_RECEIVED' && (
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      )}
                      {n.type === 'NEW_SALE' && (
                        <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-600 shrink-0 font-medium">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>

                      {/* 1-Click Approve for Pending Agent in Admin View */}
                      {currentUser?.role === 'ADMIN' && isPendingAgent && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => updateAgentStatus('u-agent-2', 'ACTIVE')}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            Approve Executive Account
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
