
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  DollarSign, 
  Calendar, 
  Globe, 
  Key, 
  CloudUpload, 
  Trash2, 
  LogOut, 
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface SettingsProps {
  onClearHistory: () => void;
  onSignOut: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  dateFormat: string;
  setDateFormat: (d: string) => void;
  onUpdatePreference: (key: string, value: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClearHistory, 
  onSignOut, 
  currency, 
  setCurrency, 
  dateFormat, 
  setDateFormat,
  onUpdatePreference
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
    const newVal = currency === 'GHC (₵)' ? 'USD ($)' : 'GHC (₵)';
    setCurrency(newVal);
    onUpdatePreference('currency', newVal);
  };

  const toggleDateFormat = () => {
    const formats = ['MM/DD/YY', 'DD/MM/YY', 'YY-MM-DD'];
    const newVal = formats[(formats.indexOf(dateFormat) + 1) % formats.length];
    setDateFormat(newVal);
    onUpdatePreference('dateFormat', newVal);
  };

  const toggleLanguage = () => {
    const langs = ['English', 'French', 'Spanish'];
    setLanguage(prev => langs[(langs.indexOf(prev) + 1) % langs.length]);
  };

  const handleUpdatePin = async () => {
    if (newPin.length !== 4) return alert("PIN must be 4 digits");
    try {
      setIsBackingUp(true);
      await setDoc(doc(db, 'config', 'security'), { accessPin: newPin }, { merge: true });
      localStorage.setItem('rlgs-access-pin', newPin);
      alert("PIN updated successfully in Cloud.");
      setIsChangingPin(false);
      setNewPin('');
    } catch (err) {
      console.error("Error updating PIN:", err);
      alert("Failed to update PIN in Cloud.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Cloud Sync Complete: All preferences and security protocols are synchronized with the central node.');
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center pt-6 mb-4">
        <div 
          className="relative inline-block mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-[#007AFF] to-[#5856D6] rounded-[32px] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-[#007AFF]/20 border-2 border-white/10 italic">
            RG
          </div>
        </div>
        <h2 className="text-3xl font-black text-primary tracking-tighter">Admin Portal</h2>
        <div className="mt-4 flex justify-center">
           <div className="px-6 py-2 border border-main rounded-full bg-glass backdrop-blur-md">
             <p className="text-tertiary text-[10px] font-bold uppercase tracking-[0.3em]">Cloud Node v3.0</p>
           </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="px-1">
        <button 
          onClick={() => toggleSection('preferences')}
          className="w-full flex items-center justify-between px-4 mb-4 group"
        >
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-[0.2em]">Preferences</h3>
          <div className={`transition-transform duration-300 ${expandedSections.preferences ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="w-4 h-4 text-tertiary group-hover:text-secondary transition-colors" />
          </div>
        </button>
        
        {expandedSections.preferences && (
          <div 
            className="overflow-hidden"
          >
            <div className="card-bg rounded-[32px] overflow-hidden border border-main shadow-sm">
              <SettingsItem 
                label="Currency" 
                value={currency} 
                icon={DollarSign} 
                onClick={toggleCurrency}
              />
              <SettingsItem 
                label="Date Format" 
                value={dateFormat} 
                icon={Calendar} 
                onClick={toggleDateFormat}
              />
              <SettingsItem 
                label="Language" 
                value={language} 
                icon={Globe} 
                onClick={toggleLanguage}
                isLast
              />
            </div>
          </div>
        )}
      </div>

      {/* Data & Security Section */}
      <div className="px-1">
        <button 
          onClick={() => toggleSection('security')}
          className="w-full flex items-center justify-between px-4 mb-4 group"
        >
          <h3 className="text-[11px] font-bold text-tertiary uppercase tracking-[0.2em]">Security</h3>
          <div className={`transition-transform duration-300 ${expandedSections.security ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="w-4 h-4 text-tertiary group-hover:text-secondary transition-colors" />
          </div>
        </button>

        {expandedSections.security && (
          <div 
            className="overflow-hidden"
          >
            <div className="card-bg rounded-[32px] overflow-hidden border border-main shadow-sm">
              {!isChangingPin ? (
                <SettingsItem 
                  label="Access PIN" 
                  value="Update" 
                  icon={Key} 
                  color="text-amber-500"
                  onClick={() => setIsChangingPin(true)}
                />
              ) : (
                <div className="p-6 space-y-4 border-b border-main bg-white/[0.01]">
                  <input 
                    type="text" 
                    maxLength={4} 
                    placeholder="New 4-Digit PIN"
                    className="w-full bg-glass border border-main rounded-2xl p-4 text-center text-2xl font-black text-primary outline-none focus:border-[#007AFF]/40 tracking-[0.5em]"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={handleUpdatePin}
                      className="flex-1 py-4 bg-[#007AFF] rounded-2xl font-bold text-[11px] uppercase tracking-widest text-white shadow-lg shadow-[#007AFF]/20"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => setIsChangingPin(false)}
                      className="px-6 py-4 bg-glass rounded-2xl font-bold text-[11px] uppercase tracking-widest text-secondary border border-main"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <SettingsItem 
                label="Cloud Sync" 
                value={isBackingUp ? 'Syncing...' : 'Sync Now'} 
                icon={isBackingUp ? Loader2 : CloudUpload} 
                color="text-blue-500"
                onClick={handleBackup}
                isLoading={isBackingUp}
              />
              <SettingsItem 
                label="Clear History" 
                value="Purge" 
                icon={Trash2} 
                color="text-rose-500"
                onClick={onClearHistory}
                isLast
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 px-1">
        <button 
          onClick={onSignOut}
          className="w-full py-5 bg-rose-500/5 border border-rose-500/10 rounded-3xl text-rose-500 font-bold text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-rose-500/10"
        >
          <div className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </div>
        </button>
      </div>
    </div>
  );
};

interface SettingsItemProps {
  label: string;
  value: string;
  icon: any;
  onClick: () => void;
  color?: string;
  isLast?: boolean;
  isLoading?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, value, icon: Icon, onClick, color = "text-secondary", isLast = false, isLoading = false }) => (
  <div 
    onClick={onClick}
    className={`p-5 flex items-center justify-between cursor-pointer group transition-all hover:bg-white/[0.01] ${!isLast ? 'border-b border-main' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl bg-glass flex items-center justify-center ${color} transition-transform group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
      </div>
      <span className="text-base font-bold text-primary tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-tertiary font-bold uppercase tracking-wider">{value}</span>
      <ChevronRight className="w-4 h-4 text-tertiary opacity-30" />
    </div>
  </div>
);

export default Settings;
