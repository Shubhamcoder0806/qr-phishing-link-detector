import React from 'react';
import { Shield, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">PhishCheck</span>
          <span>© 2026 PhishCheck Team. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Powered by Python FastAPI, Scikit-Learn & React</span>
        </div>
      </div>
    </footer>
  );
}
