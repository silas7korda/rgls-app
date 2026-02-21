
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  onClearHistory: () => void;
  onSignOut: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  dateFormat: string;
  setDateFormat: (d: string) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClearHistory, 
  onSignOut, 
  currency, 
  setCurrency, 
  dateFormat, 
  setDateFormat,
  theme,
  setTheme
}) => {
  const [language, setLanguage] = useState('English');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    preferences: true,
    security: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'GHC (₵)' ? 'USD ($)' : 'GHC (₵)');
  };

  const toggleDateFormat = () => {
    const formats = ['MM/DD/YY', 'DD/MM/YY', 'YY-MM-DD'];
    setDateFormat(formats[(formats.indexOf(dateFormat) + 1) % formats.length]);
  };

  const toggleLanguage = () => {
    const langs = ['English', 'French', 'Spanish'];
    setLanguage(prev => langs[(langs.indexOf(prev) + 1) % langs.length]);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleUpdatePin = () => {
    if (newPin.length !== 4) return alert("PIN must be 4 digits");
    try {
      setIsBackingUp(true);
      localStorage.setItem('rlgs-access-pin', newPin);
      alert("PIN updated successfully on this device.");
      setIsChangingPin(false);
      setNewPin('');
    } catch (_) {
      alert("Failed to update PIN.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Local Data Secured: All records are stored safely on this device.');
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center pt-6 mb-4">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 bg-[#007AFF] rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#007AFF]/20 border-2 border-white/10">
            RL
          </div>
        </div>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Admin Portal</h2>
        <div className="mt-3 flex justify-center">
           <div className="px-6 py-1.5 border border-main rounded-full bg-glass">
             <p className="text-tertiary text-[9px] font-bold uppercase tracking-widest">Local Storage Node</p>
           </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="px-1">
        <button 
          onClick={() => toggleSection('preferences')}
          className="w-full flex items-center justify-between px-4 mb-3 group"
        >
          <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Preferences</h3>
          <motion.i 
            animate={{ rotate: expandedSections.preferences ? 0 : -90 }}
            className="fa-solid fa-chevron-down text-[9px] text-tertiary group-hover:text-secondary transition-colors"
          ></motion.i>
        </button>
        
        <AnimatePresence initial={false}>
          {expandedSections.preferences && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="card-bg rounded-3xl overflow-hidden border border-main shadow-sm">
                <SettingsItem 
                  label="Appearance" 
                  value={theme === 'dark' ? 'Dark' : 'Light'} 
                  icon={theme === 'dark' ? 'fa-moon' : 'fa-sun'} 
                  color="text-[#007AFF]"
                  onClick={toggleTheme}
                />
                <SettingsItem 
                  label="Currency" 
                  value={currency} 
                  icon="fa-dollar-sign" 
                  onClick={toggleCurrency}
                />
                <SettingsItem 
                  label="Date Format" 
                  value={dateFormat} 
                  icon="fa-calendar-day" 
                  onClick={toggleDateFormat}
                />
                <SettingsItem 
                  label="Language" 
                  value={language} 
                  icon="fa-globe" 
                  onClick={toggleLanguage}
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data & Security Section */}
      <div className="px-1">
        <button 
          onClick={() => toggleSection('security')}
          className="w-full flex items-center justify-between px-4 mb-3 group"
        >
          <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Security</h3>
          <motion.i 
            animate={{ rotate: expandedSections.security ? 0 : -90 }}
            className="fa-solid fa-chevron-down text-[9px] text-tertiary group-hover:text-secondary transition-colors"
          ></motion.i>
        </button>

        <AnimatePresence initial={false}>
          {expandedSections.security && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="card-bg rounded-3xl overflow-hidden border border-main shadow-sm">
                {!isChangingPin ? (
                  <SettingsItem 
                    label="Access PIN" 
                    value="Update" 
                    icon="fa-key" 
                    color="text-amber-500"
                    onClick={() => setIsChangingPin(true)}
                  />
                ) : (
                  <div className="p-5 space-y-3 border-b border-main bg-glass/20">
                    <input 
                      type="text" 
                      maxLength={4} 
                      placeholder="New PIN"
                      className="w-full bg-glass border border-main rounded-xl p-3 text-center text-lg font-bold text-primary outline-none focus:border-[#007AFF]/40"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleUpdatePin}
                        className="flex-1 py-3 bg-[#007AFF] rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all text-white"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setIsChangingPin(false)}
                        className="px-5 py-3 bg-glass rounded-xl font-bold text-[10px] uppercase tracking-widest text-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <SettingsItem 
                  label="Local Backup" 
                  value={isBackingUp ? 'Syncing...' : 'Sync'} 
                  icon={isBackingUp ? 'fa-spinner fa-spin' : 'fa-shield-check'} 
                  color="text-blue-500"
                  onClick={handleBackup}
                />
                <SettingsItem 
                  label="Clear History" 
                  value="Purge" 
                  icon="fa-trash-can" 
                  color="text-rose-500"
                  onClick={onClearHistory}
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 px-1">
        <button 
          onClick={onSignOut}
          className="w-full py-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500/10 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

interface SettingsItemProps {
  label: string;
  value: string;
  icon: string;
  onClick: () => void;
  color?: string;
  isLast?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, value, icon, onClick, color = "text-secondary", isLast = false }) => (
  <div 
    onClick={onClick}
    className={`p-5 flex items-center justify-between active:bg-glass cursor-pointer group ${!isLast ? 'border-b border-main' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-9 h-9 rounded-xl bg-glass flex items-center justify-center text-xs ${color} transition-transform`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className="text-base font-medium text-primary tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-tertiary font-medium">{value}</span>
      <i className="fa-solid fa-chevron-right text-[8px] text-tertiary opacity-50"></i>
    </div>
  </div>
);

export default Settings;
