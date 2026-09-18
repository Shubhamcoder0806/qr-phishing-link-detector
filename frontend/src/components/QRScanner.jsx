import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, StopCircle, Loader2, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';
import RiskMeter from './RiskMeter';
import FeatureBreakdown from './FeatureBreakdown';

export default function QRScanner() {
  const [scanMode, setScanMode] = useState('upload'); // 'upload' or 'camera'
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);

  // Camera QR scanner start/stop logic
  const startCameraScan = async () => {
    setError(null);
    setResult(null);
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-container");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopCameraScan();
          handleUrlScan(decodedText);
        },
        (errorMessage) => {
          // ignore frame errors
        }
      );
    } catch (err) {
      setError("Unable to access camera. Please allow camera permissions or upload a QR image.");
      setIsScanning(false);
    }
  };

  const stopCameraScan = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      }).catch(err => console.error(err));
    }
  };

  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);

  // Image Upload QR scanner logic
  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/scan/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not decode QR code from the uploaded image.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlScan = async (url) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/scan/url', { url });
      setResult(response.data);
    } catch (err) {
      setError("Failed to scan URL extracted from QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Code Phishing Scanner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Scan & Analyze QR Codes
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Malicious QR codes (Quishing) can redirect users to dangerous phishing portals. Scan using your camera or upload a QR image file.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            stopCameraScan();
            setScanMode('upload');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            scanMode === 'upload'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload QR Image</span>
        </button>

        <button
          onClick={() => {
            setScanMode('camera');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            scanMode === 'camera'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera Scan</span>
        </button>
      </div>

      {/* Upload Box */}
      {scanMode === 'upload' && (
        <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl text-center space-y-4 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 transition-all">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upload QR Code File</h3>
            <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP files</p>
          </div>

          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-cyan-500/20 transition-all">
            <span>Select QR Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      )}

      {/* Camera Box */}
      {scanMode === 'camera' && (
        <div className="max-w-md mx-auto glass-panel p-6 rounded-2xl text-center space-y-4">
          <div id="qr-reader-container" className="w-full min-h-[260px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {!isScanning && (
              <p className="text-xs text-slate-500">Click below to activate device camera feed</p>
            )}
          </div>

          {!isScanning ? (
            <button
              onClick={startCameraScan}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCameraScan}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop Scanner</span>
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-cyan-400 py-6 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Decoding QR code image and extracting URL...</span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-800 pb-6">
            <div className="flex justify-center">
              <RiskMeter score={result.risk_score} status={result.status} confidence={result.confidence} />
            </div>
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Extracted QR Link Result</span>
              <h2 className="text-xl font-bold text-white break-all">{result.url}</h2>
              <p className="text-sm text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 font-medium">
                {result.message}
              </p>
            </div>
          </div>
          <FeatureBreakdown features={result.features} />
        </div>
      )}
    </div>
  );
}
