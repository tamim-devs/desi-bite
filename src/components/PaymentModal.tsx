import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, DollarSign, CheckCircle, CreditCard } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectedAgentForPayment,
    users,
    recordPayment,
    showToast,
  } = useApp();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash in Hand');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected agent
  useEffect(() => {
    if (selectedAgentForPayment) {
      setSelectedAgentId(selectedAgentForPayment.id);
      setPaymentAmount(selectedAgentForPayment.currentDue);
    } else {
      const firstDueAgent = users.find((u) => u.role === 'AGENT' && u.currentDue > 0);
      if (firstDueAgent) {
        setSelectedAgentId(firstDueAgent.id);
        setPaymentAmount(firstDueAgent.currentDue);
      }
    }
  }, [selectedAgentForPayment, isPaymentModalOpen, users]);

  if (!isPaymentModalOpen) return null;

  const targetAgent = users.find((u) => u.id === selectedAgentId);
  const currentDue = targetAgent ? targetAgent.currentDue : 0;
  const numAmount = typeof paymentAmount === 'number' ? paymentAmount : 0;
  const estimatedRemainingDue = Number((currentDue - numAmount).toFixed(2));

  const handleQuickAmount = (type: 'full' | 'half') => {
    if (type === 'full') {
      setPaymentAmount(currentDue > 0 ? currentDue : 0);
    } else {
      setPaymentAmount(currentDue > 0 ? Number((currentDue / 2).toFixed(2)) : 0);
    }
  };

  const handleConfirm = async () => {
    if (!targetAgent) {
      showToast('Please select an executive', 'error');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid positive payment amount', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await recordPayment({
      agentId: targetAgent.id,
      amount: numAmount,
      paymentMethod,
    });

    setIsSubmitting(false);
    if (success) {
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Record Payment / Clear Due</h2>
            <p className="text-xs text-slate-600">
              Executive: <span className="font-bold text-slate-900">{targetAgent?.name || 'Select Executive'}</span>
            </p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          {/* If opened without a pre-selected agent, allow selecting */}
          {!selectedAgentForPayment && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                SELECT EXECUTIVE *
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => {
                  setSelectedAgentId(e.target.value);
                  const a = users.find((u) => u.id === e.target.value);
                  if (a) setPaymentAmount(a.currentDue > 0 ? a.currentDue : 0);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
              >
                {users
                  .filter((u) => u.role === 'AGENT')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.phone}) — {a.currentDue < 0 ? `Advance: ৳${Math.abs(a.currentDue).toLocaleString()}` : `Due: ৳${a.currentDue.toLocaleString()}`}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Balance Calculation Card (Exact match to screenshot photo_2026-09-16_17-57-08 (2).jpg) */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Current Outstanding Due:</span>
              <span className={`font-extrabold text-sm ${currentDue < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentDue < 0 ? `-৳${Math.abs(currentDue).toLocaleString()} (Advance)` : `৳${currentDue.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Payment Amount:</span>
              <span className="font-extrabold text-emerald-600 text-sm">
                -{numAmount > 0 ? `৳${numAmount.toLocaleString()}` : '৳0'}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-purple-200/50 pt-2 font-bold">
              <span className="text-slate-900">Estimated Remaining Due:</span>
              <span className={`font-extrabold text-base ${estimatedRemainingDue < 0 ? 'text-emerald-700' : 'text-purple-900'}`}>
                {estimatedRemainingDue < 0
                  ? `-৳${Math.abs(estimatedRemainingDue).toLocaleString()} (Advance)`
                  : `৳${estimatedRemainingDue.toLocaleString()}`}
              </span>
            </div>

            {estimatedRemainingDue < 0 && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 rounded-xl p-2 border border-emerald-200 font-medium">
                💡 Executive is paying <strong>৳{Math.abs(estimatedRemainingDue).toLocaleString()}</strong> in advance. This advance will automatically adjust against their next sales.
              </div>
            )}
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Quick Amount:</span>
            <button
              type="button"
              onClick={() => handleQuickAmount('full')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer"
            >
              Full Due ({currentDue < 0 ? `-৳${Math.abs(currentDue).toLocaleString()}` : `৳${currentDue.toLocaleString()}`})
            </button>
            <button
              type="button"
              onClick={() => handleQuickAmount('half')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              50% Due
            </button>
          </div>

          {/* Payment Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              PAYMENT AMOUNT RECEIVED (৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-600 font-bold text-sm">৳</span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-3 py-2 text-sm font-extrabold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              PAYMENT METHOD
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash in Hand', 'bKash / Nagad', 'Bank Deposit'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-2 text-center text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === m
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !numAmount || numAmount <= 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Recording...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};
