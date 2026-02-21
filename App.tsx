
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
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const StatusBar: React.FC = () => {
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
          } catch (_) {
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

  return (
    <div className="flex flex-col items-start gap-0.5 pointer-events-none select-none">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold tracking-wider uppercase tabular-nums opacity-40">
          {dateTimeStr} • {location}
        </span>
        <div className="flex items-baseline gap-[1px]">
          {[1, 2, 3, 4].map((bar) => (
            <div key={bar} className={`w-[1.5px] rounded-full transition-all duration-700 ${bar === 4 ? 'h-2' : bar === 3 ? 'h-1.5' : bar === 2 ? 'h-1' : 'h-0.5'} ${isOnline ? 'bg-[#007AFF]' : 'opacity-10 bg-current'}`}></div>
          ))}
        </div>
      </div>
      <span className={`text-[7px] font-bold uppercase tracking-[0.2em] ${isOnline ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
        {isOnline ? 'Network Secured' : 'Offline Mode'}
      </span>
    </div>
  );
};

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center animate-in fade-in duration-300">
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#2e5bff] rounded-full animate-pulse opacity-20"></div>
      <div className="w-32 h-32 bg-[#2e5bff] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(46,91,255,0.4)]">
        <span className="text-5xl font-black text-white italic tracking-tighter">RL</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('app-theme') as 'dark' | 'light') || 'dark');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DataRecord | null>(null);

  const [currency, setCurrency] = useState('GHC (₵)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YY');

  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 8, medium: 15, heavy: [20, 5, 20] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const showNotification = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    if (type !== 'error') setTimeout(() => setNotification(null), 2500);
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    const q = query(collection(db, "records"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recs: DataRecord[] = [];
      querySnapshot.forEach((doc) => {
        recs.push({ id: doc.id, ...doc.data() } as DataRecord);
      });
      setRecords(recs);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      showNotification("Load Error", "error");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, showNotification]);

  const addRecord = async (newRec: Omit<DataRecord, 'id'>) => {
    try {
      await addDoc(collection(db, "records"), newRec);
      showNotification("Archived", "success");
      haptic('light');
    } catch (e) {
      showNotification("Error saving", "error");
    }
  };

  const deleteRecord = async (record: DataRecord) => {
    try {
      await deleteDoc(doc(db, "records", record.id));
      showNotification("Purged", "success");
      haptic('medium');
    } catch (e) {
      showNotification("Error deleting", "error");
    }
  };

  const updateRecord = async (newRec: DataRecord) => {
    try {
      const { id, ...data } = newRec;
      await updateDoc(doc(db, "records", id), data);
      showNotification("Updated", "success");
      haptic('light');
    } catch (e) {
      showNotification("Error updating", "error");
    }
  };

  if (showSplash) return <SplashScreen />;
  if (!isAuthenticated) return <PinEntry onAuthenticated={() => setIsAuthenticated(true)} theme={theme} />;

  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-2 border-white/10 border-t-[#007AFF] rounded-full animate-spin mb-6"></div>
      <p className="text-white/30 font-medium text-[10px] tracking-[0.3em] uppercase">Initializing</p>
    </div>
  );

  return (
    <div className={`flex flex-col h-full app-bg text-primary overflow-hidden relative ${theme === 'light' ? 'theme-light' : ''}`}>
      <header className="sticky top-0 z-[60] bg-app/80 backdrop-blur-xl px-6 pt-6 pb-4 flex justify-between items-center border-b border-main">
        <div className="flex-1">
          <StatusBar />
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setIsAddModalOpen(true)} className="w-9 h-9 bg-[#007AFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#007AFF]/20 active:scale-90 transition-transform">
             <i className="fa-solid fa-plus text-sm text-white"></i>
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-44 scroll-smooth">
        <div className="max-w-md mx-auto">
          {currentView === 'dashboard' && <Dashboard records={records} onDelete={setRecordToDelete} currency={currency} />}
          {currentView === 'calendar' && <CalendarTracker records={records} currency={currency} />}
          {currentView === 'records' && <DataRecords records={records} onDelete={setRecordToDelete} onEdit={setEditingRecord} currency={currency} dateFormat={dateFormat} />}
          {currentView === 'tools' && <Tools records={records} />}
          {currentView === 'settings' && (
            <Settings 
              onClearHistory={() => showNotification("Locked", "info")} 
              onSignOut={() => setIsAuthenticated(false)} 
              currency={currency} 
              setCurrency={setCurrency} 
              dateFormat={dateFormat} 
              setDateFormat={setDateFormat} 
              theme={theme}
              setTheme={setTheme}
            />
          )}
        </div>
      </main>

      <TabBar currentView={currentView} setView={(v) => { haptic('light'); setCurrentView(v); }} />

      {recordToDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="vibrant-glass w-full max-w-[280px] rounded-[40px] border border-glass p-8 text-center animate-in zoom-in duration-300 text-white">
            <h3 className="text-lg font-bold mb-2">Erase Record?</h3>
            <p className="text-[10px] opacity-40 mb-8 font-medium">This will permanently purge this entry.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { deleteRecord(recordToDelete); setRecordToDelete(null); }}
                className="w-full py-4 bg-red-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all text-white"
              >
                Purge Record
              </button>
              <button 
                onClick={() => setRecordToDelete(null)}
                className="w-full py-4 bg-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-400 active:scale-95 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-app/90 backdrop-blur-xl border border-main px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
             <p className="text-[11px] font-medium text-primary tracking-tight">{notification.message}</p>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddRecordModal onClose={() => setIsAddModalOpen(false)} onSave={(rec) => { addRecord(rec); setIsAddModalOpen(false); }} currency={currency} />}
      {editingRecord && <EditRecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={(rec) => { updateRecord(rec); setEditingRecord(null); }} currency={currency} />}

      {/* Printable Area */}
      <div id="printable-area" className="hidden print:block p-8 bg-white text-black">
        <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">RLGS ENTERPRISE</h1>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Data Management Report</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Total Records: {records.length}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/20">
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">Date</th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">Gross Sales</th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">Savings (20%)</th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">Machine</th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-black/5">
                <td className="py-3 text-xs font-medium">{record.date}</td>
                <td className="py-3 text-xs font-bold">{currency.includes('GHC') ? '₵' : '$'}{record.store.toLocaleString()}</td>
                <td className="py-3 text-xs font-bold text-emerald-700">{currency.includes('GHC') ? '₵' : '$'}{record.savings.toLocaleString()}</td>
                <td className="py-3 text-xs font-medium">{currency.includes('GHC') ? '₵' : '$'}{record.machine.toLocaleString()}</td>
                <td className="py-3 text-xs font-medium text-red-700">{record.expenses ? `${currency.includes('GHC') ? '₵' : '$'}${record.expenses.toLocaleString()}` : '0.00'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-black/5 font-black">
              <td className="py-4 px-2 text-[10px] uppercase tracking-widest">Total</td>
              <td className="py-4 text-sm">{currency.includes('GHC') ? '₵' : '$'}{records.reduce((acc, r) => acc + r.store, 0).toLocaleString()}</td>
              <td className="py-4 text-sm text-emerald-700">{currency.includes('GHC') ? '₵' : '$'}{records.reduce((acc, r) => acc + r.savings, 0).toLocaleString()}</td>
              <td className="py-4 text-sm" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 pt-8 border-t border-black/10 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">End of Report • RLGS Secure Node</p>
        </div>
      </div>
    </div>
  );
};

export default App;
