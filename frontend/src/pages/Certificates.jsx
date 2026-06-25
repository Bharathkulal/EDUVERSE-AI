import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Award, ShieldAlert, Download, Share2, Printer, ExternalLink, BookOpen, Clock, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/certificates');
      setCerts(res.data.certificates || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = (cert) => {
    const text = `I am proud to share that I have successfully completed the ${cert.subjectName} course on EduVerse AI! Check out my verified certificate:`;
    const url = `${window.location.origin}/verify-certificate/${cert.certId}`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
  };

  const handleVerify = async (certId) => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await api.get(`/progress/verify-certificate/${certId}`);
      setVerificationResult(res.data);
    } catch (err) {
      console.error(err);
      setVerificationResult({ valid: false, message: err.response?.data?.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-violet-500 border-slate-700 animate-spin"></div>
        <span className="text-xs font-bold text-slate-400 tracking-wider">Loading Certificate Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-6 md:p-8 space-y-8 premium-dark-page" style={{ backgroundColor: '#050B2D' }}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">
            Certificate Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Claim, download, and verify your professional learning achievements.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4 text-violet-400 animate-pulse" />
          <span>{certs.filter(c => c.status === 'Completed').length} Earned</span>
        </div>
      </div>

      {/* Grid of certificate items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs.map((cert) => {
          const isCompleted = cert.status === 'Completed';
          const isInProgress = cert.status === 'In Progress';

          return (
            <motion.div
              key={cert.subjectId}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col justify-between h-64 hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl"
            >
              {/* Card top */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-black">
                    🎓
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest ${
                    isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                    isInProgress ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                    'bg-slate-500/10 border border-slate-500/30 text-slate-500'
                  }`}>
                    {cert.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-1">{cert.subjectName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cert.description}</p>
              </div>

              {/* Card bottom */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{cert.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-violet-500'
                      }`} 
                      style={{ width: `${cert.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2 px-3 bg-slate-800 border border-slate-700 text-slate-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Certificate modal view */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6"
            >
              {/* Modal controls */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  <span className="font-bold text-slate-100">Certificate Viewer</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCert(null);
                    setVerificationResult(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Printable Certificate Box (matches the layout exactly) */}
              <div className="p-1 md:p-3 overflow-x-auto flex justify-center">
                <div 
                  id="print-certificate"
                  className="certificate-print-container relative w-[800px] h-[580px] bg-white text-slate-900 rounded-lg p-8 flex flex-col justify-between border-[12px] border-double shadow-2xl flex-shrink-0"
                  style={{
                    borderColor: '#D4AF37', // Gold double border
                    backgroundImage: 'radial-gradient(circle, rgba(253,251,247,1) 0%, rgba(246,243,235,1) 100%)',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  {/* Gold inner line */}
                  <div className="absolute inset-2 border border-amber-600/40 pointer-events-none" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/30 rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/30 rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/30 rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/30 rounded-br-sm pointer-events-none" />

                  {/* Top: Logo & Achievement seal */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-violet-600/20">
                        E
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-lg tracking-tight text-slate-900 leading-none">EduVerse AI</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500">Learn. Practice. Master. Succeed.</span>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-900 text-white border-4 border-amber-500 flex flex-col items-center justify-center shadow-lg relative">
                        <span className="text-[6px] uppercase tracking-widest font-bold text-amber-400">VERIFIED</span>
                        <Award className="w-4 h-4 text-amber-500 mt-0.5" />
                        <span className="text-[5px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">Achievement</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Recipient & Course info */}
                  <div className="text-center space-y-4 my-2">
                    <h2 className="text-4xl font-extrabold uppercase tracking-widest text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                      Certificate
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">— of achievement —</p>
                    <p className="text-xs italic text-slate-600">This is proudly presented to</p>
                    
                    <h3 className="text-3xl font-bold text-violet-800" style={{ fontFamily: "'Clicker Script', cursive, Georgia, serif" }}>
                      {selectedCert.studentName}
                    </h3>
                    
                    <div className="w-48 h-[1px] bg-amber-500/40 mx-auto" />
                    
                    <p className="text-xs italic text-slate-600">for successfully completing the</p>
                    <h4 className="text-xl font-extrabold text-indigo-900 uppercase tracking-wide">
                      {selectedCert.subjectName}
                    </h4>
                    <p className="text-[10px] text-slate-500">course on EduVerse AI Academy</p>
                    <p className="text-[9px] text-slate-500 max-w-lg mx-auto leading-relaxed">
                      You have demonstrated excellent commitment, consistent learning, and outstanding performance across quizzes, coding labs, and modules.
                    </p>
                  </div>

                  {/* Bottom: Date, signatures, QR code */}
                  <div className="flex justify-between items-end border-t border-slate-200/50 pt-4">
                    {/* Date */}
                    <div className="text-left space-y-1">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</span>
                      <span className="block text-xs font-semibold text-slate-800">{selectedCert.completedAt}</span>
                      <span className="block text-[8px] font-medium text-slate-500 mt-2">ID: {selectedCert.certId}</span>
                    </div>

                    {/* Ribbon Seal center */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-4 border-amber-500 bg-amber-600 flex items-center justify-center shadow-lg relative">
                        <span className="text-[14px] text-white">⭐</span>
                        {/* ribbons */}
                        <div className="absolute -bottom-3 left-1 w-3 h-6 bg-amber-600 transform -rotate-12 origin-top" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
                        <div className="absolute -bottom-3 right-1 w-3 h-6 bg-amber-600 transform rotate-12 origin-top" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
                      </div>
                    </div>

                    {/* QR and Instructor signatures */}
                    <div className="flex items-end gap-6">
                      <div className="text-center">
                        <div className="w-14 h-1px bg-slate-400 mx-auto" />
                        <span className="block text-[9px] font-bold text-slate-800 mt-1">AI Coach</span>
                        <span className="block text-[7px] text-slate-500">{selectedCert.instructorCoach}</span>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-1px bg-slate-400 mx-auto" />
                        <span className="block text-[9px] font-bold text-slate-800 mt-1">Founder</span>
                        <span className="block text-[7px] text-slate-500">{selectedCert.instructorCEO}</span>
                      </div>
                      <div>
                        {/* Dynamic QR */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(
                            `${window.location.origin}/verify-certificate/${selectedCert.certId}`
                          )}`} 
                          alt="QR Code" 
                          className="w-12 h-12 border border-slate-200 p-0.5 rounded bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Print PDF</span>
                </button>
                <button
                  onClick={() => handleShareLinkedIn(selectedCert)}
                  className="py-2.5 px-4 bg-[#0077b5] hover:bg-[#006297] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on LinkedIn</span>
                </button>
                <button
                  onClick={() => handleVerify(selectedCert.certId)}
                  className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Authenticity</span>
                </button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    `${window.location.origin}/verify-certificate/${selectedCert.certId}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 no-underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>QR Link</span>
                </a>
              </div>

              {/* Verification result box */}
              {verifying && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs animate-pulse text-slate-400">
                  Contacting EduVerse AI verification registry...
                </div>
              )}
              {verificationResult && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 text-left ${
                  verificationResult.valid 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold block text-sm">Certificate Authenticity Verified!</span>
                        <p className="mt-1">This document ({verificationResult.certId}) is officially issued to <strong>{verificationResult.studentName}</strong> for completing the <strong>{verificationResult.subjectName}</strong> module. Registrars status: <strong>VERIFIED</strong> on {verificationResult.verifiedAt}.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold block text-sm">Verification Failed</span>
                        <p className="mt-1">{verificationResult.message}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS to support clean printing of certificate & premium dark overrides */}
      <style>{`
        @media screen {
          /* Scoped premium dark theme overrides to override light-theme leakage */
          .premium-dark-page {
            background-color: #050B2D !important;
            color: #F8FAFC !important;
          }
          .premium-dark-page h1,
          .premium-dark-page h2,
          .premium-dark-page h3,
          .premium-dark-page h4,
          .premium-dark-page h5,
          .premium-dark-page h6 {
            color: #FFFFFF !important;
          }
          .premium-dark-page p,
          .premium-dark-page span {
            color: #CBD5E1 !important;
          }
          .premium-dark-page .text-white {
            color: #FFFFFF !important;
          }
          .premium-dark-page .text-slate-100 {
            color: #F8FAFC !important;
          }
          .premium-dark-page .text-slate-200 {
            color: #E2E8F0 !important;
          }
          .premium-dark-page .text-slate-300 {
            color: #CBD5E1 !important;
          }
          .premium-dark-page .text-slate-400 {
            color: #94A3B8 !important;
          }
          .premium-dark-page .text-slate-500 {
            color: #64748B !important;
          }
          .premium-dark-page .text-violet-400 {
            color: #A78BFA !important;
          }
          .premium-dark-page .text-indigo-300 {
            color: #C7D2FE !important;
          }
          .premium-dark-page .text-emerald-400 {
            color: #34D399 !important;
          }
          .premium-dark-page .text-amber-400 {
            color: #FBBF24 !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-certificate, #print-certificate * {
            visibility: visible;
          }
          #print-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            border: 12px double #D4AF37 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
