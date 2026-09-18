import React, { useState } from 'react';
import axios from 'axios';
import { Database, Search, ShieldCheck, AlertOctagon, Loader2 } from 'lucide-react';

export default function DatabaseSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.get(`/api/threats/search?q=${encodeURIComponent(query.trim())}`);
      setResults(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Database className="w-3.5 h-3.5" />
          <span>Database Lookup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Search Threat Database
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Search indexed safe domains, phishing blacklists, and malware indicators stored in the SQLite database.
        </p>
      </div>

      <div className="max-w-3xl mx-auto glass-panel p-6 rounded-2xl space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search domain or URL (e.g., paypal, google, malware)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>
      </div>

      {searched && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Search Results</h3>
            <span className="text-xs text-slate-400">{results.length} matches found</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Source Dataset</th>
                  <th className="px-4 py-3 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-sans">
                      No matching records found in the database.
                    </td>
                  </tr>
                ) : (
                  results.map((item) => {
                    let badge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    if (item.category === 'phishing' || item.category === 'malware' || item.category === 'malicious') {
                      badge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                    } else if (item.category === 'suspicious') {
                      badge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-all font-mono">
                        <td className="px-4 py-3 font-sans">
                          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase ${badge}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-white break-all max-w-sm">{item.url}</td>
                        <td className="px-4 py-3 text-slate-400 font-sans">{item.source}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-sm font-sans">{item.risk_score}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
