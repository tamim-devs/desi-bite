import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StockTransactionType, UnitType, getProductUnit, getProductStockValue } from '../types';
import { X, Boxes, PlusCircle, MinusCircle, RefreshCw, Undo2 } from 'lucide-react';

export const StockModal: React.FC = () => {
  const { isStockModalOpen, setIsStockModalOpen, products, recordStockChange, showToast } = useApp();

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<StockTransactionType>('STOCK_IN');
  const [unit, setUnit] = useState<UnitType>('KG');
  const [quantity, setQuantity] = useState<string>('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
      setUnit(getProductUnit(products[0]));
    }
  }, [products, productId]);

  if (!isStockModalOpen) return null;

  const selectedProduct = products.find((p) => p.id === productId);

  const handleProductChange = (newId: string) => {
    setProductId(newId);
    const prod = products.find((p) => p.id === newId);
    if (prod) {
      setUnit(getProductUnit(prod));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      showToast('Please select a product', 'error');
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid positive quantity', 'error');
      return;
    }

    if (unit === 'PCS' && !Number.isInteger(qty)) {
      showToast('PCS quantity must be a whole integer', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await recordStockChange({
      productId,
      type,
      quantity: qty,
      unit,
    });

    setIsSubmitting(false);
    if (success) {
      setIsStockModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Record Stock Change</h2>
              <p className="text-xs text-slate-600 font-medium">Inward, outward, audit adjustments & returns</p>
            </div>
          </div>
          <button
            onClick={() => setIsStockModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {/* Select Product */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              SELECT PRODUCT *
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
            >
              {products.map((p) => {
                const pUnit = getProductUnit(p);
                const pStock = getProductStockValue(p);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {pStock} {pUnit})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Stock Snapshot */}
          {selectedProduct && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between text-xs">
              <span className="text-slate-600">Current Stock:</span>
              <span className="font-bold text-slate-900">
                {getProductStockValue(selectedProduct)} {getProductUnit(selectedProduct)}
              </span>
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              ACTION TYPE *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('STOCK_IN')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  type === 'STOCK_IN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>STOCK IN (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('STOCK_OUT')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  type === 'STOCK_OUT'
                    ? 'border-rose-600 bg-rose-50 text-rose-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-rose-600" />
                <span>STOCK OUT (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('ADJUSTMENT')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  type === 'ADJUSTMENT'
                    ? 'border-purple-600 bg-purple-50 text-purple-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span>ADJUSTMENT</span>
              </button>

              <button
                type="button"
                onClick={() => setType('RETURN')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  type === 'RETURN'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Undo2 className="w-4 h-4 text-indigo-600" />
                <span>RETURN (+)</span>
              </button>
            </div>
          </div>

          {/* Unit & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">UNIT *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnit('KG')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    unit === 'KG'
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('PCS')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    unit === 'PCS'
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  PCS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                QUANTITY ({unit}) *
              </label>
              <input
                type="number"
                step={unit === 'KG' ? 'any' : '1'}
                min={unit === 'KG' ? '0.001' : '1'}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={unit === 'KG' ? 'e.g. 3.4, 5, 12.5' : 'e.g. 10'}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
              />
              <span className="block text-[10px] text-slate-600 mt-1">
                {unit === 'KG' ? 'Enter exact KG (e.g. 3, 3.4, 15.25)' : 'Enter whole integer count'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Save Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
