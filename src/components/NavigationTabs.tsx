import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  ShoppingBag,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, users, notifications, setIsSellModalOpen } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const pendingExecutivesCount = users.filter((u) => u.role === 'AGENT' && u.status === 'PENDING').length;

  const adminTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'agents',
      label: 'Executives',
      icon: Users,
      badge: pendingExecutivesCount > 0 ? pendingExecutivesCount : undefined,
    },
    { id: 'products', label: 'Product', icon: Package },
    { id: 'stock', label: 'Stock Management', icon: Boxes },
    { id: 'sales', label: 'All Sales & Invoices', icon: ShoppingCart },
    { id: 'due', label: 'Due & Payments', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const agentTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product', icon: Package },
    { id: 'sales', label: 'My Sales & Memos', icon: ShoppingCart },
    { id: 'due', label: 'My Due & Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const tabs = isAdmin ? adminTabs : agentTabs;

  return (
    <nav className="hidden lg:flex items-center gap-1.5 p-1.5 app-card rounded-2xl overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
            <span>{tab.label}</span>
            {tab.badge ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}

      {!isAdmin && (
        <button
          onClick={() => setIsSellModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 hover:scale-102 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>SELL PRODUCT</span>
        </button>
      )}
    </nav>
  );
};
