import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 w-full max-w-md animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-slate-900/95 text-emerald-50 border-emerald-500/40 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-slate-900/95 text-rose-50 border-rose-500/40 shadow-rose-950/20'
              : 'bg-slate-900/95 text-purple-50 border-purple-500/40 shadow-purple-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-purple-400 shrink-0" />}
            <div className="text-xs sm:text-sm font-semibold leading-snug break-words">{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
