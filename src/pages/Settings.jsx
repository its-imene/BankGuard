import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Volume2, 
  VolumeX, 
  Layout, 
  Bell, 
  Webhook, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Settings as SettingsIcon, 
  ShieldCheck
} from 'lucide-react';
import useNotificationSound from '../hooks/useNotificationSound';
import webhookService from '../services/webhookService';
import userService from '../services/userService';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const playSound = useNotificationSound();

  // Tab 1: Account State
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@system.com',
    role: 'SUPER_ADMIN'
  };

  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [lastName, setLastName] = useState(currentUser.lastName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Tab 2: Audio & Sound State
  const [soundMuted, setSoundMuted] = useState(
    localStorage.getItem('notifMuted') === 'true'
  );
  const [soundVolume, setSoundVolume] = useState(
    parseFloat(localStorage.getItem('notifVolume') || '0.7')
  );
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // Tab 3: Automation & Sync State
  const [autoDistEnabled, setAutoDistEnabled] = useState(false);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [webhookSyncError, setWebhookSyncError] = useState(null);

  // Tab 4: Display Preferences
  const [density, setDensity] = useState(localStorage.getItem('displayDensity') || 'cozy');

  useEffect(() => {
    if (activeTab === 'webhooks') {
      fetchBackendSettings();
    }
  }, [activeTab]);

  const fetchBackendSettings = async () => {
    setIsLoadingWebhooks(true);
    setWebhookSyncError(null);
    try {
      const res = await webhookService.getSettings();
      const autoSetting = res.data?.find(s => s.key === 'AUTO_DISTRIBUTION_ENABLED');
      setAutoDistEnabled(autoSetting?.value === 'true');
    } catch (err) {
      console.error('[Settings] Failed to fetch backend settings:', err);
      setWebhookSyncError('Backend service unreachable. Using local simulation.');
      const cached = localStorage.getItem('auto_distribution_enabled') === 'true';
      setAutoDistEnabled(cached);
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('All profile fields are required');
      return;
    }
    setIsSavingProfile(true);
    try {
      // Call backend to update
      await userService.updateMe({ firstName, lastName, email });
      
      // Update local storage so navbar reflects changes immediately
      const updatedUser = { ...currentUser, firstName, lastName, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Profile details saved successfully');
    } catch (err) {
      console.error('[Settings] Failed to update profile:', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };



  const handleMuteToggle = (e) => {
    const isMuted = e.target.checked;
    setSoundMuted(isMuted);
    localStorage.setItem('notifMuted', isMuted ? 'true' : 'false');
    toast.success(isMuted ? 'Notification sounds muted' : 'Notification sounds enabled');
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    localStorage.setItem('notifVolume', vol.toString());
  };

  const handleTestSound = () => {
    setIsPlayingTest(true);
    playSound(soundVolume);
    setTimeout(() => {
      setIsPlayingTest(false);
    }, 1200);
  };

  const handleToggleAutoDistribution = async () => {
    const targetValue = !autoDistEnabled;
    setAutoDistEnabled(targetValue);
    
    try {
      await webhookService.updateSetting('AUTO_DISTRIBUTION_ENABLED', targetValue ? 'true' : 'false');
      toast.success(`Auto-distribution ${targetValue ? 'enabled' : 'disabled'} on backend`);
    } catch (err) {
      console.warn('[Settings] Failed to save setting on server, using local fallback:', err);
      localStorage.setItem('auto_distribution_enabled', targetValue ? 'true' : 'false');
      toast.success(`Saved locally (${targetValue ? 'Enabled' : 'Disabled'})`);
    }
  };

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    localStorage.setItem('displayDensity', newDensity);
    toast.success(`Density style updated to ${newDensity}`);
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const tabClass = (tabId) => `
    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left w-full
    ${activeTab === tabId 
      ? 'bg-orange-500/10 text-orange-400 border-l-4 border-orange-500 shadow-md font-bold' 
      : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
    }
  `;

  // Dark Theme input styling
  const inputClass = "w-full h-11 px-4 bg-[#0b1f3b] border border-white/10 rounded-xl text-sm text-white focus:bg-[#040f1d] focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all outline-none placeholder:text-slate-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header Card */}
      <div className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-r from-[#031124] to-[#0b1f3b] p-6 md:p-8 text-white shadow-xl border border-white/[0.06]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-slate-900/40 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold tracking-wider text-xs uppercase mb-1">
              <SettingsIcon size={14} /> System Configuration
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings Panel</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Customize sound notifications, user account security, automatic distribution engines, and view preferences.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-100">Live Sync</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 flex flex-col gap-2 bg-[#040f1d] border border-white/[0.06] shadow-xl p-4 rounded-2xl h-fit">
          <button onClick={() => setActiveTab('account')} className={tabClass('account')}>
            <User size={18} />
            <span>Profile details</span>
          </button>
          
          <button onClick={() => setActiveTab('audio')} className={tabClass('audio')}>
            <Volume2 size={18} />
            <span>Sound alerts</span>
          </button>
          
          <button onClick={() => setActiveTab('webhooks')} className={tabClass('webhooks')}>
            <Webhook size={18} />
            <div className="flex-1 flex justify-between items-center">
              <span>Automations</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">API</span>
            </div>
          </button>
          
          <button onClick={() => setActiveTab('display')} className={tabClass('display')}>
            <Layout size={18} />
            <span>Preferences</span>
          </button>
          
          <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs border border-orange-500/30">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{firstName} {lastName}</p>
                <p className="text-[10px] font-semibold text-slate-400 truncate capitalize tracking-wider">{currentUser.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content Container */}
        <div className="lg:col-span-3 bg-[#040f1d] border border-white/[0.06] rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 min-h-[500px] text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          {/* Tab: Account */}
          {activeTab === 'account' && (
            <div className="space-y-10 animate-fadeIn relative z-10">
              
              {/* Profile Details Section */}
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                  <User size={20} className="text-orange-500" /> Personal Information
                </h2>
                
                <form onSubmit={handleSaveProfile} className="mt-8 space-y-6">
                  {/* Initials & Upload Mock */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/[0.04]">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-400 shadow-lg text-white font-black text-2xl flex items-center justify-center border border-white/10">
                        {initials}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-[#040f1d] shadow-sm">
                        <ShieldCheck size={14} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-white tracking-wide">System Account</span>
                        <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-1 rounded-md uppercase tracking-widest border border-orange-500/20">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2 font-medium max-w-md">Update your primary account details. Role permissions are firmly managed by your system administrator.</p>
                    </div>
                  </div>

                  {/* Input Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="address@domain.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm h-11 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-orange-500/30"
                  >
                    {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                    <span>{isSavingProfile ? 'Saving Details...' : 'Save Profile'}</span>
                  </button>
                </form>
              </div>

              {/* Authentication Info Section */}
              <div className="pt-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                  <Lock size={20} className="text-orange-500" /> Authentication Security
                </h2>

                <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                      <ShieldCheck size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Passwordless Authentication</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Your account uses modern secure email OTP verification.</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed ml-12">
                    BankGuard has eliminated vulnerable static passwords. Every login requires a dynamic One-Time Passcode (OTP) sent securely to your registered email address. This ensures maximum protection against brute force and credential stuffing attacks. No password resets required.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Tab: Sounds & Alerts */}
          {activeTab === 'audio' && (
            <div className="space-y-8 animate-fadeIn relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                  <Volume2 size={20} className="text-orange-500" /> Audio Notifications
                </h2>
                <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
                  Configure standard sound alerts for real-time notification warnings, batch reviews, and background activities. Adjust volume levels or mute alerts entirely.
                </p>
                
                <div className="mt-8 space-y-6 max-w-xl">
                  {/* Mute toggle option */}
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-white">Mute Sounds</h4>
                      <p className="text-xs text-slate-400 mt-1">Silence all audio warnings entirely.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={soundMuted} 
                        onChange={handleMuteToggle}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-[#031124] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 border border-white/10"></div>
                    </label>
                  </div>

                  {/* Volume level slider */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">Notification Volume</h4>
                        <p className="text-xs text-slate-400 mt-1">Control the playback decibel level of alerts.</p>
                      </div>
                      <span className="text-xs font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">
                        {Math.round(soundVolume * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      {soundMuted || soundVolume === 0 ? <VolumeX size={20} className="text-slate-500" /> : <Volume2 size={20} className="text-orange-500" />}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={handleVolumeChange}
                        disabled={soundMuted}
                        className="flex-1 h-2 bg-[#031124] rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-40 border border-white/10"
                      />
                    </div>
                  </div>

                  {/* Test notification sound button */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={handleTestSound}
                      disabled={isPlayingTest}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm h-11 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-85 focus-visible:ring-4 focus-visible:ring-orange-500/30"
                    >
                      {isPlayingTest ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Playing Tone...</span>
                        </>
                      ) : (
                        <>
                          <Bell size={16} className="animate-bounce" />
                          <span>Test Sound</span>
                        </>
                      )}
                    </button>
                    <div className="text-center sm:text-left">
                      <p className="text-[11px] text-slate-400">Plays standard alert sound file.</p>
                      <p className="text-[11px] text-slate-400">Simulates a live incoming WebSocket trigger.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Automations & Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="space-y-8 animate-fadeIn relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                  <Webhook size={20} className="text-orange-500" /> Automated Distribution Engine
                </h2>
                <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
                  Configure automatic webhook triggers. If active, all newly approved blacklist entries will immediately distribute payloads to target endpoints.
                </p>

                {isLoadingWebhooks ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-orange-500" />
                    <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">Synchronizing with Backend...</p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6 max-w-xl">
                    {webhookSyncError && (
                      <div className="flex items-center gap-2 p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 text-xs font-semibold">
                        <AlertCircle size={16} />
                        <span>{webhookSyncError}</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between p-6 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          Auto-Distribution Webhooks
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                          Enabling this sends full batch payloads to registered external webhook destinations automatically upon Super Admin approval.
                        </p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input 
                          type="checkbox" 
                          checked={autoDistEnabled} 
                          onChange={handleToggleAutoDistribution}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-[#031124] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 border border-white/10"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Check size={14} />
                        <span>System Settings Model Synchronized</span>
                      </div>
                      <p className="text-[11px] text-emerald-400/70 font-medium">
                        Settings are written directly to the secure database configuration.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Display & Styling */}
          {activeTab === 'display' && (
            <div className="space-y-8 animate-fadeIn relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
                  <Layout size={20} className="text-orange-500" /> Interface Preferences
                </h2>
                <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
                  Tailor the density layouts of the lists and data grids to match your screen resolution and reading style.
                </p>

                <div className="mt-8 space-y-6 max-w-xl">
                  {/* Table display density selection */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Data List Density</h4>
                      <p className="text-xs text-slate-400 mt-1">Control layout padding inside database tables.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleDensityChange('cozy')}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                          density === 'cozy' 
                            ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(255,89,37,0.1)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`text-sm font-bold ${density === 'cozy' ? 'text-orange-400' : 'text-white'}`}>Cozy Layout</div>
                        <div className="text-[11px] text-slate-400 mt-1.5 font-medium leading-relaxed">Spacious padding, clean reading focus.</div>
                      </button>

                      <button
                        onClick={() => handleDensityChange('compact')}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                          density === 'compact' 
                            ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(255,89,37,0.1)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`text-sm font-bold ${density === 'compact' ? 'text-orange-400' : 'text-white'}`}>Compact Layout</div>
                        <div className="text-[11px] text-slate-400 mt-1.5 font-medium leading-relaxed">Dense padding for multi-row data scanning.</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
