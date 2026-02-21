
import React, { useState } from 'react';
import { DataRecord } from '../types';

interface EditRecordModalProps {
  record: DataRecord;
  onClose: () => void;
  onSave: (record: DataRecord) => void;
  currency: string;
  theme: 'dark' | 'light';
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({ record, onClose, onSave, currency }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: record.date.includes(' ') ? record.date.replace(' ', 'T') : record.date,
    store: record.store.toString(),
    machine: record.machine.toString(),
    expenses: record.expenses?.toString() || ''
  });

  const getCurrencySymbol = () => currency.includes('GHC') ? '₵' : '$';
  const symbol = getCurrencySymbol();

  const storeValue = parseFloat(formData.store) || 0;
  const savings = parseFloat((storeValue * 0.2).toFixed(2));
  const machineValue = parseFloat(formData.machine) || 0;
  const restockFunds = parseFloat((storeValue * 0.8).toFixed(2));
  const expenseValue = formData.expenses ? parseFloat(formData.expenses) : null;

  // Validation
  const isNegative = storeValue < 0 || machineValue < 0 || (expenseValue !== null && expenseValue < 0);
  const isStepValid = () => {
    if (step === 1) return formData.store !== '' && storeValue >= 0;
    if (step === 2) return machineValue >= 0 && (expenseValue === null || expenseValue >= 0);
    return true;
  };

  const handleFinish = () => {
    if (isNegative) return;
    onSave({
      id: record.id,
      date: formData.date.replace('T', ' '),
      store: storeValue,
      savings: savings,
      machine: machineValue,
      restockFunds: restockFunds,
      expenses: expenseValue
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 px-0"
      onClick={onClose}
    >
      <div 
        className="card-bg text-primary w-full rounded-t-[40px] border-t border-main shadow-2xl animate-in slide-in-from-bottom-32 duration-700 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-2"></div>
        
        <div className="px-8 pt-4 pb-2 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight">Revise Entry</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-500"></span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-tertiary">Modification Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl bg-glass border border-main flex items-center justify-center text-secondary active:scale-90 transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-8 flex gap-1 my-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1 relative overflow-hidden rounded-full bg-glass">
              <div 
                className={`absolute inset-0 bg-amber-500 transition-transform duration-700 ease-out ${step >= i ? 'translate-x-0' : '-translate-x-full'}`}
              ></div>
            </div>
          ))}
        </div>

        <div className="px-8 pb-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-tertiary tracking-widest px-1">Timestamp</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-glass border border-main rounded-2xl p-5 text-lg font-bold text-primary focus:border-amber-500/40 outline-none transition-all appearance-none"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-tertiary tracking-widest px-1">Store Amount ({symbol})</label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-2xl p-8 text-5xl font-bold focus:border-amber-500/40 outline-none transition-all placeholder:opacity-10 ${storeValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-tertiary tracking-widest px-1">Machine Income ({symbol})</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-2xl p-5 text-xl font-bold focus:border-amber-500/40 outline-none transition-all ${machineValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-tertiary tracking-widest px-1">Expenses ({symbol})</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-2xl p-5 text-xl font-bold focus:border-amber-500/40 outline-none transition-all ${(expenseValue !== null && expenseValue < 0) ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-glass/30 border border-main p-8 rounded-3xl space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Revision Summary</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-secondary uppercase tracking-wider">New Revenue</span>
                    <span className="text-xl font-bold text-primary tabular-nums">{symbol}{storeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-secondary uppercase tracking-wider">Savings (20%)</span>
                    <span className="text-xl font-bold text-emerald-500 tabular-nums">{symbol}{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-medium text-secondary uppercase tracking-wider">Restock Money</span>
                    <span className="text-xl font-bold text-primary tabular-nums">{symbol}{restockFunds.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-12 pt-4">
          {step < 3 ? (
            <button 
              onClick={() => isStepValid() && setStep(step + 1)}
              disabled={!isStepValid()}
              className={`w-full py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isStepValid() ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95' : 'bg-glass text-tertiary cursor-not-allowed'}`}
            >
              Continue <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFinish}
                disabled={isNegative}
                className={`w-full py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${!isNegative ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95' : 'bg-glass text-tertiary cursor-not-allowed'}`}
              >
                Commit Changes <i className="fa-solid fa-check-double text-[10px]"></i>
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full py-3 text-tertiary text-[10px] font-bold uppercase tracking-widest active:opacity-50 transition-all"
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

export default EditRecordModal;
