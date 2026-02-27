
import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Cpu, 
  Receipt,
  ArrowLeft
} from 'lucide-react';
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
  const expenseValue = parseFloat(formData.expenses) || 0;

  // Validation
  const isNegative = storeValue < 0 || machineValue < 0 || expenseValue < 0;
  const isStepValid = () => {
    if (step === 1) return formData.store !== '' && storeValue >= 0;
    if (step === 2) return machineValue >= 0 && expenseValue >= 0;
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
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/90 backdrop-blur-xl px-0"
      onClick={onClose}
    >
      <div 
        className="card-bg text-primary w-full rounded-t-[48px] border-t border-main shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full pt-3 pb-4 flex justify-center">
          <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="px-8 pt-4 pb-2 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black tracking-tighter">Revise Entry</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Modification Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-glass border border-main flex items-center justify-center text-secondary transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 flex gap-2 my-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1.5 relative overflow-hidden rounded-full bg-glass">
              <div 
                className={`absolute inset-0 bg-amber-500 transition-all duration-500 ${step >= i ? 'translate-x-0' : '-translate-x-full'}`}
              />
            </div>
          ))}
        </div>

        <div className="px-8 pb-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div 
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-tertiary tracking-[0.2em] px-1">
                  <Calendar className="w-3 h-3" /> Timestamp
                </label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-glass border border-main rounded-[24px] p-6 text-lg font-bold text-primary focus:border-amber-500/40 outline-none transition-all appearance-none"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-tertiary tracking-[0.2em] px-1">
                  <DollarSign className="w-3 h-3" /> Store Amount ({symbol})
                </label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-[32px] p-10 text-6xl font-black focus:border-amber-500/40 outline-none transition-all placeholder:opacity-5 tracking-tighter ${storeValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div 
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-tertiary tracking-[0.2em] px-1">
                  <Cpu className="w-3 h-3" /> Machine Income ({symbol})
                </label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-[24px] p-6 text-xl font-bold focus:border-amber-500/40 outline-none transition-all ${machineValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-tertiary tracking-[0.2em] px-1">
                  <Receipt className="w-3 h-3" /> Expenses ({symbol})
                </label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-glass border border-main rounded-[24px] p-6 text-xl font-bold focus:border-amber-500/40 outline-none transition-all ${(expenseValue !== null && expenseValue < 0) ? 'text-rose-500 border-rose-500/30' : 'text-primary'}`}
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div 
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-main p-8 rounded-[40px] space-y-8">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500">Revision Summary</p>
                <div className="space-y-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-tertiary uppercase tracking-[0.1em]">New Revenue</span>
                    <span className="text-2xl font-black text-primary tabular-nums tracking-tight">{symbol}{storeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-tertiary uppercase tracking-[0.1em]">Savings (20%)</span>
                    <span className="text-2xl font-black text-emerald-500 tabular-nums tracking-tight">{symbol}{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-tertiary uppercase tracking-[0.1em]">Restock Money</span>
                    <span className="text-2xl font-black text-primary tabular-nums tracking-tight">{symbol}{restockFunds.toLocaleString()}</span>
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
              className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${isStepValid() ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-glass text-tertiary cursor-not-allowed'}`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinish}
                disabled={isNegative}
                className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${!isNegative ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-glass text-tertiary cursor-not-allowed'}`}
              >
                Commit Changes <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full py-2 text-tertiary text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRecordModal;
