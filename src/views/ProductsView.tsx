import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, getProductUnit, getProductStockValue, getProductThresholdValue, isProductLowStock } from '../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  ShoppingBag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    currentUser,
    setIsProductModalOpen,
    setEditingProduct,
    setIsStockModalOpen,
    setIsSellModalOpen,
    deleteProduct,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LOW_STOCK' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    setProductToDelete(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase().trim());
      if (!matchesSearch) return false;

      // Filter
      if (filter === 'ACTIVE') return p.active;
      if (filter === 'INACTIVE') return !p.active;
      if (filter === 'LOW_STOCK') {
        return isProductLowStock(p);
      }
      return true;
    });
  }, [products, search, filter]);

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Product Inventory & Pricing' : 'Available Products'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {isAdmin
              ? 'Maintain rates, unit classifications, and stock replenishment limits'
              : 'Live inventory stock and official wholesale/retail rate card'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {isAdmin ? (
            <>
              <button
                onClick={() => setIsStockModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4" />
                <span>Adjust Stock</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="col-span-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SELL PRODUCT</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products (e.g. Nugget, Singara)..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'LOW_STOCK', 'ACTIVE', 'INACTIVE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
                filter === mode
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {mode === 'ALL'
                ? 'All Products'
                : mode === 'LOW_STOCK'
                ? 'Low Stock Alerts'
                : mode === 'ACTIVE'
                ? 'Active'
                : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Grid */}
      <div>
        {/* Mobile View: Clean Card List (sm:hidden) */}
        <div className="sm:hidden space-y-3.5">
          {filteredProducts.length === 0 ? (
            <div className="app-card p-8 text-center text-xs text-slate-500 rounded-2xl">
              No products found matching criteria.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const unit = getProductUnit(p);
              const stockVal = getProductStockValue(p);
              const thresholdVal = getProductThresholdValue(p);
              const isLow = isProductLowStock(p);

              return (
                <div key={p.id} className="app-card p-4 rounded-2xl space-y-3 hover:border-purple-300 transition-all">
                  {/* Card Header: Title and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 text-sm">{p.name}</div>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Low Stock Alert</span>
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {p.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Stock Grid: Distinct Elevated Box */}
                  <div className="grid grid-cols-3 gap-2 app-box p-3 rounded-xl text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Retail (খুচরা)</div>
                      <div className="font-bold text-purple-900 text-xs mt-0.5">
                        {p.retailPriceKg
                          ? `৳${p.retailPriceKg}/${unit}`
                          : p.retailPricePcs
                          ? `৳${p.retailPricePcs}/${unit}`
                          : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Wholesale (পাইকারি)</div>
                      <div className="font-bold text-indigo-900 text-xs mt-0.5">
                        {p.wholesalePriceKg
                          ? `৳${p.wholesalePriceKg}/${unit}`
                          : p.wholesalePricePcs
                          ? `৳${p.wholesalePricePcs}/${unit}`
                          : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Stock</div>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border ${
                            isLow
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : stockVal > 0
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          {stockVal} {unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Mobile */}
                  <div className="pt-1">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Product</span>
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                          title={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSellModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sell This Product</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table (hidden sm:block) */}
        <div className="hidden sm:block app-card rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Retail Price (খুচরা)</th>
                <th className="py-3 px-4">Wholesale Price (পাইকারি)</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                {isAdmin && <th className="py-3 px-4 text-center">Threshold</th>}
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const unit = getProductUnit(p);
                const stockVal = getProductStockValue(p);
                const thresholdVal = getProductThresholdValue(p);
                const isLow = isProductLowStock(p);

                return (
                  <tr key={p.id} className="hover:bg-purple-50/20 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{p.name}</div>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock Alert</span>
                        </span>
                      )}
                    </td>

                    {/* Retail Pricing */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {p.retailPriceKg && (
                          <div className="font-bold text-purple-900">৳{p.retailPriceKg} / KG</div>
                        )}
                        {p.retailPricePcs && (
                          <div className="font-semibold text-slate-700">৳{p.retailPricePcs} / PCS</div>
                        )}
                        {!p.retailPriceKg && !p.retailPricePcs && (
                          <span className="text-slate-600 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Wholesale Pricing */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {p.wholesalePriceKg && (
                          <div className="font-bold text-indigo-900">৳{p.wholesalePriceKg} / KG</div>
                        )}
                        {p.wholesalePricePcs && (
                          <div className="font-semibold text-slate-700">৳{p.wholesalePricePcs} / PCS</div>
                        )}
                        {!p.wholesalePriceKg && !p.wholesalePricePcs && (
                          <span className="text-slate-600 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-extrabold px-2.5 py-0.5 rounded-md ${
                            isLow
                              ? 'bg-amber-100 text-amber-800'
                              : stockVal > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {stockVal} {unit}
                        </span>
                      </div>
                    </td>

                    {/* Thresholds (Admin only) */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {thresholdVal} {unit}
                      </td>
                    )}

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {p.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsSellModalOpen(true)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Sell</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Product Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  Delete Product?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-900">"{productToDelete.name}"</span>? This will permanently remove the product and its pricing details from your store catalog.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
