import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/googleAppsScriptCode';
import { Table, Copy, Check, ExternalLink, RefreshCw, X, Database, ShieldCheck, Download } from 'lucide-react';

export const GoogleSheetModal: React.FC = () => {
  const {
    isGoogleSheetModalOpen,
    setIsGoogleSheetModalOpen,
    settings,
    updateSettings,
    syncWithGoogleSheets,
    showToast,
  } = useApp();

  const [url, setUrl] = useState(settings.googleAppsScriptUrl || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isGoogleSheetModalOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    showToast('Google Apps Script code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    await updateSettings({ googleAppsScriptUrl: url.trim() });
    if (url.trim()) {
      await syncWithGoogleSheets(url.trim());
    } else {
      showToast('Operating in high-speed local database mode', 'info');
    }
    setIsSyncing(false);
  };

  const handleExportJson = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `deshi_bite_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(dlUrl);
      showToast('Backup JSON downloaded', 'success');
    } catch (e) {
      showToast('Failed to export backup', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto mx-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Google Sheets Integration</h2>
              <p className="text-xs text-slate-600 font-medium">Automatic cloud synchronization with Google Sheets</p>
            </div>
          </div>
          <button
            onClick={() => setIsGoogleSheetModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          {/* Status Indicator */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  settings.googleAppsScriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {settings.googleAppsScriptUrl ? 'Google Sheet Synced & Active' : 'Local Storage Engine Active'}
                </div>
                <div className="text-[11px] text-slate-600">
                  {settings.googleAppsScriptUrl
                    ? 'Sales, inventory & due entries push to Google Sheets automatically.'
                    : 'Changes persist in local database. Connect your sheet below for cloud sync.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Web App URL Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              GOOGLE APPS SCRIPT WEB APP URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
              />
              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Connecting...' : 'Save & Sync'}</span>
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-900 tracking-wider">
                HOW TO CONNECT YOUR GOOGLE SHEET (5-MINUTE SETUP)
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 shadow-2xs transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code.gs'}</span>
              </button>
            </div>

            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Create a new Google Sheet in Google Drive (e.g. <b>DESHI BITE Database</b>).
              </li>
              <li>
                Click on <b>Extensions &gt; Apps Script</b> in the Google Sheet top menu.
              </li>
              <li>
                Delete existing code, paste the copied <b>Code.gs</b> script from the button above.
              </li>
              <li>
                Click <b>Deploy &gt; New deployment</b>. Choose <b>Web app</b>. Set "Execute as: Me" and "Who has access:
                <b> Anyone</b>".
              </li>
              <li>
                Copy the deployed <b>Web app URL</b> and paste it into the field above, then click <b>Save & Sync</b>.
              </li>
            </ol>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={() => setIsGoogleSheetModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
