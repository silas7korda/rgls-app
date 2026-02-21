import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  
  const pinDotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lockTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchSecurityConfig = () => {
      try {
        const savedPin = localStorage.getItem('rlgs-access-pin');
        if (savedPin && /^\d{4}$/.test(savedPin)) {
          setRemotePin(savedPin);
        }
      } catch {
        // Fallback to default pin
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

  const handleClear = useCallback(() => {
    if (!isLocked) {
      setPin('');
      setError('');
    }
  }, [isLocked]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2e5bff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0c0e] flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="mb-16 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[#2e5bff] rounded-full mx-auto mb-10 flex items-center justify-center shadow-[0_0_60px_rgba(46,91,255,0.3)]">
          <i className="fa-solid fa-shield-halved text-4xl text-white"></i>
        </div>
        <h2 className="text-3xl font-[900] tracking-tight text-white mb-2">
          Access Portal
        </h2>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
          {isLocked ? 'SYSTEM LOCKED' : 'ENTER SECURE PIN'}
        </p>
      </div>

      {/* PIN Dots */}
      <div className={`flex gap-6 mb-12 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            ref={el => pinDotsRef.current[idx] = el}
            className={`
              w-5 h-5 rounded-full border-2 transition-all duration-300
              ${pin.length > idx 
                ? 'bg-[#2e5bff] border-[#2e5bff] shadow-[0_0_15px_rgba(46,91,255,0.6)]' 
                : 'border-white/20'
              }
              ${error ? 'border-rose-500/50' : ''}
            `}
          />
        ))}
      </div>

      {/* Error Message & Lock Timer */}
      {error && (
        <p className="mb-8 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          {error}
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            disabled={isLocked || lockTimer > 0}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center
              text-3xl font-[900] text-white transition-all
              ${isLocked || lockTimer > 0
                ? 'bg-white/[0.02] cursor-not-allowed opacity-30'
                : 'bg-white/[0.03] hover:bg-white/10 active:bg-[#2e5bff] active:scale-90'
              }
            `}
          >
            {num}
          </button>
        ))}

        {/* Empty spacer */}
        <div className="w-20 h-20" />

        {/* Zero button */}
        <button
          onClick={() => handleKeyPress('0')}
          disabled={isLocked || lockTimer > 0}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            text-3xl font-[900] text-white transition-all
            ${isLocked || lockTimer > 0
              ? 'bg-white/[0.02] cursor-not-allowed opacity-30'
              : 'bg-white/[0.03] hover:bg-white/10 active:bg-[#2e5bff] active:scale-90'
            }
          `}
        >
          0
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isLocked || lockTimer > 0 || pin.length === 0}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all
            ${isLocked || lockTimer > 0 || pin.length === 0
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/30 hover:text-white/60 active:text-white active:scale-90'
            }
          `}
        >
          <i className="fa-solid fa-delete-left text-2xl"></i>
        </button>
      </div>

      {/* Optional: Clear button for power users */}
      {pin.length > 0 && !isLocked && (
        <button
          onClick={handleClear}
          className="mt-8 text-white/20 text-[8px] font-black uppercase tracking-[0.3em] hover:text-white/40 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default PinEntry;