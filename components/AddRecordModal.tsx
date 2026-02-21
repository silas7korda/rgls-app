import React, { useState, useRef, TouchEvent } from 'react';
import { DataRecord } from '../types';

interface AddRecordModalProps {
  onClose: () => void;
  onSave: (record: Omit<DataRecord, 'id'>) => void;
  currency: string;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({ onClose, onSave, currency }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    store: '',
    machine: '',
    expenses: ''
  });

  // Swipe to close
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (isSaving) return;
    setTouchStart(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isSaving) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    const diff = currentY - touchStart;
    
    // Only allow dragging down, with resistance
    if (diff > 0) {
      setDragOffset(Math.min(diff * 0.5, 150)); // Add resistance and max offset
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${Math.min(diff * 0.5, 150)}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isSaving) return;
    
    const swipeDistance = touchEnd - touchStart;
    
    // If swiped down more than 100px, close the modal
    if (swipeDistance > 100) {
      onClose();
    }
    
    // Reset dragging state and position
    setIsDragging(false);
    setDragOffset(0);
    if (modalRef.current) {
      modalRef.current.style.transform = '';
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getCurrencySymbol = () => currency.includes('GHC') ? '₵' : '$';
  const symbol = getCurrencySymbol();

  const storeValue = parseFloat(formData.store) || 0;
  const savings = parseFloat((storeValue * 0.2).toFixed(2));
  const machineValue = parseFloat(formData.machine) || 0;
  const restockFunds = parseFloat((storeValue * 0.8).toFixed(2));
  const expenseValue = formData.expenses ? parseFloat(formData.expenses) : 0;

  const isInvalid = storeValue < 0 || machineValue < 0 || expenseValue < 0;
  const canContinue = step === 1 ? (formData.store !== '' && storeValue >= 0) : (step === 2 ? (machineValue >= 0 && expenseValue >= 0) : true);

  const handleFinish = async () => {
    if (isInvalid) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); 
    onSave({
      date: formData.date.replace('T', ' '),
      store: storeValue,
      savings: savings,
      machine: machineValue,
      restockFunds: restockFunds,
      expenses: formData.expenses ? expenseValue : null
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 px-0"
      onClick={!isSaving ? onClose : undefined}
    >
      <div 
        ref={modalRef}
        className="bg-[#0A0A0A] text-white w-full rounded-t-[40px] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-32 duration-700 flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isDragging ? `translateY(${dragOffset}px)` : '' }}
      >
        {/* Draggable top bar */}
        <div 
          className="w-full pt-2 pb-4 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"></div>
        </div>
        
        <div className="px-8 pt-4 pb-2 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight">New Entry</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-0.5">Secure Ledger</p>
          </div>
          {!isSaving && (
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="px-8 flex gap-1 my-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1 relative overflow-hidden rounded-full bg-white/10">
              <div 
                className={`absolute inset-0 bg-blue-500 transition-transform duration-700 ease-out ${step >= i ? 'translate-x-0' : '-translate-x-full'}`}
              ></div>
            </div>
          ))}
        </div>

        <div className="px-8 pb-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest px-1">Timestamp</label>
                <input 
                  type="datetime-local" 
                  step="any"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:border-blue-500/40 outline-none transition-all appearance-none [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest px-1">Gross Sales ({symbol})</label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-bold focus:border-blue-500/40 outline-none transition-all placeholder:text-white/10 ${storeValue < 0 ? 'text-red-500 border-red-500/30' : 'text-white'}`}
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest px-1">Machine Revenue ({symbol})</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold focus:border-blue-500/40 outline-none transition-all ${machineValue < 0 ? 'text-red-500 border-red-500/30' : 'text-white'}`}
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest px-1">Expenses ({symbol})</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold focus:border-blue-500/40 outline-none transition-all ${expenseValue < 0 ? 'text-red-500 border-red-500/30' : 'text-white'}`}
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Audit Summary</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Gross Sales</span>
                    <span className="text-xl font-bold text-white tabular-nums">{symbol}{storeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Savings (20%)</span>
                    <span className="text-xl font-bold text-emerald-500 tabular-nums">{symbol}{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Machine</span>
                    <span className="text-xl font-bold text-white tabular-nums">{symbol}{machineValue.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Net Flow</span>
                    <span className="text-3xl font-bold text-blue-500 tabular-nums">{symbol}{(storeValue + machineValue - expenseValue).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-12 pt-4">
          {step < 3 ? (
            <button 
              onClick={() => canContinue && setStep(step + 1)}
              disabled={!canContinue}
              className={`w-full py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${canContinue ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95' : 'bg-white/5 text-white/40 cursor-not-allowed'}`}
            >
              Continue <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFinish}
                disabled={isSaving || isInvalid}
                className={`w-full py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${!isSaving && !isInvalid ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95' : 'bg-white/5 text-white/40 cursor-not-allowed'}`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Archiving...
                  </>
                ) : (
                  <>Archive Record <i className="fa-solid fa-check text-[10px]"></i></>
                )}
              </button>
              <button 
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="w-full py-3 text-white/40 text-[10px] font-bold uppercase tracking-widest active:opacity-50 transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecordModal;