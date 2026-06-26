import { motion } from 'framer-motion';

/**
 * MathBackground — Reusable dark background with floating mathematical formulas
 * Used across all Mathematics section pages for consistent theming.
 */
export default function MathBackground({ children, className = '' }) {
  return (
    <div
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, #040812 0%, #070d1f 20%, #0a1228 40%, #0c1530 60%, #091020 80%, #040812 100%)' }}
    >
      {/* ===== FLOATING MATH FORMULAS ===== */}

      {/* E = mc² — top left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="absolute top-6 left-8 pointer-events-none select-none"
      >
        <svg width="130" height="40" viewBox="0 0 130 40">
          <text x="0" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="26" fontStyle="italic">E = mc²</text>
        </svg>
      </motion.div>

      {/* a² + b² = c² — top center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.4, duration: 1.5 }}
        className="absolute top-6 left-[22%] pointer-events-none select-none"
      >
        <svg width="180" height="40" viewBox="0 0 180 40">
          <text x="0" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="24" fontStyle="italic">a² + b² = c²</text>
        </svg>
      </motion.div>

      {/* ∫f(x)dx — top center-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 0.3, duration: 1.5 }}
        className="absolute top-4 left-[42%] pointer-events-none select-none"
      >
        <svg width="160" height="70" viewBox="0 0 160 70">
          <text x="0" y="50" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="38" fontStyle="italic">∫</text>
          <text x="14" y="18" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">b</text>
          <text x="14" y="65" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">a</text>
          <text x="30" y="45" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic">f(x) dx</text>
        </svg>
      </motion.div>

      {/* d/dx eˣ = eˣ — top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="absolute top-4 right-[22%] pointer-events-none select-none"
      >
        <svg width="160" height="55" viewBox="0 0 160 55">
          <text x="0" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20" fontStyle="italic">d</text>
          <line x1="0" y1="26" x2="22" y2="26" stroke="#10b981" strokeWidth="1.2"/>
          <text x="0" y="44" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20" fontStyle="italic">dx</text>
          <text x="30" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="24" fontStyle="italic">e</text>
          <text x="44" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">x</text>
          <text x="56" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="24">= e</text>
          <text x="96" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">x</text>
        </svg>
      </motion.div>

      {/* Σ 1/n² = π²/6 — far top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.6, duration: 1.5 }}
        className="absolute top-4 right-6 pointer-events-none select-none"
      >
        <svg width="140" height="70" viewBox="0 0 140 70">
          <text x="0" y="45" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="30">Σ</text>
          <text x="5" y="15" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="11" fontStyle="italic">∞</text>
          <text x="3" y="62" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="11" fontStyle="italic">n=1</text>
          <text x="35" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">1</text>
          <line x1="32" y1="35" x2="55" y2="35" stroke="#10b981" strokeWidth="1.2"/>
          <text x="35" y="52" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">n²</text>
          <text x="62" y="42" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20">=</text>
          <text x="85" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">π²</text>
          <line x1="82" y1="35" x2="105" y2="35" stroke="#10b981" strokeWidth="1.2"/>
          <text x="88" y="52" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18">6</text>
        </svg>
      </motion.div>

      {/* Right triangle — top left below E=mc² */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="absolute top-12 left-6 pointer-events-none select-none"
      >
        <svg width="80" height="90" viewBox="0 0 80 90">
          <polygon points="10,80 70,80 10,20" fill="none" stroke="#10b981" strokeWidth="1"/>
          <text x="2" y="55" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="13" fontStyle="italic">a</text>
          <text x="35" y="95" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="13" fontStyle="italic">b</text>
          <text x="42" y="48" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="13" fontStyle="italic">c</text>
        </svg>
      </motion.div>

      {/* d²y/dx² + y = 0 — left side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.09 }}
        transition={{ delay: 0.7, duration: 1.5 }}
        className="absolute top-[28%] left-4 pointer-events-none select-none"
      >
        <svg width="130" height="55" viewBox="0 0 130 55">
          <text x="0" y="18" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">d²y</text>
          <line x1="0" y1="24" x2="35" y2="24" stroke="#10b981" strokeWidth="1"/>
          <text x="0" y="42" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">dx²</text>
          <text x="42" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18">+ y = 0</text>
        </svg>
      </motion.div>

      {/* ∇·F = 0 — left lower */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 0.9, duration: 1.5 }}
        className="absolute top-[52%] left-4 pointer-events-none select-none"
      >
        <svg width="110" height="40" viewBox="0 0 110 40">
          <text x="0" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="22">∇ · </text>
          <text x="42" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic">F</text>
          <text x="58" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="22"> = 0</text>
        </svg>
      </motion.div>

      {/* eⁱᵖ + 1 = 0 — left below */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 1.0, duration: 1.5 }}
        className="absolute top-[62%] left-4 pointer-events-none select-none"
      >
        <svg width="130" height="40" viewBox="0 0 130 40">
          <text x="0" y="28" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20" fontStyle="italic">e</text>
          <text x="12" y="16" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="13" fontStyle="italic">iπ</text>
          <text x="32" y="28" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20">+ 1 = 0</text>
        </svg>
      </motion.div>

      {/* lim sin(x)/x = 1 — bottom left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 1.1, duration: 1.5 }}
        className="absolute bottom-[18%] left-4 pointer-events-none select-none"
      >
        <svg width="140" height="55" viewBox="0 0 140 55">
          <text x="0" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18">lim</text>
          <text x="5" y="48" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="10" fontStyle="italic">x→0</text>
          <text x="40" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">sin x</text>
          <line x1="40" y1="25" x2="100" y2="25" stroke="#10b981" strokeWidth="1"/>
          <text x="55" y="42" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">x</text>
          <text x="105" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18">= 1</text>
        </svg>
      </motion.div>

      {/* c² = a² + b² — bottom left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ delay: 1.2, duration: 1.5 }}
        className="absolute bottom-[6%] left-4 pointer-events-none select-none"
      >
        <svg width="140" height="55" viewBox="0 0 140 55">
          <text x="0" y="18" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">c</text>
          <text x="12" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="14" fontStyle="italic">a</text>
          <line x1="0" y1="28" x2="80" y2="28" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2,2"/>
          <text x="0" y="44" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="16" fontStyle="italic">c² = a² + b²</text>
        </svg>
      </motion.div>

      {/* Quadratic formula — bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.09 }}
        transition={{ delay: 1.0, duration: 1.5 }}
        className="absolute bottom-5 left-[25%] pointer-events-none select-none"
      >
        <svg width="200" height="55" viewBox="0 0 200 55">
          <text x="0" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20" fontStyle="italic">x</text>
          <text x="16" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20"> = </text>
          <text x="50" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="16" fontStyle="italic">−b ± √b²−4ac</text>
          <line x1="50" y1="26" x2="178" y2="26" stroke="#10b981" strokeWidth="1.2"/>
          <text x="95" y="44" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="16" fontStyle="italic">2a</text>
        </svg>
      </motion.div>

      {/* ∫₀π sin(x) dx = 2 — bottom center-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 1.3, duration: 1.5 }}
        className="absolute bottom-4 left-[52%] pointer-events-none select-none"
      >
        <svg width="200" height="60" viewBox="0 0 200 60">
          <text x="0" y="42" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="32" fontStyle="italic">∫</text>
          <text x="14" y="16" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="12" fontStyle="italic">π</text>
          <text x="14" y="56" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="12" fontStyle="italic">0</text>
          <text x="28" y="38" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">sin(x) dx = 2</text>
        </svg>
      </motion.div>

      {/* v = dr/dt — right side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 0.7, duration: 1.5 }}
        className="absolute top-[35%] right-6 pointer-events-none select-none"
      >
        <svg width="110" height="55" viewBox="0 0 110 55">
          <text x="0" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20" fontStyle="italic">v⃗</text>
          <text x="22" y="32" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="20"> = </text>
          <text x="52" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">dr⃗</text>
          <line x1="52" y1="26" x2="82" y2="26" stroke="#10b981" strokeWidth="1"/>
          <text x="56" y="44" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="18" fontStyle="italic">dt</text>
        </svg>
      </motion.div>

      {/* ∫(1/x)dx = ln|x| + C — right mid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.07 }}
        transition={{ delay: 0.9, duration: 1.5 }}
        className="absolute top-[48%] right-4 pointer-events-none select-none"
      >
        <svg width="200" height="50" viewBox="0 0 200 50">
          <text x="0" y="34" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="26" fontStyle="italic">∫</text>
          <text x="18" y="20" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="15" fontStyle="italic">1</text>
          <line x1="15" y1="24" x2="30" y2="24" stroke="#10b981" strokeWidth="1"/>
          <text x="17" y="40" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="15" fontStyle="italic">x</text>
          <text x="35" y="30" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="16" fontStyle="italic">dx = ln|x| + C</text>
        </svg>
      </motion.div>

      {/* A = πr² — right lower */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 1.1, duration: 1.5 }}
        className="absolute bottom-[30%] right-8 pointer-events-none select-none"
      >
        <svg width="110" height="40" viewBox="0 0 110 40">
          <text x="0" y="28" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic">A = πr²</text>
        </svg>
      </motion.div>

      {/* Geometric compass — bottom right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 1.4, duration: 2 }}
        className="absolute bottom-4 right-4 pointer-events-none select-none"
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" stroke="#10b981" strokeWidth="0.8" fill="none"/>
          <circle cx="100" cy="100" r="60" stroke="#10b981" strokeWidth="0.5" fill="none"/>
          <circle cx="100" cy="100" r="35" stroke="#10b981" strokeWidth="0.3" fill="none"/>
          <line x1="100" y1="8" x2="100" y2="192" stroke="#10b981" strokeWidth="0.4"/>
          <line x1="8" y1="100" x2="192" y2="100" stroke="#10b981" strokeWidth="0.4"/>
          <line x1="35" y1="35" x2="165" y2="165" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="165" y1="35" x2="35" y2="165" stroke="#10b981" strokeWidth="0.3"/>
          {/* Tick marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 100 + 80 * Math.cos(rad);
            const y1 = 100 + 80 * Math.sin(rad);
            const x2 = 100 + 88 * Math.cos(rad);
            const y2 = 100 + 88 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="0.6"/>;
          })}
          {/* y-axis arrow */}
          <polygon points="97,12 100,4 103,12" fill="#10b981" opacity="0.5"/>
          <text x="106" y="18" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="12" fontStyle="italic">y</text>
          {/* x-axis arrow */}
          <polygon points="188,97 196,100 188,103" fill="#10b981" opacity="0.5"/>
          <text x="178" y="118" fill="#10b981" fontFamily="'Times New Roman', serif" fontSize="12" fontStyle="italic">x</text>
        </svg>
      </motion.div>

      {/* 3D book/papers illustration — bottom right area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ delay: 1.6, duration: 2 }}
        className="absolute bottom-[15%] right-[15%] pointer-events-none select-none"
      >
        <svg width="120" height="100" viewBox="0 0 120 100">
          {/* Open book */}
          <path d="M60,20 Q30,15 10,25 L10,80 Q30,70 60,75 Q90,70 110,80 L110,25 Q90,15 60,20Z" fill="none" stroke="#10b981" strokeWidth="0.8"/>
          <line x1="60" y1="20" x2="60" y2="75" stroke="#10b981" strokeWidth="0.5"/>
          {/* Page lines */}
          <line x1="20" y1="35" x2="52" y2="33" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="20" y1="42" x2="52" y2="40" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="20" y1="49" x2="52" y2="47" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="68" y1="33" x2="100" y2="35" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="68" y1="40" x2="100" y2="42" stroke="#10b981" strokeWidth="0.3"/>
          <line x1="68" y1="47" x2="100" y2="49" stroke="#10b981" strokeWidth="0.3"/>
        </svg>
      </motion.div>

      {/* ===== GRADIENT GLOW BLOBS ===== */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)' }} />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
