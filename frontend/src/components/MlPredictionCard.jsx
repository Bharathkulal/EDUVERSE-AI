import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, RefreshCw } from 'lucide-react';

/**
 * Premium Dark Glassmorphic ML Prediction Card
 */
export default function MlPredictionCard({
  title,
  loading = false,
  confidence,
  modelVersion = 'edu-core-v24',
  lastUpdated,
  icon = '🤖',
  children
}) {
  const formattedDate = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
      style={{
        background: 'var(--db-card-bg)',
        borderColor: 'var(--db-sidebar-border)',
        color: 'var(--db-text-main)',
        minHeight: '210px'
      }}
    >
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header Info */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <h3 className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--db-text-main)' }}>{title}</h3>
        </div>
        
        {/* Model Version Tag */}
        <span 
          className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
          style={{ borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-muted)', backgroundColor: 'var(--db-input-bg)' }}
        >
          {modelVersion}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-6 w-3/4 bg-white/10 rounded-lg"></div>
            <div className="h-4 w-1/2 bg-white/5 rounded-lg"></div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer ML Metadata */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--db-sidebar-border)' }}>
        {/* Confidence Dial/Text */}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500">
            {confidence ? `${confidence}% Confidence` : '94.2% Confidence'}
          </span>
        </div>

        {/* Last Updated Timestamp */}
        <div className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--db-text-muted)' }}>
          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
          <span>Updated {formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
