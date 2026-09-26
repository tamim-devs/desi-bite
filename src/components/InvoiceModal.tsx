import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Copy, Check, ShoppingBag, Phone, MapPin, Calendar, Clock, UserCheck } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { isInvoiceModalOpen, setIsInvoiceModalOpen, selectedSaleForInvoice, settings, showToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!isInvoiceModalOpen || !selectedSaleForInvoice) return null;

  const sale = selectedSaleForInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `DESHI BITE CASH MEMO
Invoice No: ${sale.invoiceNo}
Date: ${sale.createdAtDate} ${sale.createdAtTime}
Executive: ${sale.agentName}
Customer: ${sale.customerName || 'Direct Customer'}
Items:
${sale.items.map((i) => `- ${i.productName}: ${i.quantity} ${i.unit} @ ৳${i.unitPrice} = ৳${i.subtotal}`).join('\n')}
Grand Total: ৳${sale.grandTotal.toLocaleString()}
Status: ${sale.paymentStatus}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Invoice details copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Action Header bar (Non-printable) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Digital Cash Memo</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Memo</span>
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div id="printable-memo" className="p-6 sm:p-8 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-purple-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center">
                  DB
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{settings.businessName}</h1>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">{settings.subtitle}</p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-purple-600" />
                {settings.address}
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-purple-600" />
                Hotline: {settings.phone}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                {sale.saleType} MEMO
              </span>
              <div className="text-xs font-bold text-slate-900">{sale.invoiceNo}</div>
              <div className="text-[11px] text-slate-600 flex items-center justify-end gap-1 mt-1">
                <Calendar className="w-3 h-3 text-slate-600" />
                <span>{sale.createdAtDate}</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{sale.createdAtTime}</span>
              </div>
            </div>
          </div>

          {/* Customer & Agent Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-purple-50/30 p-3.5 rounded-2xl border border-purple-100/60">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">BILLED TO:</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{sale.customerName || 'Direct Customer'}</p>
              {sale.customerPhone && <p className="text-slate-600">{sale.customerPhone}</p>}
              {sale.customerAddress && <p className="text-slate-600">{sale.customerAddress}</p>}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">ISSUING EXECUTIVE:</span>
              <p className="font-extrabold text-purple-800 mt-0.5 flex items-center justify-end gap-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>{sale.agentName}</span>
              </p>
              <p className="text-slate-600 text-[11px]">Authorized Sales Representative</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{item.unit}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">৳{item.unitPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ৳{item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-between items-start pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 max-w-[220px]">
              <p className="font-semibold text-slate-800">Due Account Notice:</p>
              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                This transaction has been automatically attributed to Executive {sale.agentName}'s due balance.
              </p>
            </div>

            <div className="w-52 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">৳{sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-৳{sale.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-purple-700 text-base">৳{sale.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-600 font-medium leading-relaxed">
            {settings.invoiceFooter}
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="print:hidden p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(false)}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close Memo
          </button>
        </div>
      </div>
    </div>
  );
};
