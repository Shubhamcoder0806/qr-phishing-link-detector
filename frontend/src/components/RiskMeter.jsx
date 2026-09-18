import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskMeter({ score, status, confidence }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let strokeColor = '#10b981';
  let bgGlow = 'glow-safe';
  let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'SAFE';

  if (status === 'suspicious' || (score >= 40 && score < 70)) {
    colorClass = 'text-amber-500';
    strokeColor = '#f59e0b';
    bgGlow = 'glow-suspicious';
    statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
    label = 'SUSPICIOUS';
  } else if (status === 'malicious' || score >= 70) {
    colorClass = 'text-rose-500';
    strokeColor = '#f43f5e';
    bgGlow = 'glow-danger';
    statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = AlertOctagon;
    label = 'MALICIOUS';
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl glass-panel ${bgGlow} transition-all duration-500`}>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${colorClass}`}>
            {score}
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      <div className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${statusBadge}`}>
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>

      {confidence && (
        <p className="text-xs text-slate-400 mt-2">
          Model Confidence: <span className="text-slate-200 font-mono font-medium">{(confidence * 100).toFixed(0)}%</span>
        </p>
      )}
    </div>
  );
}
