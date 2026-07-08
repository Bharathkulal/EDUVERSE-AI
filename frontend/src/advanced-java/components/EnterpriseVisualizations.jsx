/**
 * EnterpriseVisualizations — Animated architecture diagrams
 * Renders per-lesson visualizations: JDBC, Servlet, ORM, DI, Microservices flows
 */
import { useState } from 'react';
import { motion } from 'framer-motion';

/* ── Reusable animated node ── */
function Node({ x, y, label, icon, color = '#3B82F6', delay = 0, size = 'md' }) {
  const w = size === 'lg' ? 'w-20 h-20' : size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  return (
    <motion.div
      className={`absolute ${w} rounded-xl border-2 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm`}
      style={{
        left: x, top: y,
        borderColor: color + '60',
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        boxShadow: `0 4px 20px ${color}15`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[8px] font-bold text-center leading-tight mt-0.5" style={{ color }}>{label}</span>
    </motion.div>
  );
}

/* ── Animated arrow connector ── */
function Arrow({ x1, y1, x2, y2, color = '#3B82F6', delay = 0, label = '' }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return (
    <motion.div
      className="absolute"
      style={{
        left: x1, top: y1,
        width: length,
        height: 2,
        background: `linear-gradient(90deg, ${color}60, ${color})`,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}rad)`,
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay, duration: 0.6 }}
    >
      {label && (
        <span
          className="absolute text-[7px] font-bold whitespace-nowrap -top-3 left-1/2 -translate-x-1/2"
          style={{ color }}
        >
          {label}
        </span>
      )}
      {/* Arrowhead */}
      <div
        className="absolute right-0 -top-[3px] w-0 h-0"
        style={{
          borderLeft: `6px solid ${color}`,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
        }}
      />
      {/* Animated packet */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full top-1/2 -translate-y-1/2"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        animate={{ left: ['0%', '95%'] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.6, ease: 'linear' }}
      />
    </motion.div>
  );
}

/* ── JDBC Database Flow ── */
function JDBCVisualization() {
  return (
    <div className="relative w-full h-[250px]">
      <Node x="5%" y="85px" label="Java App" icon="☕" color="#3B82F6" delay={0} />
      <Arrow x1={90} y1={110} x2={185} y2={110} color="#3B82F6" delay={0.3} label="JDBC API" />
      <Node x="30%" y="85px" label="Driver" icon="🔌" color="#8B5CF6" delay={0.2} />
      <Arrow x1={260} y1={110} x2={360} y2={110} color="#8B5CF6" delay={0.5} label="SQL Query" />
      <Node x="58%" y="85px" label="Database" icon="🗄️" color="#10B981" delay={0.4} />
      <Arrow x1={430} y1={110} x2={260} y2={110} color="#10B981" delay={0.7} label="ResultSet" />

      {/* Connection pool */}
      <Node x="30%" y="170px" label="Pool" icon="🔄" color="#F59E0B" delay={0.6} size="sm" />
      <motion.div
        className="absolute text-[9px] text-slate-500 font-mono"
        style={{ left: '28%', top: '225px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        HikariCP / C3P0
      </motion.div>

      {/* Legend */}
      <motion.div
        className="absolute right-2 top-2 text-[8px] text-slate-600 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div>⬤ Connection Lifecycle</div>
        <div>→ Query Flow Direction</div>
      </motion.div>
    </div>
  );
}

/* ── Servlet Request/Response Flow ── */
function ServletVisualization() {
  return (
    <div className="relative w-full h-[250px]">
      <Node x="2%" y="85px" label="Browser" icon="🌐" color="#06B6D4" delay={0} />
      <Arrow x1={80} y1={108} x2={175} y2={108} color="#06B6D4" delay={0.3} label="HTTP Request" />
      <Node x="28%" y="85px" label="Servlet\nContainer" icon="📦" color="#8B5CF6" delay={0.2} />
      <Arrow x1={250} y1={108} x2={345} y2={108} color="#8B5CF6" delay={0.5} label="dispatch" />
      <Node x="55%" y="85px" label="Servlet" icon="⚙️" color="#EC4899" delay={0.4} />
      <Arrow x1={420} y1={108} x2={80} y2={108} color="#10B981" delay={0.7} label="HTTP Response" />

      {/* Filters */}
      <Node x="28%" y="5px" label="Filters" icon="🔍" color="#F59E0B" delay={0.8} size="sm" />
      <Node x="55%" y="175px" label="Session" icon="🍪" color="#F59E0B" delay={0.9} size="sm" />
    </div>
  );
}

/* ── Hibernate ORM Mapping ── */
function HibernateVisualization() {
  return (
    <div className="relative w-full h-[250px]">
      <Node x="5%" y="35px" label="Entity\nClass" icon="📋" color="#3B82F6" delay={0} />
      <Node x="5%" y="145px" label="Entity\nClass" icon="📋" color="#3B82F6" delay={0.1} />
      <Arrow x1={90} y1={65} x2={200} y2={105} color="#8B5CF6" delay={0.3} label="@Entity" />
      <Arrow x1={90} y1={175} x2={200} y2={115} color="#8B5CF6" delay={0.4} label="@Entity" />
      <Node x="32%" y="80px" label="Session\nFactory" icon="🏭" color="#8B5CF6" delay={0.3} size="lg" />
      <Arrow x1={310} y1={110} x2={400} y2={110} color="#10B981" delay={0.6} label="HQL → SQL" />
      <Node x="65%" y="80px" label="Database\nTables" icon="🗄️" color="#10B981" delay={0.5} size="lg" />

      {/* Cache layers */}
      <Node x="32%" y="185px" label="L1 Cache" icon="⚡" color="#F59E0B" delay={0.8} size="sm" />
      <Node x="50%" y="185px" label="L2 Cache" icon="💾" color="#EC4899" delay={0.9} size="sm" />
    </div>
  );
}

/* ── Spring DI Container ── */
function SpringDIVisualization() {
  return (
    <div className="relative w-full h-[250px]">
      {/* Container */}
      <motion.div
        className="absolute rounded-2xl border-2 border-dashed"
        style={{
          left: '15%', top: '10px', width: '70%', height: '230px',
          borderColor: '#10B98160',
          background: 'rgba(16,185,129,0.03)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="absolute -top-3 left-4 text-[9px] font-bold text-emerald-400 bg-slate-900 px-2">
          Spring IoC Container
        </span>
      </motion.div>

      <Node x="20%" y="35px" label="Controller" icon="🎮" color="#3B82F6" delay={0.3} />
      <Arrow x1={220} y1={70} x2={280} y2={95} color="#8B5CF6" delay={0.5} label="@Inject" />
      <Node x="44%" y="80px" label="Service" icon="⚙️" color="#8B5CF6" delay={0.4} />
      <Arrow x1={350} y1={115} x2={280} y2={155} color="#EC4899" delay={0.7} label="@Inject" />
      <Node x="40%" y="145px" label="Repository" icon="🗄️" color="#EC4899" delay={0.5} />
      <Node x="65%" y="35px" label="Config" icon="📝" color="#F59E0B" delay={0.6} size="sm" />
      <Node x="65%" y="145px" label="Bean" icon="☕" color="#06B6D4" delay={0.7} size="sm" />
    </div>
  );
}

/* ── Microservices Architecture ── */
function MicroservicesVisualization() {
  return (
    <div className="relative w-full h-[280px]">
      <Node x="2%" y="100px" label="Client" icon="📱" color="#06B6D4" delay={0} />
      <Arrow x1={80} y1={128} x2={155} y2={128} color="#06B6D4" delay={0.3} label="HTTPS" />
      <Node x="24%" y="90px" label="API\nGateway" icon="🚪" color="#8B5CF6" delay={0.2} size="lg" />

      {/* Services */}
      <Arrow x1={260} y1={110} x2={340} y2={50} color="#3B82F6" delay={0.5} />
      <Arrow x1={260} y1={130} x2={340} y2={130} color="#10B981" delay={0.6} />
      <Arrow x1={260} y1={145} x2={340} y2={210} color="#EC4899" delay={0.7} />

      <Node x="55%" y="25px" label="User\nService" icon="👤" color="#3B82F6" delay={0.5} />
      <Node x="55%" y="105px" label="Order\nService" icon="📦" color="#10B981" delay={0.6} />
      <Node x="55%" y="185px" label="Payment\nService" icon="💳" color="#EC4899" delay={0.7} />

      {/* Eureka */}
      <Node x="80%" y="105px" label="Eureka\nRegistry" icon="🔍" color="#F59E0B" delay={0.9} />

      {/* Config */}
      <Node x="80%" y="15px" label="Config\nServer" icon="⚙️" color="#06B6D4" delay={1} size="sm" />

      {/* Message broker */}
      <Node x="80%" y="210px" label="Kafka" icon="📨" color="#22C55E" delay={1.1} size="sm" />
    </div>
  );
}

/* ── Default placeholder ── */
function DefaultVisualization({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <motion.div
        className="text-4xl mb-3"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏗️
      </motion.div>
      <p className="text-sm text-slate-400">Architecture visualization for <strong className="text-white">{title}</strong></p>
      <p className="text-xs text-slate-600 mt-1">Explore the animated diagram above</p>
    </div>
  );
}

/* ── Visualization picker by lesson slug ── */
const VIZ_MAP = {
  'jdbc-fundamentals':    JDBCVisualization,
  'servlets':             ServletVisualization,
  'jsp':                  ServletVisualization,
  'session-management':   ServletVisualization,
  'java-beans':           SpringDIVisualization,
  'hibernate':            HibernateVisualization,
  'spring-core':          SpringDIVisualization,
  'spring-boot':          SpringDIVisualization,
  'spring-security':      ServletVisualization,
  'microservices':        MicroservicesVisualization,
  'rest-api-development': ServletVisualization,
  'maven-gradle':         DefaultVisualization,
  'design-patterns':      DefaultVisualization,
  'multithreading':       DefaultVisualization,
  'enterprise-project':   MicroservicesVisualization,
};

export default function EnterpriseVisualizations({ lesson }) {
  const slug = lesson?.slug || '';
  const Component = VIZ_MAP[slug] || DefaultVisualization;
  const accentColor = lesson?.accent || '#3B82F6';

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: accentColor + '30',
        background: 'linear-gradient(135deg, #0a0c14, #0d0f1a)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: accentColor + '20', background: accentColor + '08' }}
      >
        <span className="text-lg">🏛️</span>
        <div>
          <h3 className="text-sm font-bold text-white">Enterprise Architecture</h3>
          <p className="text-[10px] text-slate-500">{lesson?.title} — Animated Flow Diagram</p>
        </div>
      </div>

      {/* Visualization canvas */}
      <div className="p-5 relative overflow-hidden">
        <Component title={lesson?.title || 'Lesson'} />
      </div>

      {/* Interactive hint */}
      <div className="px-5 pb-4">
        <div className="text-[9px] text-slate-600 text-center font-mono">
          ▸ Watch data packets flow through the architecture in real-time
        </div>
      </div>
    </div>
  );
}
