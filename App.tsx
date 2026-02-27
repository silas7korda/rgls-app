
import React, { useState, useEffect, useCallback } from 'react';

import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import DataRecords from './components/DataRecords';
import Tools from './components/Tools';
import Settings from './components/Settings';
import AddRecordModal from './components/AddRecordModal';
import EditRecordModal from './components/EditRecordModal';
import PinEntry from './components/PinEntry';
import CalendarTracker from './components/CalendarTracker';
import { DataRecord, ViewType } from './types';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

const StatusBar: React.FC<{ syncStatus: 'synced' | 'syncing' | 'error' | 'offline' }> = ({ syncStatus }) => {
  const [location, setLocation] = useState<string>('DETECTING...');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const d = new Date();
      const day = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      const dateNum = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      setDateTimeStr(`${day} ${dateNum} ${month}`);
    };
    updateDate();
    const timer = setInterval(updateDate, 60000);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`);
            const data = await res.json();
            const locality = data.address.suburb || data.address.town || data.address.neighbourhood || data.address.city_district || data.address.city || 'LOCALITY';
            const countryCode = data.address.country_code ? data.address.country_code.toUpperCase() : 'GH';
            setLocation(`${locality.toUpperCase()}, ${countryCode}`);
          } catch {
            setLocation('LOCALITY, GH');
          }
        },
        () => setLocation('LOCALITY, GH'),
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const getSyncColor = () => {
    if (!isOnline) return 'text-rose-500';
    if (syncStatus === 'error') return 'text-rose-500';
    if (syncStatus === 'syncing') return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getSyncText = () => {
    if (!isOnline) return 'Offline Mode';
    if (syncStatus === 'error') return 'Sync Error';
    if (syncStatus === 'syncing') return 'Syncing Node...';
    return 'Cloud Secured';
  };

  return (
    <div className="flex flex-col items-start gap-1 pointer-events-none select-none">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black tracking-widest uppercase tabular-nums opacity-20">
          {dateTimeStr} • {location}
        </span>
        <div className="flex items-baseline gap-[1.5px]">
          {[1, 2, 3, 4].map((bar) => (
            <div 
              key={bar} 
              className={`w-[2px] rounded-full bg-[#007AFF] transition-opacity duration-1000 ${isOnline ? 'opacity-100' : 'opacity-10'} ${bar === 4 ? 'h-2.5' : bar === 3 ? 'h-2' : bar === 2 ? 'h-1.5' : 'h-1'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div 
          className={`w-1.5 h-1.5 rounded-full border border-current ${getSyncColor()} ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
        />
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${getSyncColor()}`}>
          {getSyncText()}
        </span>
      </div>
    </div>
  );
};

