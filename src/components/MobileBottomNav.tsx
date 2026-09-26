import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  ShoppingBag,
  Boxes,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, setIsSellModalOpen } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';

  if (isAdmin) {
    return (
      <nav
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))' }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 grid grid-cols-5 items-center shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] whitespace-nowrap">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'products' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] whitespace-nowrap">Product</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sales' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] whitespace-nowrap">Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('due')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'due' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] whitespace-nowrap">Due</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'agents' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] whitespace-nowrap">Executive</span>
        </button>
      </nav>
    );
  }

  // Agent Bottom Nav with Sell Button
  return (
    <nav
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))' }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
    >
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          activeTab === 'dashboard' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Dashboard</span>
      </button>

      <button
        onClick={() => setActiveTab('products')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          activeTab === 'products' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px]">Product</span>
      </button>

      {/* Prominent Sell Product button for Agent */}
      <button
        onClick={() => setIsSellModalOpen(true)}
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-transform cursor-pointer"
        aria-label="Sell Product"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab('sales')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          activeTab === 'sales' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[10px]">Sales</span>
      </button>

      <button
        onClick={() => setActiveTab('due')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          activeTab === 'due' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
        }`}
      >
        <DollarSign className="w-5 h-5" />
        <span className="text-[10px]">Due & Pay</span>
      </button>
    </nav>
  );
};
