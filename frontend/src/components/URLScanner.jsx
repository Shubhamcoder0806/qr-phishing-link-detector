import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, ShieldCheck, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import RiskMeter from './RiskMeter';
import FeatureBreakdown from './FeatureBreakdown';

export default function URLScanner() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleUrls = [
    { label: 'Google (Safe)', url: 'https://google.com' },
    { label: 'PayPal Phish Demo', url: 'https://paypal-verify-account.info' },
    { label: 'Malware Site Demo', url: 'https://malware-site.com' },
    { label: 'IP Address Login', url: 'http://192.168.1.100/login' },
    { label: 'Shortened Link', url: 'https://bit.ly/suspicious' }
  ];

  const handleScan = async (targetUrl) => {
    const urlToScan = targetUrl || urlInput;
    if (!urlToScan.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/scan/url', { url: urlToScan.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to scan URL. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Lexical ML Threat Detection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Scan URLs & Detect Phishing Threats
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Analyze suspicious domain names, phishing patterns, URL obfuscation, and malware signatures using our trained Random Forest Classifier.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="max-w-3xl mx-auto glass-panel p-4 sm:p-6 rounded-2xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URL here (e.g. https://paypal-security-update.com)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-medium transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Scan URL</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Quick Test Samples:</span>
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrlInput(sample.url);
                handleScan(sample.url);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-all font-mono"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-800 pb-6">
            
            {/* Risk Gauge */}
            <div className="flex justify-center">
              <RiskMeter score={result.risk_score} status={result.status} confidence={result.confidence} />
            </div>

            {/* Verdict summary */}
            <div className="md:col-span-2 space-y-3 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Result</span>
                {result.db_match && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                    Threat DB Instant Match
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white flex items-center gap-2 break-all">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5 text-cyan-300">
                  {result.url}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </h2>

              <p className="text-sm text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-medium">
                {result.message}
              </p>
            </div>
          </div>

          {/* Feature Breakdown Component */}
          <FeatureBreakdown features={result.features} />
        </div>
      )}
    </div>
  );
}
