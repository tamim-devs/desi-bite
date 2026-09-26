import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Save,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wallet,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    currentUser,
    updateProfile,
    changePassword,
    showToast,
    mongoStatus,
    setIsMongoModalOpen,
    syncMongo,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Admin sub-tabs: 'profile' or 'business'
  const [adminTab, setAdminTab] = useState<'profile' | 'business'>('profile');

  // Profile fields (Name & Phone are strictly immutable/read-only)
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Keep email & address in sync if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Business settings fields (Admin only)
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [phone, setPhone] = useState(settings.phone);
  const [businessAddress, setBusinessAddress] = useState(settings.address);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoiceFooter);
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState(settings.googleAppsScriptUrl || '');
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle Profile Update (Email & Address only)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({ email: email.trim(), address: address.trim() });
    setIsSavingProfile(false);
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (!newPassword.trim()) {
      showToast('Please enter a new password', 'error');
      return;
    }
    if (newPassword.trim().length < 4) {
      showToast('New password must be at least 4 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(oldPassword.trim(), newPassword.trim());
    setIsChangingPassword(false);

    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Handle Business Settings Update (Admin only)
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBusiness(true);
    await updateSettings({
      businessName,
      subtitle,
      phone,
      address: businessAddress,
      invoiceFooter,
      googleAppsScriptUrl: googleAppsScriptUrl.trim(),
    });
    setIsSavingBusiness(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-700" />
          <span>{isAdmin ? 'System & Account Settings' : 'Executive Profile & Security Settings'}</span>
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          {isAdmin
            ? 'Manage your personal security credentials, business branding, and cloud database integrations'
            : 'Review your account credentials, update contact information, and manage your login password'}
        </p>
      </div>

      {/* Admin Sub-Tabs */}
      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setAdminTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'profile'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>My Profile & Password</span>
          </button>
          <button
            onClick={() => setAdminTab('business')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'business'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Branding & System</span>
          </button>
        </div>
      )}

      {/* SECTION 1: PROFILE & PASSWORD (For Agent, or Admin when adminTab === 'profile') */}
      {(!isAdmin || adminTab === 'profile') && (
        <div className="space-y-6">
          {/* Agent Status Card (Only shown for Agent) */}
          {!isAdmin && currentUser && (
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4 border border-purple-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-extrabold text-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold">{currentUser.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                        AUTHORIZED AGENT
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>ID: {currentUser.id}</span>
                      <span>•</span>
                      <span>Phone: {currentUser.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-purple-200 text-[11px]">Joined: {currentUser.joinedDate}</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
                    Current Outstanding Due
                  </div>
                  <div className="text-lg font-black text-rose-300 mt-0.5 flex items-baseline gap-0.5">
                    <span className="font-black select-none">৳</span>
                    <span>{(currentUser.currentDue || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
                    My Cleared Payments
                  </div>
                  <div className="text-lg font-black text-emerald-300 mt-0.5 flex items-baseline gap-0.5">
                    <span className="font-black select-none">৳</span>
                    <span>{(currentUser.totalPaid || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
                    Lifetime Sales Value
                  </div>
                  <div className="text-lg font-black text-purple-200 mt-0.5 flex items-baseline gap-0.5">
                    <span className="font-black select-none">৳</span>
                    <span>{(currentUser.totalSales || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Profile Details (Name & Phone strictly locked; Email & Address editable) */}
            <div className="app-card rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Personal & Contact Info</h3>
                      <p className="text-[11px] text-slate-500">Name and phone number are permanently locked</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Locked Identity</span>
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} id="profile-form" className="space-y-4 mt-4">
                  {/* Name (LOCKED) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>ACCOUNT NAME</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400 italic">Permanent / Cannot be changed</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={currentUser?.name || ''}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 cursor-not-allowed pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number (LOCKED) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>REGISTERED PHONE (LOGIN ID)</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400 italic">Permanent / Cannot be changed</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={currentUser?.phone || ''}
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 cursor-not-allowed pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Email (EDITABLE) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>EMAIL ADDRESS</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. executive@deshibite.com"
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Used for notifications and invoice receipts</p>
                  </div>

                  {/* Address (EDITABLE) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>SHOP / DELIVERY ADDRESS</span>
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your retail shop, office, or delivery address..."
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  form="profile-form"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>

            {/* Right Card: Password Change Section */}
            <div className="app-card rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
                      <p className="text-[11px] text-slate-500">Update your secret login password</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Protected</span>
                  </span>
                </div>

                <form onSubmit={handleChangePassword} id="password-form" className="space-y-4 mt-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      CURRENT PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      After changing your password, you can immediately log in across all devices with your new password.
                    </span>
                  </div>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  form="password-form"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: BUSINESS BRANDING & SYSTEM (Admin Only, when adminTab === 'business') */}
      {isAdmin && adminTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="app-card rounded-2xl p-6 space-y-5">
          {/* Business Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                BUSINESS NAME
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                BUSINESS TAGLINE / SUBTITLE
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                HOTLINE / PHONE
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                FACTORY / OFFICE ADDRESS
              </label>
              <input
                type="text"
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
              />
            </div>
          </div>

          {/* Invoice Footer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              INVOICE FOOTER NOTICE
            </label>
            <input
              type="text"
              required
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
            />
          </div>

          {/* Google Apps Script Web App URL */}
          <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900">
              GOOGLE APPS SCRIPT WEB APP URL (OPTIONAL)
            </label>
            <input
              type="url"
              value={googleAppsScriptUrl}
              onChange={(e) => setGoogleAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:border-purple-500 bg-white"
            />
            <p className="text-[11px] text-slate-600">
              Enables two-way synchronization between this system and your Google Sheet. Leave empty to use local database.
            </p>
          </div>

          {/* MongoDB Cloud Database Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    MONGODB ATLAS CLOUD PERSISTENCE
                  </h4>
                  <p className="text-[11px] text-emerald-800/80">
                    Live cloud database engine powered by official MongoDB driver
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  mongoStatus?.connected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    mongoStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {mongoStatus?.connected ? 'Cloud Connected' : 'Local Storage Mode'}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              {mongoStatus?.connected ? (
                <p>
                  Connected to database: <strong>{mongoStatus.database || 'deshi_bite'}</strong>. All product catalogs,
                  stock transactions, sales memos, and executive dues automatically sync to MongoDB Atlas in real time.
                </p>
              ) : (
                <p>
                  MongoDB URI is not yet connected. All transactions are currently safely preserved in local memory and file
                  storage. You can connect your MongoDB Atlas cluster in 1 click.
                </p>
              )}
              {mongoStatus?.maskedUri && (
                <p className="font-mono text-[11px] text-slate-500 truncate bg-white/70 p-1.5 rounded-lg border border-slate-200">
                  URI: {mongoStatus.maskedUri}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsMongoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{mongoStatus?.connected ? 'Manage MongoDB Atlas' : 'Connect MongoDB Atlas'}</span>
              </button>

              {mongoStatus?.connected && (
                <button
                  type="button"
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncMongo('push');
                    setIsSyncing(false);
                  }}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Force Cloud Sync</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSavingBusiness}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingBusiness ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
