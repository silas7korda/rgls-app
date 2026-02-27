import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, Delete, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PinEntryProps {
  onAuthenticated: () => void;
  maxAttempts?: number;
}

const PinEntry: React.FC<PinEntryProps> = ({ 
  onAuthenticated, 
  maxAttempts = 3 
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [remotePin, setRemotePin] = useState<string>('2336');
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    const fetchSecurityConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'security');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const foundPin = data.accessPin || data.pin;
          if (foundPin && /^\d{4}$/.test(foundPin.toString())) {
            setRemotePin(foundPin.toString());
          }
        } else {
          const savedPin = localStorage.getItem('rlgs-access-pin');
          if (savedPin && /^\d{4}$/.test(savedPin)) {
            setRemotePin(savedPin);
          }
        }
      } catch (err: any) {
        console.error("Auth sync error:", err);
        const savedPin = localStorage.getItem('rlgs-access-pin');
        if (savedPin && /^\d{4}$/.test(savedPin)) {
          setRemotePin(savedPin);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSecurityConfig();
  }, []);

  useEffect(() => {
    if (lockTimer > 0) {
      const timer = setInterval(() => {
        setLockTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
      setError('');
    }
  }, [lockTimer, isLocked]);

  const handleSuccessfulAuth = useCallback(() => {
    setError('');
    setAttempts(0);
    setTimeout(() => onAuthenticated(), 200);
  }, [onAuthenticated]);

  const handleFailedAuth = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError(`Incorrect PIN • ${maxAttempts - newAttempts} attempts remaining`);
    setPin('');
    
    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
      setLockTimer(30);
      setError(`Too many attempts • Locked for 30s`);
    }
  }, [attempts, maxAttempts]);

  const handleKeyPress = useCallback((num: string) => {
    if (pin.length >= 4 || isLoading || isLocked || lockTimer > 0) return;
    
    const newPin = pin + num;
    setPin(newPin);
    setError('');
    
    if (newPin.length === 4) {
      if (newPin === remotePin) {
        handleSuccessfulAuth();
      } else {
        handleFailedAuth();
      }
    }
  }, [pin, isLoading, isLocked, lockTimer, remotePin, handleSuccessfulAuth, handleFailedAuth]);

  const handleDelete = useCallback(() => {
    if (pin.length > 0 && !isLocked) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  }, [pin, isLocked]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2e5bff] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Initializing Security</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0c0e] flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(46,91,255,0.05)_0%,transparent_70%)]" />
      
      {/* Header */}
      <div 
        className="mb-16 text-center relative z-10"
      >
        <div 
          className={`w-24 h-24 rounded-[32px] mx-auto mb-10 flex items-center justify-center shadow-2xl transition-colors duration-500 ${
            isLocked ? 'bg-rose-500 shadow-rose-500/20' : 'bg-[#2e5bff] shadow-[#2e5bff]/20'
          }`}
        >
          {isLocked ? <ShieldAlert className="w-10 h-10 text-white" /> : <ShieldCheck className="w-10 h-10 text-white" />}
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
          Access Portal
        </h2>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${
          isLocked ? 'text-rose-500' : 'text-white/20'
        }`}>
          {isLocked ? `LOCKED (${lockTimer}s)` : 'ENTER SECURE PIN'}
        </p>
      </div>

      {/* PIN Dots */}
      <div className="flex gap-6 mb-12 relative z-10">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`
              w-4 h-4 rounded-full border-2 transition-all duration-300
              ${pin.length > idx 
                ? 'bg-[var(--ios-blue)] border-[var(--ios-blue)] shadow-[0_0_20px_rgba(46,91,255,0.4)]' 
                : 'bg-white/5 border-white/10'
              }
              ${error ? 'border-rose-500/50' : ''}
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p 
          className="mb-8 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] text-center"
        >
          {error}
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 max-w-xs w-full relative z-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            disabled={isLocked || lockTimer > 0}
            className={`
              w-20 h-20 rounded-[28px] flex items-center justify-center
              text-3xl font-black text-white transition-all border border-white/5
              ${isLocked || lockTimer > 0
                ? 'bg-white/[0.02] cursor-not-allowed opacity-30'
                : 'bg-white/[0.03]'
              }
            `}
          >
            {num}
          </button>
        ))}

        <div className="w-20 h-20" />

        <button
          onClick={() => handleKeyPress('0')}
          disabled={isLocked || lockTimer > 0}
          className={`
            w-20 h-20 rounded-[28px] flex items-center justify-center
            text-3xl font-black text-white transition-all border border-white/5
            ${isLocked || lockTimer > 0
              ? 'bg-white/[0.02] cursor-not-allowed opacity-30'
              : 'bg-white/[0.03]'
            }
          `}
        >
          0
        </button>

        <button
          onClick={handleDelete}
          disabled={isLocked || lockTimer > 0 || pin.length === 0}
          className={`
            w-20 h-20 rounded-[28px] flex items-center justify-center
            transition-all
            ${isLocked || lockTimer > 0 || pin.length === 0
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/60'
            }
          `}
        >
          <Delete className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default PinEntry;