import { 
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

const SplashScreen: React.FC = () => (
  <div 
    className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden"
  >
    {/* Background Glows */}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--ios-blue)]/20 blur-[120px] rounded-full"
    />
    
    <div className="relative">
      <div 
        className="w-40 h-40 bg-[var(--ios-blue)] rounded-[48px] flex items-center justify-center shadow-[0_30px_80px_rgba(0,122,255,0.4)] relative z-10"
      >
        <span 
          className="text-6xl font-black text-white italic tracking-tighter"
        >
          RG
        </span>
      </div>
      
      {/* Orbiting particles */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute inset-0 -m-8 pointer-events-none"
        >
          <div className={`w-2 h-2 rounded-full bg-white/20 absolute top-0 left-1/2 -translate-x-1/2`} />
        </div>
      ))}
    </div>

    <div 
      className="mt-12 text-center"
    >
      <h1 className="text-white font-black text-xs uppercase tracking-[0.8em] opacity-40">RLGS ENTERPRISE</h1>
      <p className="text-[#007AFF] font-black text-[10px] uppercase tracking-[0.4em] mt-2">Data Management Node</p>
    </div>

    <div 
      className="h-0.5 bg-white/10 absolute bottom-24 rounded-full overflow-hidden w-[200px]"
    >
      <div 
        className="w-1/2 h-full bg-[#007AFF]"
      />
    </div>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('syncing');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const [theme] = useState<'dark'>('dark');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DataRecord | null>(null);

  const [currency, setCurrency] = useState('GHC (₵)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YY');

  // Fetch settings from Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsub = onSnapshot(doc(db, 'config', 'preferences'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) setCurrency(data.currency);
        if (data.dateFormat) setDateFormat(data.dateFormat);
      }
    });

    return () => unsub();
  }, [isAuthenticated]);

  const updatePreference = async (key: string, value: any) => {
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'config', 'preferences'), { [key]: value }, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.error("Error updating preference:", err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-app', '#0A0A0B');
    root.style.setProperty('--bg-card', '#151517');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.6)');
    root.style.setProperty('--text-tertiary', 'rgba(255,255,255,0.35)');
    root.style.setProperty('--border-color', 'rgba(255,255,255,0.06)');
    root.style.setProperty('--ios-blue', '#007AFF');
    document.body.style.backgroundImage = 'none';
  }, []);

  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 8, medium: 15, heavy: [20, 5, 20] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const showNotification = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    if (type !== 'error') setTimeout(() => setNotification(null), 2500);
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, "records"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recs: DataRecord[] = [];
      querySnapshot.forEach((doc) => {
        recs.push({ id: doc.id, ...doc.data() } as DataRecord);
      });
      setRecords(recs);
      setIsLoading(false);
      setSyncStatus('synced');
    }, (error) => {
      console.error("Firestore error:", error);
      showNotification(`Sync Error: ${error.message}`, "error");
      setIsLoading(false);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [isAuthenticated, showNotification]);

  const addRecord = async (newRec: Omit<DataRecord, 'id'>) => {
    try {
      setSyncStatus('syncing');
      await addDoc(collection(db, "records"), newRec);
      showNotification("Archived", "success");
      haptic('light');
      setSyncStatus('synced');
    } catch {
      showNotification("Error saving", "error");
      setSyncStatus('error');
    }
  };

  const deleteRecord = async (record: DataRecord) => {
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, "records", record.id));
      showNotification("Purged", "success");
      haptic('medium');
      setSyncStatus('synced');
    } catch {
      showNotification("Error deleting", "error");
      setSyncStatus('error');
    }
  };

  const updateRecord = async (newRec: DataRecord) => {
    try {
      setSyncStatus('syncing');
      const { id, ...data } = newRec;
      await updateDoc(doc(db, "records", id), data);
      showNotification("Updated", "success");
      haptic('light');
      setSyncStatus('synced');
    } catch {
      showNotification("Error updating", "error");
      setSyncStatus('error');
    }
  };

  const exportToCSV = () => {
    if (records.length === 0) {
      showNotification("No data to export", "info");
      return;
    }

    const headers = ["Date", "Gross Sales", "Savings (20%)", "Machine", "Expenses", "Net"];
    const csvRows = [
      headers.join(","),
      ...records.map(r => [
        r.date,
        r.store,
        r.savings,
        r.machine,
        r.expenses || 0,
        r.store - (r.expenses || 0)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `RGLS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Export Complete", "success");
  };

  return (
    <div className="min-h-screen bg-black text-primary font-sans selection:bg-[#007AFF]/30 overflow-x-hidden relative">
      {/* Background Static Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {showSplash ? (
        <SplashScreen key="splash" />
      ) : !isAuthenticated ? (
        <PinEntry key="auth" onAuthenticated={() => setIsAuthenticated(true)} theme={theme} />
      ) : isLoading ? (
        <div 
          key="loading"
          className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12"
        >
          <div 
            className="w-12 h-12 border-2 border-white/5 border-t-[#007AFF] rounded-full mb-8 shadow-[0_0_20px_rgba(0,122,255,0.2)] animate-spin"
          />
          <p className="text-white/20 font-black text-[11px] tracking-[0.4em] uppercase">Synchronizing Node</p>
        </div>
      ) : (
        <div 
          key="app"
          className={`flex flex-col h-full app-bg text-primary overflow-hidden relative ${theme === 'light' ? 'theme-light' : ''}`}
        >
          <header className="sticky top-0 z-[60] bg-app/80 backdrop-blur-2xl px-6 pt-8 pb-5 flex justify-between items-center border-b border-main">
            <div className="flex-1">
              <StatusBar syncStatus={syncStatus} />
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsAddModalOpen(true)} 
                 className="w-12 h-12 bg-[#007AFF] rounded-2xl flex items-center justify-center shadow-xl shadow-[#007AFF]/30 transition-all hover:scale-105"
               >
                 <Plus className="w-6 h-6 text-white" />
               </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 pt-6 pb-44 scroll-smooth">
            <div className="max-w-md mx-auto">
              <div>
                {currentView === 'dashboard' && <Dashboard records={records} onDelete={setRecordToDelete} currency={currency} />}
                {currentView === 'calendar' && <CalendarTracker records={records} currency={currency} />}
                {currentView === 'records' && <DataRecords records={records} onDelete={setRecordToDelete} onEdit={setEditingRecord} currency={currency} dateFormat={dateFormat} />}
                {currentView === 'tools' && <Tools records={records} onExport={exportToCSV} />}
                {currentView === 'settings' && (
                  <Settings 
                    onClearHistory={() => showNotification("Locked", "info")} 
                    onSignOut={() => setIsAuthenticated(false)} 
                    currency={currency} 
                    setCurrency={setCurrency} 
                    dateFormat={dateFormat} 
                    setDateFormat={setDateFormat} 
                    onUpdatePreference={updatePreference}
                  />
                )}
              </div>
            </div>
          </main>

          <TabBar currentView={currentView} setView={(v) => { haptic('light'); setCurrentView(v); }} />

          {recordToDelete && (
            <div 
              className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div 
                className="vibrant-glass w-full max-w-[280px] rounded-[40px] border border-glass p-8 text-center text-white"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Erase Record?</h3>
                <p className="text-[11px] opacity-40 mb-8 font-medium">This will permanently purge this entry from the cloud node.</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { deleteRecord(recordToDelete); setRecordToDelete(null); }}
                    className="w-full py-4 bg-red-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-red-900/20 text-white transition-all hover:scale-102"
                  >
                    Purge Record
                  </button>
                  <button 
                    onClick={() => setRecordToDelete(null)}
                    className="w-full py-4 bg-white/5 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-gray-400 transition-all hover:scale-102"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {notification && (
            <div 
              className="fixed top-12 left-1/2 z-[300] -translate-x-1/2"
            >
              <div className="bg-app/90 backdrop-blur-xl border border-main px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                 {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                 {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                 {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                 <p className="text-[11px] font-bold text-primary tracking-tight">{notification.message}</p>
              </div>
            </div>
          )}

          {isAddModalOpen && <AddRecordModal onClose={() => setIsAddModalOpen(false)} onSave={(rec) => { addRecord(rec); setIsAddModalOpen(false); }} currency={currency} />}
          {editingRecord && <EditRecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={(rec) => { updateRecord(rec); setEditingRecord(null); }} currency={currency} />}
        </div>
      )}
    </div>
  );
};

export default App;
