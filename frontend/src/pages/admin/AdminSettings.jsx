import { useState } from 'react';
import { Settings, Shield, Key, HardDrive, Database, Save, Eye, EyeOff, RefreshCw, Trash2, Download } from 'lucide-react';
import AdminTabBar from '../../components/AdminTabBar';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'general', label: 'General', icon: '⚙' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'api', label: 'API Keys', icon: '🔑' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'backup', label: 'Backup', icon: '📦' },
];

const SettingRow = ({ label, desc, children }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 py-4 border-b" style={{ borderColor: 'var(--db-sidebar-border)' }}>
    <div>
      <p className="text-sm font-bold" style={{ color: 'var(--db-text-main)' }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--db-text-muted)' }}>{desc}</p>
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
  </button>
);

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'EduVerse AI',
    siteUrl: 'https://eduverse.ai',
    maintenanceMode: false,
    registrationOpen: true,
    maxStudents: 500,
    twoFactor: true,
    sessionTimeout: 30,
    ipWhitelist: false,
    passwordPolicy: 'strong',
    storageUsed: 2.4,
    storageTotal: 10,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const toggleSetting = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6" style={{ color: 'var(--db-text-main)' }}>
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
          ⚙ Settings
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>Configure platform settings, security policies, API keys, storage, and backups.</p>
      </div>

      <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <SettingRow label="Site Name" desc="The name displayed across the platform">
            <input
              className="px-3 py-1.5 rounded-lg border text-sm w-48"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={settings.siteName}
              onChange={(e) => setSettings(s => ({ ...s, siteName: e.target.value }))}
            />
          </SettingRow>
          <SettingRow label="Site URL" desc="The public URL of your platform">
            <input
              className="px-3 py-1.5 rounded-lg border text-sm w-64"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={settings.siteUrl}
              onChange={(e) => setSettings(s => ({ ...s, siteUrl: e.target.value }))}
            />
          </SettingRow>
          <SettingRow label="Maintenance Mode" desc="Temporarily disable access for non-admin users">
            <Toggle enabled={settings.maintenanceMode} onToggle={() => toggleSetting('maintenanceMode')} />
          </SettingRow>
          <SettingRow label="Open Registration" desc="Allow new students to register">
            <Toggle enabled={settings.registrationOpen} onToggle={() => toggleSetting('registrationOpen')} />
          </SettingRow>
          <SettingRow label="Max Students" desc="Maximum number of student accounts allowed">
            <input
              type="number"
              className="px-3 py-1.5 rounded-lg border text-sm w-24 text-center"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={settings.maxStudents}
              onChange={(e) => setSettings(s => ({ ...s, maxStudents: Number(e.target.value) }))}
            />
          </SettingRow>
          <div className="pt-4 flex justify-end">
            <button onClick={() => toast.success('Settings saved!')} className="px-5 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer">
              <Save className="w-3.5 h-3.5 inline mr-1.5" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
          <SettingRow label="Two-Factor Authentication" desc="Require 2FA for all admin accounts">
            <Toggle enabled={settings.twoFactor} onToggle={() => toggleSetting('twoFactor')} />
          </SettingRow>
          <SettingRow label="Session Timeout (minutes)" desc="Auto-logout after inactivity">
            <input
              type="number"
              className="px-3 py-1.5 rounded-lg border text-sm w-24 text-center"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(s => ({ ...s, sessionTimeout: Number(e.target.value) }))}
            />
          </SettingRow>
          <SettingRow label="IP Whitelist" desc="Restrict admin access to specific IP addresses">
            <Toggle enabled={settings.ipWhitelist} onToggle={() => toggleSetting('ipWhitelist')} />
          </SettingRow>
          <SettingRow label="Password Policy" desc="Enforce password complexity requirements">
            <select
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              value={settings.passwordPolicy}
              onChange={(e) => setSettings(s => ({ ...s, passwordPolicy: e.target.value }))}
            >
              <option value="basic">Basic (6+ chars)</option>
              <option value="medium">Medium (8+ chars, mixed)</option>
              <option value="strong">Strong (12+ chars, special)</option>
            </select>
          </SettingRow>
          <div className="pt-4 flex justify-end">
            <button onClick={() => toast.success('Security settings saved!')} className="px-5 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer">
              <Shield className="w-3.5 h-3.5 inline mr-1.5" /> Save Security Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>🔑 Active API Keys</h3>
            <div className="space-y-3">
              {[
                { name: 'Gemini AI', key: 'AIza...k9Tm', status: 'Active', created: '2026-01-15' },
                { name: 'OpenAI GPT', key: 'sk-...v8Kp', status: 'Active', created: '2026-02-20' },
                { name: 'Hugging Face', key: 'hf_...mN3x', status: 'Expired', created: '2025-11-01' },
              ].map((apiKey) => (
                <div key={apiKey.name} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>{apiKey.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--db-text-muted)' }}>{apiKey.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${apiKey.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {apiKey.status}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{apiKey.created}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer">
              + Add New Key
            </button>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>💾 Storage Usage</h3>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--db-text-muted)' }}>Used: {settings.storageUsed} GB</span>
                <span style={{ color: 'var(--db-text-muted)' }}>Total: {settings.storageTotal} GB</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--db-input-bg)' }}>
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(settings.storageUsed / settings.storageTotal) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Datasets', size: '1.2 GB', color: 'text-violet-500' },
                { label: 'Models', size: '0.6 GB', color: 'text-blue-500' },
                { label: 'User Files', size: '0.4 GB', color: 'text-emerald-500' },
                { label: 'Logs', size: '0.2 GB', color: 'text-amber-500' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <p className={`text-lg font-black ${item.color}`}>{item.size}</p>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--db-text-muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <SettingRow label="Auto Backup" desc="Automatically backup data on schedule">
              <Toggle enabled={settings.autoBackup} onToggle={() => toggleSetting('autoBackup')} />
            </SettingRow>
            <SettingRow label="Backup Frequency" desc="How often backups are created">
              <select
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
                value={settings.backupFrequency}
                onChange={(e) => setSettings(s => ({ ...s, backupFrequency: e.target.value }))}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </SettingRow>
          </div>
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--db-text-main)' }}>📦 Recent Backups</h3>
            <div className="space-y-2">
              {[
                { date: '2026-07-05 09:00', size: '2.4 GB', status: 'Complete' },
                { date: '2026-07-04 09:00', size: '2.3 GB', status: 'Complete' },
                { date: '2026-07-03 09:00', size: '2.3 GB', status: 'Complete' },
              ].map((backup, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--db-text-main)' }}>{backup.date}</p>
                    <p className="text-[10px]" style={{ color: 'var(--db-text-muted)' }}>{backup.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{backup.status}</span>
                    <button className="text-blue-500 hover:text-blue-600 cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Backup initiated!')} className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition cursor-pointer">
              Create Backup Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
