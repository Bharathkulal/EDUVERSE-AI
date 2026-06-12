import { useState, useEffect } from 'react';
import { 
  Sparkles, Save, Trash2, Eye, EyeOff, Play, 
  CheckCircle, AlertCircle, RefreshCw, Activity, 
  Key, Database, ShieldAlert, Radio, Volume2, Mic, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminApiSettings.css';
import '../VoiceAssistant.css'; // Reuse HUD scanlines and overlays

export default function AdminApiSettings() {
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [keys, setKeys] = useState({}); // Stores editing keys
  const [showKeys, setShowKeys] = useState({}); // Toggles show/hide
  const [testingStatus, setTestingStatus] = useState({}); // Toggles loader per provider
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Playground state
  const [playgroundProvider, setPlaygroundProvider] = useState('gemini');
  const [playgroundPrompt, setPlaygroundPrompt] = useState('Explain what is API in one sentence.');
  const [playgroundResult, setPlaygroundResult] = useState(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundLogs, setPlaygroundLogs] = useState([]);

  // Voice Test state
  const [voiceTestResult, setVoiceTestResult] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsRes, statsRes] = await Promise.all([
        api.get('/admin/api-settings'),
        api.get('/admin/api-settings/stats')
      ]);
      setProviders(configsRes.data);
      setStats(statsRes.data);
      
      // Initialize edit keys map with existing masked values
      const initialKeys = {};
      configsRes.data.forEach(p => {
        initialKeys[p.provider] = p.api_key || '';
      });
      setKeys(initialKeys);
    } catch (err) {
      toast.error('Failed to load API settings');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyChange = (provider, val) => {
    setKeys(prev => ({ ...prev, [provider]: val }));
  };

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  // SAVE API KEY
  const handleSaveKey = async (provider) => {
    const keyVal = keys[provider];
    if (!keyVal) {
      toast.error('Please enter an API Key first');
      return;
    }
    
    // Skip if they didn't edit the masked key representation
    if (keyVal.includes('************')) {
      toast.error('No changes detected in key.');
      return;
    }

    try {
      const toastId = toast.loading(`Saving ${provider} key...`);
      await api.post('/admin/api-settings/key', {
        provider,
        api_key: keyVal
      });
      toast.success(`${provider} API Key saved securely!`, { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save key');
    }
  };

  // DELETE API KEY
  const handleDeleteKey = async (provider) => {
    if (!window.confirm(`Are you sure you want to delete the key for ${provider}?`)) return;

    try {
      const toastId = toast.loading(`Clearing ${provider} key...`);
      await api.delete(`/admin/api-settings/key/${provider}`);
      toast.success(`${provider} key cleared successfully.`, { id: toastId });
      fetchData();
    } catch (err) {
      toast.error('Failed to delete key');
    }
  };

  // TOGGLE PROVIDER
  const handleToggleProvider = async (provider, currentDisabled) => {
    try {
      const nextState = !currentDisabled;
      await api.post('/admin/api-settings/toggle', {
        provider,
        disabled: nextState
      });
      toast.success(`${provider} ${nextState ? 'disabled' : 'enabled'} successfully.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to toggle provider');
    }
  };

  // TEST API CONNECTION
  const handleTestConnection = async (provider) => {
    setTestingStatus(prev => ({ ...prev, [provider]: true }));
    const originalKey = keys[provider];
    // If the key input is currently masked and untouched, we pass empty key (backend will decrypt DB key)
    const testKey = originalKey.includes('************') ? '' : originalKey;

    try {
      const { data } = await api.post('/admin/api-settings/test', {
        provider,
        api_key: testKey,
        test_prompt: 'Respond with OK'
      });

      if (data.success) {
        toast.success(`${provider} connected! Latency: ${data.latency_ms}ms`);
      } else {
        toast.error(`${provider} failed: ${data.error || 'Connection error'}`);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection test failed');
    } finally {
      setTestingStatus(prev => ({ ...prev, [provider]: false }));
    }
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Perform instant visual reorder locally
    const newProviders = [...providers];
    const item = newProviders[draggedIndex];
    newProviders.splice(draggedIndex, 1);
    newProviders.splice(index, 0, item);
    
    setDraggedIndex(index);
    setProviders(newProviders);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const order = providers.map(p => p.provider);
      await api.post('/admin/api-settings/priority', { priorities: order });
      toast.success('Priorities updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update priorities');
    }
  };

  // AUTO REORDER BY METRICS
  const handleAutoReorder = async () => {
    try {
      const toastId = toast.loading('Sorting providers based on live success rates and latency...');
      const { data } = await api.post('/admin/api-settings/auto-reorder');
      toast.success(data.message, { id: toastId });
      fetchData();
    } catch (err) {
      toast.error('Failed to auto-reorder providers');
    }
  };

  // STREAMING SIMULATION & LOGS IN PLAYGROUND
  const handlePlaygroundRun = async (e) => {
    e.preventDefault();
    if (!playgroundPrompt.trim()) return;

    setPlaygroundLoading(true);
    setPlaygroundResult(null);
    setPlaygroundLogs([]);

    const logEntry = (text, type = 'info') => {
      setPlaygroundLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), text, type }]);
    };

    logEntry(`Initializing testing connection protocols for ${playgroundProvider}...`, 'info');
    logEntry(`Target prompt payload: "${playgroundPrompt}"`, 'info');

    try {
      const startTime = Date.now();
      const { data } = await api.post('/admin/api-settings/test', {
        provider: playgroundProvider,
        test_prompt: playgroundPrompt
      });

      const totalTime = Date.now() - startTime;
      logEntry(`Received response headers in ${data.latency_ms}ms`, 'success');

      if (data.success) {
        logEntry(`Decoding chunk sequence complete. Success.`, 'success');
        
        // Simulate streaming text output effect
        let currentText = '';
        const fullResponse = data.response || 'OK';
        const words = fullResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 80));
          currentText += (i === 0 ? '' : ' ') + words[i];
          setPlaygroundResult({
            success: true,
            status: 'Connected',
            latency_ms: totalTime,
            response: currentText
          });
        }
      } else {
        logEntry(`Error code received: ${data.error || 'Connection error'}`, 'error');
        setPlaygroundResult(data);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Playground request failed';
      logEntry(`Critical Failure: ${errMsg}`, 'error');
      toast.error(errMsg);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // VOICE SIMULATOR ACTIONS
  const startRecordingTest = () => {
    setIsRecording(true);
    setVoiceTestResult('Listening to audio stream input...');
    setTimeout(() => {
      setIsRecording(false);
      setVoiceTestResult('Speech input recognized: "Execute final failover protocol."');
      toast.success('Speech-To-Text simulation success!');
    }, 2500);
  };

  const playTTSVoice = () => {
    setIsPlaying(true);
    toast.success('Streaming ElevenLabs voice output...');
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const getStatusBadge = (p) => {
    if (p.disabled) {
      return (
        <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-full font-bold uppercase">
          Disabled
        </span>
      );
    }
    
    // Check cooldown status
    if (p.cooldown_until && new Date(p.cooldown_until) > new Date()) {
      return (
        <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-full font-bold uppercase animate-pulse">
          <ShieldAlert className="w-3 h-3" /> Cooldown
        </span>
      );
    }

    switch (p.status) {
      case 'Connected':
        return (
          <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Connected
          </span>
        );
      case 'Invalid Key':
        return (
          <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold uppercase">
            <AlertCircle className="w-3 h-3" /> Invalid Key
          </span>
        );
      case 'Rate Limited':
        return (
          <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase">
            <ShieldAlert className="w-3 h-3 animate-pulse" /> Rate Limited
          </span>
        );
      case 'Unstable':
        return (
          <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold uppercase animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Unstable
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full font-bold uppercase">
            Disconnected
          </span>
        );
    }
  };

  const isVoiceProvider = (provider) => {
    return ['deepgram', 'elevenlabs', 'assemblyai', 'azure_speech'].includes(provider);
  };

  if (loading && providers.length === 0) {
    return (
      <div className="friday-premium-dashboard flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm tracking-wider uppercase">Accessing API Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friday-admin-container relative">
      <div className="friday-grid-overlay" />
      <div className="friday-hud-scanline" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="friday-hud-logo text-2xl font-black text-white flex items-center gap-2 tracking-wider">
            AI PROVIDER SMART CONTROL CENTER
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Automated Retry-Failover, Live Performance Metrics & Diagnostics</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAutoReorder} 
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-xs text-white rounded-lg hover:brightness-110 transition flex items-center gap-2 font-bold"
          >
            <Activity className="w-3.5 h-3.5" /> Optimize Priority
          </button>
          <button onClick={fetchData} className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-xs text-cyan-300 rounded-lg hover:border-cyan-500/30 transition flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Reload Protocols
          </button>
        </div>
      </div>

      {/* Stats Dashboard Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="friday-cyber-card p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active LLM</span>
              <span className="text-base font-black text-white capitalize glow-purple">
                {providers.find(p => p.status === 'Connected' && !p.disabled && !isVoiceProvider(p.provider))?.provider || 'None'}
              </span>
            </div>
          </div>

          <div className="friday-cyber-card p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total 30D Requests</span>
              <span className="text-base font-black text-white glow-cyan">
                {stats.summary.reduce((acc, curr) => acc + curr.request_count, 0)}
              </span>
            </div>
          </div>

          <div className="friday-cyber-card p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg Success Rate</span>
              <span className="text-base font-black text-white glow-emerald">
                {stats.summary.length > 0 
                  ? Math.round(stats.summary.reduce((acc, curr) => acc + (curr.success_count / curr.request_count * 100), 0) / stats.summary.length)
                  : 100}%
              </span>
            </div>
          </div>

          <div className="friday-cyber-card p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Configured Keys</span>
              <span className="text-base font-black text-white text-amber-400">
                {providers.filter(p => p.isConfigured).length} / {providers.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Drag Info Banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl mb-6 flex items-center gap-3 text-xs text-cyan-300">
        <Info className="w-5 h-5 flex-shrink-0" />
        <span>Drag and drop providers in the list to update failover sequence priority dynamically. First operational provider will be chosen automatically.</span>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Drag-and-Drop priority listing */}
        <div className="lg:col-span-8 space-y-4">
          {providers.map((p, idx) => (
            <div 
              key={p.provider} 
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`friday-cyber-card friday-drag-item p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${draggedIndex === idx ? 'dragging' : ''}`}
            >
              
              {/* Provider description */}
              <div className="min-w-[160px] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-mono font-bold select-none">#{idx + 1}</span>
                  <h3 className="text-sm font-bold text-white capitalize">{p.provider}</h3>
                  {getStatusBadge(p)}
                </div>
                {p.avgLatency > 0 && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Latency: <strong className="text-cyan-400">{p.avgLatency}ms</strong> | Success: <strong className="text-emerald-400">{p.successRate}%</strong>
                  </span>
                )}
                {p.rpm > 0 && (
                  <span className="text-[9px] text-purple-400 font-bold block mt-0.5">
                    Live RPM: {p.rpm}
                  </span>
                )}
                {p.last_used && (
                  <span className="text-[9px] text-slate-500 block">
                    Last Used: {new Date(p.last_used).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Password field input */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative flex items-center">
                  <input
                    type={showKeys[p.provider] ? 'text' : 'password'}
                    placeholder="Enter API Key or use Environment Fallback"
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 transition"
                    value={keys[p.provider]}
                    onChange={(e) => handleKeyChange(p.provider, e.target.value)}
                  />
                  <button
                    onClick={() => toggleShowKey(p.provider)}
                    className="absolute right-3 text-slate-400 hover:text-white"
                  >
                    {showKeys[p.provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Management action buttons */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => handleToggleProvider(p.provider, p.disabled)}
                  className={`p-2.5 border rounded-xl transition flex items-center justify-center ${
                    p.disabled 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500/40' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40'
                  }`}
                  title={p.disabled ? "Enable Provider" : "Disable Provider"}
                >
                  {p.disabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleTestConnection(p.provider)}
                  disabled={testingStatus[p.provider]}
                  className="p-2.5 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-xl transition flex items-center justify-center"
                  title="Test Connection"
                >
                  {testingStatus[p.provider] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleSaveKey(p.provider)}
                  className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition flex items-center justify-center"
                  title="Save Key"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteKey(p.provider)}
                  className="p-2.5 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl transition flex items-center justify-center"
                  title="Delete Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Right Side: Failover Sequence Info & Live Playground */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Priority Failover HUD Info */}
          <div className="friday-cyber-card p-5 rounded-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" /> Failover Matrix sequence
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              F.R.I.D.A.Y. executes queries using the sequence below. If a provider experiences rate limits, errors, or timeouts, it triggers a **silent failover** after 2 retries.
            </p>
            <div className="space-y-2">
              {providers.map((p, i) => (
                <div key={p.provider} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-xs">
                  <span className="text-slate-400 font-bold tracking-wider">{i + 1}. <span className="capitalize text-white ml-1">{p.provider}</span></span>
                  <div className="flex items-center gap-1.5">
                    {p.disabled ? (
                      <span className="text-rose-500 text-[10px] font-bold">DISABLED</span>
                    ) : p.cooldown_until && new Date(p.cooldown_until) > new Date() ? (
                      <span className="text-rose-400 text-[10px] font-bold animate-pulse">COOLDOWN</span>
                    ) : p.isConfigured ? (
                      <span className="text-emerald-400 font-semibold text-[10px]">ACTIVE</span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">NO KEY</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Test / Playground console */}
          <div className="friday-cyber-card p-5 rounded-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> API Test Playground
            </h3>
            <form onSubmit={handlePlaygroundRun} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Provider</label>
                <select
                  value={playgroundProvider}
                  onChange={(e) => setPlaygroundProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-cyan-300 outline-none cursor-pointer"
                >
                  {providers.map(p => (
                    <option key={p.provider} value={p.provider} disabled={!p.isConfigured || p.disabled}>
                      {p.provider.toUpperCase()} {!p.isConfigured ? '(No Key)' : p.disabled ? '(Disabled)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {isVoiceProvider(playgroundProvider) ? (
                <div className="border border-white/5 p-4 rounded-xl space-y-4 bg-slate-950/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Voice Provider Diagnostic Simulator</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={startRecordingTest}
                      disabled={isRecording}
                      className="py-2 px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center justify-center gap-2 hover:border-red-500/40 transition"
                    >
                      <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
                      {isRecording ? 'Listening...' : 'Simulate STT'}
                    </button>
                    <button
                      type="button"
                      onClick={playTTSVoice}
                      disabled={isPlaying}
                      className="py-2 px-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs flex items-center justify-center gap-2 hover:border-cyan-500/40 transition"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                      {isPlaying ? 'Playing...' : 'Simulate TTS'}
                    </button>
                  </div>

                  {voiceTestResult && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-[10px] font-mono text-slate-300">
                      {voiceTestResult}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Test Prompt</label>
                    <textarea
                      rows="2"
                      value={playgroundPrompt}
                      onChange={(e) => setPlaygroundPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 transition resize-none"
                      placeholder="Enter a prompt to query live..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={playgroundLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-xl font-bold text-xs text-white hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {playgroundLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Test Request'}
                  </button>
                </>
              )}
            </form>

            {/* Diagnostic Logs & Latency Gauge */}
            {(playgroundLogs.length > 0 || playgroundResult) && (
              <div className="mt-4 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Log Stream</span>
                <div className="hologram-scan p-3 rounded-xl text-[10px] space-y-2 max-h-48 overflow-y-auto">
                  {playgroundLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 items-start font-mono">
                      <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                      }>
                        {log.text}
                      </span>
                    </div>
                  ))}
                  {playgroundResult && (
                    <div className="text-slate-300 pt-1 border-t border-white/10 mt-1">
                      {playgroundResult.success ? (
                        <>
                          <div className="text-emerald-400 font-bold mb-1">=== OUTPUT ===</div>
                          <div className="text-white whitespace-pre-wrap">{playgroundResult.response}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-rose-400 font-bold mb-1">=== FAIL ===</div>
                          <div className="text-rose-300 whitespace-pre-wrap">{playgroundResult.error}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {playgroundResult && playgroundResult.success && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Latency Gauge</span>
                      <span>{playgroundResult.latency_ms}ms</span>
                    </div>
                    <div className="latency-gauge-bg">
                      <div 
                        className={`latency-gauge-fill ${
                          playgroundResult.latency_ms < 500 ? 'bg-emerald-400' : playgroundResult.latency_ms < 1500 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(100, (playgroundResult.latency_ms / 3000) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Audit Logs Row */}
      {stats && stats.audit && stats.audit.length > 0 && (
        <div className="friday-cyber-card p-6 rounded-2xl mt-6">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" /> API Configuration audit logs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-white/5 pb-2">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Administrator</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Provider</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {stats.audit.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-2.5 text-slate-500 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="text-slate-300 font-semibold">{log.admin_name || 'System / Auto'}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('DELETE') || log.action.includes('DISABLE') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="capitalize text-slate-300">{log.provider || '-'}</td>
                    <td className="text-slate-400 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
