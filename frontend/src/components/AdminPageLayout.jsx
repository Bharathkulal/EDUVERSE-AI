import React from 'react';
import { Sparkles, Terminal, Activity, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

/**
 * Reusable layout wrapper for all Admin pages.
 * Ensures consistent Enterprise SaaS look (breadcrumbs, KPI stats cards, main workspace, AI Insights side panel, live activity logs).
 */
export default function AdminPageLayout({ 
  title, 
  breadcrumbs = [], 
  kpis = [], 
  aiInsights = [], 
  activities = [], 
  children 
}) {
  return (
    <div className="space-y-6 text-left" style={{ color: 'var(--db-text-main)' }}>
      
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--db-text-muted)' }}>
            <span>Admin</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 mx-0.5" />
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--db-text-main)' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* 2. KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold block" style={{ color: 'var(--db-text-muted)' }}>{kpi.label}</span>
                <span className="text-xl font-black mt-1 block">{kpi.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-500/5 border ${kpi.color || 'text-blue-500'}`} style={{ borderColor: 'var(--db-sidebar-border)' }}>
                {kpi.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Children content area */}
        <div className="lg:col-span-3 space-y-6">
          {children}
        </div>

        {/* Side Panel: AI Insights & Activity Timeline */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Insights Card */}
          <div className="p-5 rounded-2xl border relative overflow-hidden" 
               style={{ 
                 backgroundColor: 'var(--db-card-bg)', 
                 borderColor: 'rgba(59, 130, 246, 0.2)',
                 boxShadow: '0 0 15px rgba(59, 130, 246, 0.05)'
               }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" /> AI Insights Advisor
            </h3>
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl border text-[11px] leading-relaxed" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  {insight}
                </div>
              ))}
              {aiInsights.length === 0 && (
                <p className="text-[11px] italic" style={{ color: 'var(--db-text-muted)' }}>No training anomalies detected. Serving status is optimal.</p>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-violet-500" /> Activity Stream
            </h3>
            <div className="space-y-3">
              {activities.map((act, idx) => (
                <div key={idx} className="flex gap-2 text-[10px] border-b pb-2 last:border-0" style={{ borderColor: 'var(--db-sidebar-border)' }}>
                  <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--db-text-muted)' }}>{act.time}</span>
                  <div>
                    <span className="font-bold">{act.title}</span>
                    <p style={{ color: 'var(--db-text-muted)' }}>{act.desc}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-[11px] italic" style={{ color: 'var(--db-text-muted)' }}>No diagnostic queries received.</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
