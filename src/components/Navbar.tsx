import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Table,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Shield,
  ShoppingBag,
  Database,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    logout,
    notifications,
    setIsNotificationModalOpen,
    setIsGoogleSheetModalOpen,
    setIsMongoModalOpen,
    mongoStatus,
    settings,
    activeTab,
    setActiveTab,
    setIsSellModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead && (n.targetRole === 'ALL' || n.targetRole === currentUser?.role)).length;

  const isAdmin = currentUser?.role === 'ADMIN';

  const pendingExecutivesCount = users.filter((u) => u.role === 'AGENT' && u.status === 'PENDING').length;

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'agents', label: 'Executives', icon: Users, badge: pendingExecutivesCount > 0 ? pendingExecutivesCount : undefined },
        { id: 'products', label: 'Product', icon: Package },
        { id: 'stock', label: 'Stock Management', icon: Boxes },
        { id: 'sales', label: 'All Sales & Invoices', icon: ShoppingCart },
        { id: 'due', label: 'Due & Payments', icon: DollarSign },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Product', icon: Package },
        { id: 'sales', label: 'My Sales & Memos', icon: ShoppingCart },
        { id: 'due', label: 'My Due & Payments', icon: DollarSign },
        { id: 'settings', label: 'Profile & Settings', icon: Settings },
      ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand + Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-purple-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  DB
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base">DESHI BITE</span>
                    <span
                      className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <span className="sm:hidden">{isAdmin ? 'ADMIN' : 'EXECUTIVE'}</span>
                      <span className="hidden sm:inline">{isAdmin ? 'ADMIN SUITE' : 'EXECUTIVE PORTAL'}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium hidden md:block">
                    Sales, Stock & Executive Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* MongoDB Cloud Driver Status Button - Admin Only (Hidden on mobile, accessible via Menu drawer) */}
              {isAdmin && (
                <button
                  onClick={() => setIsMongoModalOpen(true)}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shadow-2xs cursor-pointer ${
                    mongoStatus?.connected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                  }`}
                  title="MongoDB Atlas Cloud Database Connection & Status"
                >
                  <Database className={`w-3.5 h-3.5 ${mongoStatus?.connected ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className="hidden lg:inline">
                    {mongoStatus?.connected ? 'MongoDB Cloud Synced' : 'Connect MongoDB'}
                  </span>
                  <span className="lg:hidden">MongoDB</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      mongoStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                </button>
              )}

              {/* Connect Google Sheet Button - Admin Only (Hidden on mobile, accessible via Menu drawer) */}
              {isAdmin && (
                <button
                  onClick={() => setIsGoogleSheetModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-full border border-slate-200 hover:border-purple-300 transition-all shadow-2xs cursor-pointer"
                  title="Google Sheets Database Connection"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline">
                    {settings.googleAppsScriptUrl ? 'Google Sheet Synced' : 'Connect Google Sheet'}
                  </span>
                  <span className="lg:hidden">Sheets</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      settings.googleAppsScriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                </button>
              )}

              {/* Sell Product Button for Agent in Header (Optional quick trigger) */}
              {!isAdmin && (
                <button
                  onClick={() => setIsSellModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full shadow-sm hover:shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sell Product</span>
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="relative p-2 rounded-full text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill */}
              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity group"
                    title="Account Settings & Security"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs group-hover:scale-105 transition-transform">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-600">{currentUser.phone}</div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  DB
                </div>
                <span className="font-extrabold text-slate-900">DESHI BITE</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              {!isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSellModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm mb-3 shadow-md shadow-purple-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>SELL PRODUCT</span>
                </button>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-100/70 text-purple-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-700' : 'text-slate-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
              {/* Admin Database Integrations Quick Access */}
              {isAdmin && (
                <div className="pt-3 pb-1 space-y-2 border-t border-slate-100 my-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3">
                    Database Connections
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsMongoModalOpen(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      mongoStatus?.connected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Database className={`w-3.5 h-3.5 ${mongoStatus?.connected ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span>MongoDB Atlas</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${mongoStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      {mongoStatus?.connected ? 'Synced' : 'Connect'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsGoogleSheetModalOpen(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.googleAppsScriptUrl
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Sheets</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${settings.googleAppsScriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      {settings.googleAppsScriptUrl ? 'Synced' : 'Connect'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-600">{currentUser?.phone}</p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mt-3 w-full py-2 px-3 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
