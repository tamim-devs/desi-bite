import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Cloud, CheckCircle2, AlertCircle, RefreshCw, X, ArrowUpRight, Shield, Copy, Check, Server } from 'lucide-react';

export const MongoModal: React.FC = () => {
  const {
    isMongoModalOpen,
    setIsMongoModalOpen,
    mongoStatus,
    checkMongoStatus,
    connectMongo,
    syncMongo,
    showToast,
  } = useApp();

  const [inputUri, setInputUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'push' | 'pull'>('push');
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    if (isMongoModalOpen) {
      checkMongoStatus();
    }
  }, [isMongoModalOpen]);

  if (!isMongoModalOpen) return null;

  const handleConnect = async () => {
    if (!inputUri.trim()) {
      showToast('Please enter your MongoDB connection string (URI)', 'error');
      return;
    }
    setIsConnecting(true);
    const res = await connectMongo(inputUri.trim());
    setIsConnecting(false);
    if (res.success) {
      setInputUri('');
    }
  };

  const handleSync = async (direction: 'push' | 'pull') => {
    setIsSyncing(true);
    setSyncDirection(direction);
    await syncMongo(direction);
    setIsSyncing(false);
  };

  const sampleUri = 'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority';

  const copySample = () => {
    navigator.clipboard.writeText(sampleUri);
    setCopiedSample(true);
    showToast('Sample URI format copied', 'info');
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const isConnected = mongoStatus?.connected;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-emerald-100 overflow-hidden my-auto mx-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm ${isConnected ? 'bg-emerald-600' : 'bg-slate-700'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">MongoDB Atlas Cloud Database</h3>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isConnected ? 'Cloud Connected' : 'Local Fallback'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Official MongoDB Driver (Cloud Persistence Engine)</p>
            </div>
          </div>
          <button
            onClick={() => setIsMongoModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">

          {/* Connection Status Card */}
          <div className={`p-4 rounded-2xl border ${
            isConnected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-bold text-base">
                  {isConnected ? 'MongoDB Cloud Active & Synchronized' : 'MongoDB Cloud URI Not Connected Yet'}
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {isConnected
                    ? `Data is automatically stored and preserved in your MongoDB Atlas cloud database "${mongoStatus?.database || 'deshi_bite'}". All sales, stock changes, products, and executive payments are persistently saved in the cloud.`
                    : 'The app is currently running in resilient local storage mode. To keep all data permanently in MongoDB Cloud (Atlas), connect your MongoDB connection string below.'}
                </p>

                {mongoStatus?.maskedUri && (
                  <div className="mt-2 text-xs font-mono bg-white/80 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 truncate">
                    Active URI: {mongoStatus.maskedUri}
                  </div>
                )}

                {mongoStatus?.error && (
                  <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <strong>Notice:</strong> {mongoStatus.error}
                  </div>
                )}
              </div>
            </div>

            {/* Cloud Document Counts */}
            {isConnected && mongoStatus?.counts && (
              <div className="mt-4 pt-3 border-t border-emerald-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <div className="text-base font-extrabold text-emerald-700">{mongoStatus.counts.products}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Products</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <div className="text-base font-extrabold text-emerald-700">{mongoStatus.counts.sales}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Sales Invoices</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <div className="text-base font-extrabold text-emerald-700">{mongoStatus.counts.users}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Executives & Users</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-emerald-100">
                  <div className="text-base font-extrabold text-emerald-700">{mongoStatus.counts.payments}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Payment Due Logs</div>
                </div>
              </div>
            )}
          </div>

          {/* Connect / Change Connection String Form */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                {isConnected ? 'Update / Reconnect MongoDB Atlas URI' : 'Connect MongoDB Atlas Connection String'}
              </label>
              <button
                type="button"
                onClick={copySample}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
              >
                {copiedSample ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Sample URI
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={inputUri}
                onChange={(e) => setInputUri(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-500">
                You can also set the <code>MONGODB_URI</code> environment variable in your AI Studio project settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Connecting to Cloud...
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    Connect & Verify Database
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => checkMongoStatus()}
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check Status
              </button>

              {isConnected && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSync('push')}
                    disabled={isSyncing}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing && syncDirection === 'push' ? 'animate-spin' : ''}`} />
                    Push All to Cloud
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSync('pull')}
                    disabled={isSyncing}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing && syncDirection === 'pull' ? 'animate-spin' : ''}`} />
                    Pull from Cloud
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Step by step guide to MongoDB Atlas */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              How to get a Free MongoDB Atlas Cloud Database (3 Minutes Setup)
            </h4>
            <div className="space-y-2.5 text-xs bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong>Create a Free Cluster:</strong> Go to{' '}
                  <a
                    href="https://www.mongodb.com/cloud/atlas/register"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    mongodb.com/cloud/atlas <ArrowUpRight className="w-3 h-3" />
                  </a>
                  , create a free account and choose the <strong>M0 (Free)</strong> cluster.
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong>Set Network Access:</strong> In the MongoDB Atlas sidebar, click <strong>Network Access</strong> → <strong>Add IP Address</strong> → Select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>.
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong>Database Access & User:</strong> Click <strong>Database Access</strong> → <strong>Add New Database User</strong> → Set a username and password (e.g. <code>deshi_admin</code>).
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <div>
                  <strong>Get Connection String:</strong> Click <strong>Clusters</strong> → <strong>Connect</strong> → <strong>Drivers</strong> (Node.js) → Copy the connection string (format: <code>mongodb+srv://...</code>), replace <code>&lt;password&gt;</code> with your password, and paste it above!
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            DESHI BITE Enterprise • MongoDB Cloud Engine
          </span>
          <button
            type="button"
            onClick={() => setIsMongoModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
