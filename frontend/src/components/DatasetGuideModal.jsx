import React from 'react';
import { X, BookOpen, ExternalLink, Database, CheckCircle2 } from 'lucide-react';

export default function DatasetGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const datasets = [
    {
      name: "PhiUSIIL Phishing URL Dataset",
      tag: "Recommended Benchmark",
      size: "235,795 URLs",
      features: "54 Extracted Features (Lexical, WHOIS, HTML)",
      description: "Contemporary benchmark dataset from UCI ML repository containing 134k+ benign and 100k+ phishing URLs.",
      link: "https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset"
    },
    {
      name: "ISCX-URL2016 Dataset",
      tag: "UNB Cybersecurity",
      size: "35,300 URLs",
      features: "Lexical & Multi-Class Categories",
      description: "University of New Brunswick dataset with multi-class tags (Benign, Spam, Phishing, Malware, Definement).",
      link: "https://www.unb.ca/cic/datasets/url-2016.html"
    },
    {
      name: "PhishTank Live Database",
      tag: "Real-Time Blacklist",
      size: "Millions of Verified URLs",
      features: "CSV / JSON API hourly feed",
      description: "Maintained by OpenDNS/Cisco. Ideal for instant hash-matching lookup tables.",
      link: "https://www.phishtank.com/developer_info.php"
    },
    {
      name: "URLhaus by abuse.ch",
      tag: "Malware Feed",
      size: "100,000+ Active Malware URLs",
      features: "Updated every 5 minutes",
      description: "Specialized malware URL intelligence feed for identifying payload distribution endpoints.",
      link: "https://urlhaus.abuse.ch/api/"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel p-6 rounded-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Recommended Datasets for PhishCheck</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {datasets.map((ds, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  {ds.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                  {ds.tag}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{ds.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                <span className="text-slate-400">Size: <strong className="text-slate-200">{ds.size}</strong></span>
                <a href={ds.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-sans font-semibold">
                  <span>Visit Dataset</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
