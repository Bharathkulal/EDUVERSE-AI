import { AnimatePresence, motion } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { useCommandAI } from '../../context/CommandAIContext';
import VoiceWaveform from './VoiceWaveform';
import QuickCommands from './QuickCommands';
import './CommandAI.css';

export default function CommandPanel() {
  const { 
    isPanelOpen, 
    setIsPanelOpen, 
    activeState, 
    transcript, 
    history 
  } = useCommandAI();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const activeCommandLog = history[0];

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="cai-panel-overlay"
          />

          {/* Slide-Up Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="cai-panel"
          >
            <div className="flex flex-col gap-6 h-full justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">EduVerse Command AI</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {activeState === 'listening' ? '🎙 Listening' : activeState === 'thinking' ? '⚙ Thinking' : '● Ready'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Live Transcript / Speech Area */}
              <div className="py-4 flex-1 flex flex-col justify-center min-h-[120px]">
                {activeState === 'listening' ? (
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-white leading-relaxed italic">
                      "{transcript || 'Listening for speech…'}"
                    </p>
                    <VoiceWaveform active={true} />
                  </div>
                ) : activeState === 'thinking' ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest animate-pulse">
                      Analyzing intent matrix…
                    </p>
                    <p className="text-sm text-slate-400">Please wait while your request is processed.</p>
                  </div>
                ) : activeCommandLog ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Last Command</p>
                    <p className="text-sm font-semibold text-white">"{activeCommandLog.transcript}"</p>
                    <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl text-xs text-violet-300">
                      🔊 {activeCommandLog.response}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">EduVerse Voice OS Active</p>
                    <p className="text-xs text-slate-400">Say a command like "Open Dashboard" or click mic to talk.</p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Commands */}
              <QuickCommands />

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
