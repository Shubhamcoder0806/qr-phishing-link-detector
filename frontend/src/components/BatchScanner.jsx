import React, { useState } from 'react';
import axios from 'axios';
import { Layers, Loader2, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function BatchScanner() {
  const [urlsInput, setUrlsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleBatchScan = async () => {
    const list = urlsInput
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (list.length === 0) {
      setError("Please paste at least one valid URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/scan/batch', { urls: list });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to execute batch scan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Bulk URL Threat Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Batch URL Threat Scanner
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Paste multiple URLs (one per line) to evaluate threat scores simultaneously.
        </p>
      </div>

      <div className="max-w-3xl mx-auto glass-panel p-6 rounded-2xl space-y-4">
        <textarea
          rows={6}
          value={urlsInput}
          onChange={(e) => setUrlsInput(e.target.value)}
          placeholder={`https://google.com\nhttps://paypal-verify-account.info\nhttps://malware-site.com\nhttp://192.168.1.1/login`}
          className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm font-mono transition-all"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-400">
            Enter up to 50 URLs separated by newlines
          </span>
          <button
            onClick={handleBatchScan}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Scan Batch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Scanned</span>
              <div className="text-2xl font-bold text-white mt-1">{result.total}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase">Safe URLs</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{result.safe_count}</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
              <span className="text-xs font-semibold text-amber-400 uppercase">Suspicious</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{result.suspicious_count}</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
              <span className="text-xs font-semibold text-rose-400 uppercase">Malicious</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{result.malicious_count}</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3 text-right">Risk Score</th>
                  <th className="px-4 py-3">Diagnostic Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {result.scanned.map((item, idx) => {
                  let badge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                  let Icon = CheckCircle2;
                  if (item.status === 'suspicious') {
                    badge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    Icon = AlertTriangle;
                  } else if (item.status === 'malicious') {
                    badge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                    Icon = AlertOctagon;
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-all">
                      <td className="px-4 py-3 font-sans">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold inline-flex items-center gap-1.5 ${badge}`}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white break-all max-w-xs">{item.url}</td>
                      <td className="px-4 py-3 text-right font-extrabold font-sans text-sm">{item.risk_score} / 100</td>
                      <td className="px-4 py-3 text-slate-400 max-w-sm truncate font-sans">{item.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
