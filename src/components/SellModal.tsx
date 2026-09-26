import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, SaleType, UnitType, SaleItem, getProductUnit, getProductStockValue } from '../types';
import {
  X,
  Store,
  Building2,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export const SellModal: React.FC = () => {
  const {
    isSellModalOpen,
    setIsSellModalOpen,
    currentUser,
    users,
    products,
    createSale,
    setSelectedSaleForInvoice,
    setIsInvoiceModalOpen,
    showToast,
  } = useApp();

  // Admin sale assignment & payment status
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');

  // Step 1: Sale Type
  const [saleType, setSaleType] = useState<SaleType>('RETAIL');

  // Step 2: Search & Product Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Step 3: Selected Unit (KG vs PCS)
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('KG');

  // Step 4: Quantity input
  const [quantity, setQuantity] = useState<number>(1);

  // Cart / Items
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  // Customer Info (Optional)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  // Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  // Filter products by active status and search
  const availableProducts = useMemo(() => {
    return (products || [])
      .filter((p) => p && p.active)
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        return (p.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
      });
  }, [products, searchQuery]);

  // Determine available units and price for selected product based on saleType
  const productPricing = useMemo(() => {
    if (!selectedProduct) return null;

    const kgPrice = saleType === 'RETAIL' ? selectedProduct.retailPriceKg : selectedProduct.wholesalePriceKg;
    const pcsPrice = saleType === 'RETAIL' ? selectedProduct.retailPricePcs : selectedProduct.wholesalePricePcs;

    const hasKg = kgPrice !== null && kgPrice !== undefined && kgPrice > 0;
    const hasPcs = pcsPrice !== null && pcsPrice !== undefined && pcsPrice > 0;

    return {
      kgPrice: hasKg ? kgPrice : null,
      pcsPrice: hasPcs ? pcsPrice : null,
      hasKg,
      hasPcs,
    };
  }, [selectedProduct, saleType]);

  // Helper to determine stock availability for a product in current sale type
  const getProductStockInfo = (prod: Product) => {
    const priceKg = saleType === 'RETAIL' ? prod.retailPriceKg : prod.wholesalePriceKg;
    const pricePcs = saleType === 'RETAIL' ? prod.retailPricePcs : prod.wholesalePricePcs;

    const hasKgRate = priceKg !== null && priceKg !== undefined && priceKg > 0;
    const hasPcsRate = pricePcs !== null && pricePcs !== undefined && pricePcs > 0;

    const availableKg = prod.stockKg !== undefined ? prod.stockKg : 0;
    const availablePcs = prod.stockPcs !== undefined ? prod.stockPcs : 0;

    // Out of stock if no sellable unit has stock > 0, or if no rates exist
    const isOutOfStock =
      (!hasKgRate && !hasPcsRate) ||
      ((hasKgRate ? availableKg <= 0 : true) && (hasPcsRate ? availablePcs <= 0 : true));

    const prodUnit = getProductUnit(prod);
    const prodStock = getProductStockValue(prod);
    const availableText = `${prodStock} ${prodUnit}`;
    const stockLabel = availableText;

    return {
      priceKg,
      pricePcs,
      hasKgRate,
      hasPcsRate,
      availableKg,
      availablePcs,
      isOutOfStock,
      stockLabel,
      availableText,
    };
  };

  // When selected product changes or sale type changes, auto select the available unit
  const handleSelectProduct = (prod: Product) => {
    const { isOutOfStock, hasKgRate, hasPcsRate, availableKg, availablePcs, availableText } =
      getProductStockInfo(prod);

    // If out of stock, do NOT select it, but trigger popup notification alert
    if (isOutOfStock) {
      const alertMsg = `Insufficient stock! Available: ${availableText}.`;
      showToast(alertMsg, 'error');
      setStockAlert(alertMsg);
      // Auto dismiss in-modal alert after 4 seconds
      setTimeout(() => {
        setStockAlert((prev) => (prev === alertMsg ? null : prev));
      }, 4000);
      return;
    }

    setStockAlert(null);
    setSelectedProduct(prod);

    const defaultUnit = getProductUnit(prod);
    setSelectedUnit(defaultUnit);
    if (defaultUnit === 'KG') {
      setQuantity(Math.min(1, Math.max(1, availableKg)));
    } else {
      setQuantity(Math.min(10, Math.max(1, availablePcs)));
    }
  };

  // Unit price for selected unit
  const currentUnitPrice = useMemo(() => {
    if (!productPricing) return 0;
    if (selectedUnit === 'KG') return productPricing.kgPrice || 0;
    return productPricing.pcsPrice || 0;
  }, [productPricing, selectedUnit]);

  // Item total
  const currentItemTotal = useMemo(() => {
    return Number((quantity * currentUnitPrice).toFixed(2));
  }, [quantity, currentUnitPrice]);

  // Add Item to sale
  const handleAddProduct = () => {
    if (!selectedProduct) {
      showToast('Please select a product first', 'error');
      return;
    }

    if (!currentUnitPrice || currentUnitPrice <= 0) {
      showToast(`This product has no ${saleType.toLowerCase()} price for ${selectedUnit}`, 'error');
      return;
    }

    if (quantity <= 0) {
      showToast('Quantity must be greater than zero', 'error');
      return;
    }

    if (selectedUnit === 'PCS' && !Number.isInteger(quantity)) {
      showToast('PCS quantity must be a whole number', 'error');
      return;
    }

    // Check stock
    const availableStock = selectedUnit === 'KG' ? selectedProduct.stockKg : selectedProduct.stockPcs;
    const existingInCart = saleItems
      .filter((i) => i.productId === selectedProduct.id && i.unit === selectedUnit)
      .reduce((acc, i) => acc + i.quantity, 0);

    if (quantity + existingInCart > availableStock) {
      showToast(
        `Insufficient stock! Available: ${availableStock} ${selectedUnit}, already in order: ${existingInCart} ${selectedUnit}`,
        'error'
      );
      return;
    }

    // Check if already in list -> merge or add
    const existingIndex = saleItems.findIndex(
      (item) => item.productId === selectedProduct.id && item.unit === selectedUnit
    );

    if (existingIndex > -1) {
      const updated = [...saleItems];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subtotal: Number((newQty * currentUnitPrice).toFixed(2)),
      };
      setSaleItems(updated);
    } else {
      const newItem: SaleItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unit: selectedUnit,
        quantity,
        unitPrice: currentUnitPrice,
        subtotal: currentItemTotal,
      };
      setSaleItems((prev) => [...prev, newItem]);
    }

    showToast(`Added ${quantity} ${selectedUnit} of ${selectedProduct.name}`, 'info');

    // Reset current item builder but keep customer info and items
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Grand totals
  const subtotal = useMemo(() => {
    return saleItems.reduce((acc, i) => acc + i.subtotal, 0);
  }, [saleItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - (Number(discount) || 0));
  }, [subtotal, discount]);

  // Proceed to confirmation modal
  const handleProceedToConfirm = () => {
    if (saleItems.length === 0) {
      showToast('Please add at least one product to the sale order', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  // Final sale confirmation
  const handleConfirmSale = async () => {
    setIsSubmitting(true);
    const sale = await createSale({
      saleType,
      items: saleItems,
      customerName: customerName || 'Direct Customer',
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      discount: Number(discount) || 0,
      assignedAgentId: currentUser?.role === 'ADMIN' && assignedAgentId ? assignedAgentId : undefined,
      paymentStatus: currentUser?.role === 'ADMIN' ? paymentStatus : 'UNPAID',
    });

    setIsSubmitting(false);
    if (sale) {
      setShowConfirmModal(false);
      setIsSellModalOpen(false);
      // Reset form
      setSaleItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDiscount(0);
      setSelectedProduct(null);
      setAssignedAgentId('');
      setPaymentStatus('PAID');

      // Open Invoice preview immediately!
      setSelectedSaleForInvoice(sale);
      setIsInvoiceModalOpen(true);
    }
  };

  if (!isSellModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-purple-50/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">New Sale / Order Entry</h2>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">Executive: {currentUser?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSellModalOpen(false)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-slate-800">
          {/* STEP 1: SELECT SALE TYPE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              STEP 1: SELECT SALE TYPE
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Retail */}
              <button
                type="button"
                onClick={() => {
                  setSaleType('RETAIL');
                  setSelectedProduct(null);
                }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all text-left cursor-pointer min-w-0 ${
                  saleType === 'RETAIL'
                    ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    saleType === 'RETAIL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1 w-full">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    RETAIL{' '}
                    <span className="font-semibold text-slate-600 text-[10px] sm:text-xs block sm:inline">
                      (খুচরা)
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Regular price
                  </div>
                </div>
              </button>

              {/* Wholesale */}
              <button
                type="button"
                onClick={() => {
                  setSaleType('WHOLESALE');
                  setSelectedProduct(null);
                }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all text-left cursor-pointer min-w-0 ${
                  saleType === 'WHOLESALE'
                    ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    saleType === 'WHOLESALE' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1 w-full">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    WHOLESALE{' '}
                    <span className="font-semibold text-slate-600 text-[10px] sm:text-xs block sm:inline">
                      (পাইকারি)
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Bulk dealer price
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: ADD PRODUCT TO SALE */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                STEP 2: ADD PRODUCT TO SALE
              </label>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product (e.g. Nugget)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Popup Notification Alert inside modal */}
            {stockAlert && (
              <div className="mb-3 flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{stockAlert}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStockAlert(null)}
                  className="text-rose-400 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Close alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Product selection grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/30">
              {availableProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                const { priceKg, pricePcs, isOutOfStock, stockLabel } = getProductStockInfo(prod);

                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-98 ${
                      isOutOfStock
                        ? 'border-rose-200/80 bg-rose-50/25 hover:bg-rose-50/60 hover:border-rose-300'
                        : isSelected
                        ? 'border-purple-600 bg-purple-100/70 shadow-xs ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-2xs'
                    }`}
                    title={
                      isOutOfStock
                        ? `${prod.name} (Out of Stock - Click to view available stock)`
                        : `Select ${prod.name}`
                    }
                  >
                    <div className="flex items-start justify-between gap-1.5 w-full">
                      <div
                        className={`text-xs font-bold truncate flex-1 ${
                          isOutOfStock ? 'text-slate-700' : 'text-slate-900'
                        }`}
                        title={prod.name}
                      >
                        {prod.name}
                      </div>
                      {isOutOfStock && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200/80 whitespace-nowrap shrink-0">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[11px] font-semibold mt-1 ${
                        isOutOfStock ? 'text-slate-500' : 'text-purple-700'
                      }`}
                    >
                      {priceKg ? `৳${priceKg} / KG` : pricePcs ? `৳${pricePcs} / PCS` : 'No Rate'}
                    </div>

                    {isOutOfStock ? (
                      <div className="text-[10px] font-semibold text-rose-600 mt-0.5 flex items-center justify-between">
                        <span>Out of Stock</span>
                        <span className="text-[9px] text-rose-500 font-normal">({stockLabel})</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                        Stock: <span className="font-bold text-emerald-600">{stockLabel}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 & 4: UNIT SELECTION & QUANTITY (Shows when product selected) */}
          {selectedProduct && productPricing && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 uppercase">Selected Product:</span>
                  <span className="text-sm font-extrabold text-slate-900 ml-2">{selectedProduct.name}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-600">
                  Stock:{' '}
                  <span className="font-bold text-emerald-600">
                    {selectedUnit === 'KG' ? `${selectedProduct.stockKg} KG` : `${selectedProduct.stockPcs} PCS`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* STEP 3: AVAILABLE UNIT (Req #16, #18, #105: Only show available units for this price type, NEVER gram!) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    AVAILABLE UNIT *
                  </label>
                  <div className="flex gap-2">
                    {productPricing.hasKg && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProduct.stockKg <= 0) {
                            const alertMsg = `Insufficient stock! Available: 0 KG.`;
                            showToast(alertMsg, 'error');
                            setStockAlert(alertMsg);
                            return;
                          }
                          setSelectedUnit('KG');
                          setQuantity(1);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          selectedProduct.stockKg <= 0
                            ? 'bg-rose-50/50 text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                            : selectedUnit === 'KG'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        KG (৳{productPricing.kgPrice}) {selectedProduct.stockKg <= 0 && '(0 KG - Out of Stock)'}
                      </button>
                    )}

                    {productPricing.hasPcs && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProduct.stockPcs <= 0) {
                            const alertMsg = `Insufficient stock! Available: 0 PCS.`;
                            showToast(alertMsg, 'error');
                            setStockAlert(alertMsg);
                            return;
                          }
                          setSelectedUnit('PCS');
                          setQuantity(10);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          selectedProduct.stockPcs <= 0
                            ? 'bg-rose-50/50 text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                            : selectedUnit === 'PCS'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        PCS (৳{productPricing.pcsPrice}) {selectedProduct.stockPcs <= 0 && '(0 PCS - Out of Stock)'}
                      </button>
                    )}

                    {!productPricing.hasKg && !productPricing.hasPcs && (
                      <div className="text-xs text-rose-600 font-medium">
                        No {saleType.toLowerCase()} price configured for this item.
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 4: HOW MUCH DID YOU SELL? */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    HOW MUCH DID YOU SELL? ({selectedUnit}) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={selectedUnit === 'KG' ? 'any' : '1'}
                      min={selectedUnit === 'KG' ? '0.001' : '1'}
                      value={quantity || ''}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                      placeholder={selectedUnit === 'KG' ? 'e.g. 1, 1.5, 3.4' : 'e.g. 1'}
                    />
                    <span className="text-xs font-extrabold text-purple-800 shrink-0">{selectedUnit}</span>
                  </div>

                  {/* Quick helper buttons for KG / PCS (Req #18: 0.5 KG, 1 KG, 1.5 KG, 2 KG, NO GRAM!) */}
                  {selectedUnit === 'KG' ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      {[0.5, 1, 1.5, 2].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuantity(q)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100/70 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer"
                        >
                          {q} KG
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2">
                      {[5, 10, 20, 50].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuantity(q)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100/70 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer"
                        >
                          {q} PCS
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtotal preview & Add Button */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-200/50">
                <div className="text-xs text-slate-600">
                  Item Total:{' '}
                  <span className="font-extrabold text-slate-900 text-base">
                    ৳{currentItemTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD PRODUCT</span>
                </button>
              </div>
            </div>
          )}

          {/* CURRENT SALE ITEMS LIST */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                CURRENT SALE ITEMS ({saleItems.length})
              </label>
              {saleItems.length > 0 && (
                <span className="text-xs sm:text-sm font-extrabold text-purple-700">
                  ৳{grandTotal.toLocaleString()}
                </span>
              )}
            </div>

            {saleItems.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 bg-slate-50/50">
                No products added yet. Select a product above and click "+ ADD PRODUCT"
              </div>
            ) : (
              <>
                {/* Mobile Responsive Card Layout (Matches 2nd Image) */}
                <div className="sm:hidden space-y-2.5">
                  {saleItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.productName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Rate: ৳{item.unitPrice} / {item.unit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="border-t border-slate-100 my-2.5" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 font-medium">Qty:</span>
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="text-xs font-bold">
                          <span className="text-slate-500 mr-1.5 uppercase font-semibold text-[10px]">SUBTOTAL:</span>
                          <span className="text-sm font-extrabold text-purple-700">
                            ৳{item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {saleItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{item.unit}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">৳{item.unitPrice}</td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-purple-700">
                              ৳{item.subtotal.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ADMIN ATTRIBUTION & PAYMENT (IF ADMIN) */}
          {currentUser?.role === 'ADMIN' && (
            <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  ORDER ATTRIBUTION & PAYMENT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-extrabold">ADMIN CONTROL</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    RECORDED UNDER / AGENT:
                  </label>
                  <select
                    value={assignedAgentId}
                    onChange={(e) => setAssignedAgentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
                  >
                    <option value="">Direct Outlet / Counter Sale (Admin)</option>
                    {(users || [])
                      .filter((u) => u.role === 'AGENT' && u.status === 'ACTIVE')
                      .map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          Assign to: {agent.name} ({agent.phone})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PAYMENT STATUS:
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
                  >
                    <option value="PAID">Paid (Cash / Bkash / Instant)</option>
                    <option value="UNPAID">Unpaid (Credit / Due)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER INFORMATION (OPTIONAL) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              CUSTOMER INFORMATION (OPTIONAL)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer / Shop Name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Delivery Address"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 border-t border-slate-100 bg-slate-50/90">
          <div className="flex items-baseline justify-between sm:justify-start gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase">GRAND TOTAL:</span>
            <span className="text-xl sm:text-2xl font-extrabold text-purple-700">
              ৳{grandTotal.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">({saleItems.length} items)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSellModalOpen(false)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceedToConfirm}
              disabled={saleItems.length === 0}
              className="flex-2 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Review & Confirm Sale</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL SUMMARY */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Confirm Sale & Issue Invoice?</h3>
            <p className="text-xs text-slate-600 mb-4">
              This will deduct stock, issue a digital cash memo, and add ৳{grandTotal.toLocaleString()} to your Due
              balance.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-600">Sale Type:</span>
                <span className="font-bold text-slate-900">{saleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer:</span>
                <span className="font-semibold text-slate-900">{customerName || 'Direct Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Items:</span>
                <span className="font-semibold text-slate-900">{saleItems.length} products</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-sm">
                <span className="text-slate-900">Grand Total:</span>
                <span className="text-purple-700">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSale}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Recording Sale...' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
