import React from 'react';

/**
 * Reusable Admin Sub-Tab navigation component.
 * Renders a horizontal pill-style tab bar used inside admin pages.
 */
export default function AdminTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pb-4 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer
            ${activeTab === tab.id
              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
              : 'border-transparent hover:bg-[var(--db-input-bg)] hover:border-[var(--db-sidebar-border)]'
            }`}
          style={activeTab !== tab.id ? { color: 'var(--db-text-muted)' } : {}}
        >
          {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
