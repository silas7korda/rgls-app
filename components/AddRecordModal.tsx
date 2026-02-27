import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Check, 
  Loader2, 
  Calendar, 
  DollarSign, 
  Cpu, 
  Receipt,
  ArrowLeft
} from 'lucide-react';
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
    await new Promise(r => setTimeout(r, 1200)); 
    onSave({
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
      onClick={!isSaving ? onClose : undefined}
    >
      <div 
        className="bg-[#0A0A0A] text-white w-full rounded-t-[48px] border-t border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full pt-3 pb-4 flex justify-center">
          <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="px-8 pt-4 pb-2 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black tracking-tighter">New Entry</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">Secure Ledger Node</p>
          </div>
          {!isSaving && (
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="px-8 flex gap-2 my-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1.5 relative overflow-hidden rounded-full bg-white/5">
              <div 
                className={`absolute inset-0 bg-[#007AFF] transition-all duration-500 ${step >= i ? 'translate-x-0' : '-translate-x-full'}`}
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
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-[0.2em] px-1">
                  <Calendar className="w-3 h-3" /> Timestamp
                </label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-white/10 rounded-[24px] p-6 text-lg font-bold text-white focus:border-[#007AFF]/40 outline-none transition-all [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-[0.2em] px-1">
                  <DollarSign className="w-3 h-3" /> Gross Sales ({symbol})
                </label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-[32px] p-10 text-6xl font-black focus:border-[#007AFF]/40 outline-none transition-all placeholder:text-white/5 tracking-tighter ${storeValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-white'}`}
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div 
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-[0.2em] px-1">
                  <Cpu className="w-3 h-3" /> Machine Revenue ({symbol})
                </label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-[24px] p-6 text-xl font-bold focus:border-[#007AFF]/40 outline-none transition-all ${machineValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-white'}`}
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-[0.2em] px-1">
                  <Receipt className="w-3 h-3" /> Expenses ({symbol})
                </label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={`w-full bg-white/5 border border-white/10 rounded-[24px] p-6 text-xl font-bold focus:border-[#007AFF]/40 outline-none transition-all ${expenseValue < 0 ? 'text-rose-500 border-rose-500/30' : 'text-white'}`}
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
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-8 rounded-[40px] space-y-8">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Audit Summary</p>
                <div className="space-y-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">Gross Sales</span>
                    <span className="text-2xl font-black text-white tabular-nums tracking-tight">{symbol}{storeValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">Savings (20%)</span>
                    <span className="text-2xl font-black text-emerald-500 tabular-nums tracking-tight">{symbol}{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">Machine</span>
                    <span className="text-2xl font-black text-white tabular-nums tracking-tight">{symbol}{machineValue.toLocaleString()}</span>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-[11px] font-black text-[#007AFF] uppercase tracking-[0.2em]">Net Flow</span>
                    <span className="text-4xl font-black text-[#007AFF] tabular-nums tracking-tighter">{symbol}{(storeValue + machineValue - expenseValue).toLocaleString()}</span>
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
              className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${canContinue ? 'bg-[#007AFF] text-white shadow-xl shadow-[#007AFF]/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinish}
                disabled={isSaving || isInvalid}
                className={`w-full py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${!isSaving && !isInvalid ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Archiving...
                  </>
                ) : (
                  <>Archive Record <Check className="w-4 h-4" /></>
                )}
              </button>
              <button 
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="w-full py-2 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2"
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

export default AddRecordModal;
