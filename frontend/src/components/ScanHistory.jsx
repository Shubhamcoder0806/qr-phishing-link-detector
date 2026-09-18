import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Download, Search, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function ScanHistory() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/history?limit=50');
      setLogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredLogs = logs.filter(item => 
    item.url.toLowerCase().includes(filter.toLowerCase()) ||
    item.status.toLowerCase().includes(filter.toLowerCase())
  );

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "URL", "Scan Type", "Status", "Risk Score", "Timestamp"];
    const rows = logs.map(l => [l.id, `"${l.url}"`, l.scan_type, l.status, l.risk_score, l.timestamp]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `phishcheck_scan_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <History className="w-3.5 h-3.5" />
          <span>Audit Log & Threat Record</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Scan History Logs
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Review all recent URL and QR code scans stored securely in your SQLite database.
        </p>
      </div>

      <div className="max-w-5xl mx-auto glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search history logs..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchHistory}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Scan Type</th>
                <th className="px-4 py-3 text-right">Risk Score</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No scan history logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
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
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-all font-mono">
                      <td className="px-4 py-3 text-slate-500">#{item.id}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1 ${badge}`}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white max-w-xs truncate">{item.url}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{item.scan_type}</td>
                      <td className="px-4 py-3 text-right font-extrabold font-sans text-sm text-slate-200">
                        {item.risk_score} / 100
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-sans">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
