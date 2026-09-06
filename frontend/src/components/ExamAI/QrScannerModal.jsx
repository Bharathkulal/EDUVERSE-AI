import React, { useState, useEffect, useRef } from 'react';
import { QrCryptoEngine } from '../../services/ExamAI/QrCryptoEngine';
import { examQrApi } from '../../services/ExamAI/examQrApi';
import toast from 'react-hot-toast';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // camera, manual, upload
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Quick preset test tokens for single-click instant demo scanning
  const demoTokens = [
    { label: 'Alex Mercer (CS2026-042 - ML)', token: 'STU-1001' },
    { label: 'Sophia Chen (CS2026-088 - ML)', token: 'STU-1002' },
    { label: 'Marcus Vance (CS2026-104 - DSA)', token: 'STU-1003' },
    { label: 'Elena Rostova (AI2026-015 - AI)', token: 'STU-1004' }
  ];

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraActive(true);
    setScanning(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable. Fallback to interactive scanner UI.', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const handleSimulatedCameraScan = async (presetToken) => {
    setVerifying(true);
    toast.loading('Scanning & decrypting HMAC token...', { id: 'qr-scan-toast' });
    
    // Simulate camera laser lock delay
    setTimeout(async () => {
      const res = await examQrApi.verifyQrToken(presetToken || 'STU-1001');
      setVerifying(false);

      if (res.success) {
        toast.success(`QR Verified: ${res.student.name} (${res.student.rollNumber})`, { id: 'qr-scan-toast' });
        setScanResult(res);
        if (onScanSuccess) {
          onScanSuccess(res);
        }
      } else {
        toast.error(res.message || 'QR Verification failed', { id: 'qr-scan-toast' });
      }
    }, 900);
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setVerifying(true);
    toast.loading('Verifying token payload...', { id: 'qr-verify-toast' });

    const res = await examQrApi.verifyQrToken(manualToken.trim());
    setVerifying(false);

    if (res.success) {
      toast.success(`Verified: ${res.student.name}`, { id: 'qr-verify-toast' });
      setScanResult(res);
      if (onScanSuccess) {
        onScanSuccess(res);
      }
    } else {
      toast.error('Invalid token payload', { id: 'qr-verify-toast' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#3b82f6]/40 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30">
              📷
            </div>
            <div>
              <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                AI QR Answer Sheet Scanner
              </h3>
              <p className="text-xs text-slate-400">Instant Student & Exam Verification Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🎥 Live Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            ⌨️ Manual Token Entry
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              {/* Camera Scanner Viewport */}
              <div className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Laser Overlay Scanner Effect */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(0,242,254,0.3)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
                    
                    {/* Animated Scanning Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                  </div>
                </div>

                <div className="absolute bottom-3 px-4 py-1.5 rounded-full bg-slate-900/90 text-cyan-300 text-xs font-mono border border-cyan-500/30 backdrop-blur-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Position QR Code inside viewfinder
                </div>
              </div>

              {/* Quick Demo Scan Targets */}
              <div className="w-full mt-4">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> Instant Demo QR Scan Targets:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoTokens.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSimulatedCameraScan(item.token)}
                      disabled={verifying}
                      className="p-2.5 text-left text-xs bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 hover:border-cyan-500/50 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="truncate font-medium text-slate-200 group-hover:text-cyan-300">
                        {item.label}
                      </span>
                      <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        Scan ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Encrypted QR Token String or Student ID
                </label>
                <textarea
                  rows={4}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste encrypted Base64 QR token payload or Student ID (e.g. STU-1001)..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={verifying || !manualToken.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {verifying ? 'Decrypting & Verifying...' : '🔐 Decrypt & Verify QR Token'}
              </button>
            </form>
          )}

          {/* Verification Result Preview Banner */}
          {scanResult && (
            <div className="mt-4 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-4 animate-slideDown">
              <img
                src={scanResult.student.photo}
                alt={scanResult.student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{scanResult.student.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    VERIFIED MATCH
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Roll: <span className="font-mono font-bold text-white">{scanResult.student.rollNumber}</span> | {scanResult.student.department}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Exam: <span className="font-semibold text-cyan-300">{scanResult.exam.subject}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  if (onScanSuccess) onScanSuccess(scanResult);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                Proceed to Upload ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
