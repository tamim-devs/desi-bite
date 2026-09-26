import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Eye, EyeOff, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, registerAgent, showToast } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(phone.trim(), password);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    const success = await registerAgent({
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      address: regAddress.trim(),
    });
    setLoading(false);
    if (success) {
      setMode('LOGIN');
      setPhone(regPhone.trim());
      setPassword('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md app-card rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-purple-500/20 mx-auto">
            DB
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DESHI BITE</h1>
          <p className="text-xs text-slate-600 font-medium">Sales, Stock & Executive Management System</p>
        </div>

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'LOGIN' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'REGISTER' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive Registration
          </button>
        </div>

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01711000000"
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PASSWORD *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access Credentials */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                QUICK ACCESS / TEST CREDENTIALS
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhone('01613522678');
                    setPassword('02369');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-[11px] font-bold text-purple-900 text-center transition-colors cursor-pointer"
                >
                  <span className="block font-extrabold">👑 Admin Manager</span>
                  <span className="text-[10px] text-purple-700 font-mono font-medium">01613522678 • 02369</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhone('01763213388');
                    setPassword('123456');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-800 text-center transition-colors cursor-pointer"
                >
                  <span className="block font-extrabold">💼 Field Executive</span>
                  <span className="text-[10px] text-slate-600 font-mono font-medium">01763213388 • 123456</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Md. Kabir Hossain"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="019XXXXXXXX"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                TERRITORY / ADDRESS
              </label>
              <input
                type="text"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="e.g. Mirpur, Dhaka"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                CHOOSE PASSWORD *
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 bg-white"
              />
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              New executive accounts require approval by the business administrator before logging in.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Submitting Registration...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
