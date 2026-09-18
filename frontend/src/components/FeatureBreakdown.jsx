import React from 'react';
import { 
  Lock, AlertTriangle, Link2, Hash, Globe, Cpu, KeyRound, Radio 
} from 'lucide-react';

export default function FeatureBreakdown({ features }) {
  if (!features) return null;

  const items = [
    {
      label: 'HTTPS Encryption',
      value: features.has_https ? 'Secure (HTTPS)' : 'Unencrypted (HTTP)',
      status: features.has_https ? 'safe' : 'danger',
      icon: Lock,
      detail: features.has_https ? 'SSL/TLS verified' : 'Potential cleartext interception'
    },
    {
      label: 'IP Address Domain',
      value: features.has_ip ? 'Yes (Raw IP)' : 'No (Standard Domain)',
      status: features.has_ip ? 'danger' : 'safe',
      icon: Radio,
      detail: features.has_ip ? 'Phishers often bypass DNS using IPs' : 'Clean domain hostname'
    },
    {
      label: 'URL Shortener',
      value: features.is_shortened ? 'Shortened Link' : 'Direct Link',
      status: features.is_shortened ? 'warning' : 'safe',
      icon: Link2,
      detail: features.is_shortened ? 'Disguised destination domain' : 'Unmasked direct destination'
    },
    {
      label: 'Suspicious Keywords',
      value: `${features.suspicious_keyword_count} matched`,
      status: features.suspicious_keyword_count > 0 ? 'danger' : 'safe',
      icon: KeyRound,
      detail: features.suspicious_keyword_count > 0 ? 'Contains high-risk security/bank words' : 'No phishing trigger words'
    },
    {
      label: 'Domain Subdomains',
      value: `${features.subdomain_count} count`,
      status: features.subdomain_count > 2 ? 'warning' : 'safe',
      icon: Globe,
      detail: features.subdomain_count > 2 ? 'Excessive subdomains detected' : 'Normal domain hierarchy'
    },
    {
      label: 'URL Entropy Score',
      value: `${features.entropy_score} (Shannon)`,
      status: features.entropy_score > 4.5 ? 'warning' : 'safe',
      icon: Cpu,
      detail: features.entropy_score > 4.5 ? 'High randomness (obfuscated string)' : 'Natural character frequency'
    },
    {
      label: 'URL Length',
      value: `${features.url_length} chars`,
      status: features.url_length > 75 ? 'warning' : 'safe',
      icon: Hash,
      detail: features.url_length > 75 ? 'Long suspicious path' : 'Standard URL length'
    },
    {
      label: 'At (@) Symbol Presence',
      value: features.at_count > 0 ? 'Detected' : 'None',
      status: features.at_count > 0 ? 'danger' : 'safe',
      icon: AlertTriangle,
      detail: features.at_count > 0 ? '@ symbol used to mask credentials' : 'No credential masking'
    }
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-cyan-400" />
        Extracted Lexical & Security Feature Metrics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          let borderStyle = 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300';
          let badgeStyle = 'text-emerald-400 bg-emerald-500/10';

          if (item.status === 'warning') {
            borderStyle = 'border-amber-500/20 bg-amber-950/10 text-amber-300';
            badgeStyle = 'text-amber-400 bg-amber-500/10';
          } else if (item.status === 'danger') {
            borderStyle = 'border-rose-500/20 bg-rose-950/10 text-rose-300';
            badgeStyle = 'text-rose-400 bg-rose-500/10';
          }

          return (
            <div key={idx} className={`p-4 rounded-xl border ${borderStyle} glass-card transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <div className={`text-sm font-bold ${badgeStyle} px-2.5 py-1 rounded-md inline-block mb-2 font-mono`}>
                {item.value}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
