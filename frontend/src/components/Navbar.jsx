import React from 'react';
import { Shield, QrCode, Link2, Layers, History, Database, BarChart3, BookOpen, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenDatasetGuide }) {
  const navItems = [
    { id: 'url', label: 'URL Scanner', icon: Link2 },
    { id: 'qr', label: 'QR Scanner', icon: QrCode },
    { id: 'batch', label: 'Batch Scan', icon: Layers },
    { id: 'pentest', label: 'Pen-Tester Suite', icon: Terminal },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'database', label: 'Threat DB', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('url')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">PhishCheck</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PhiUSIIL v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Pen-Tester Threat Suite</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDatasetGuide}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Datasets Guide</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
