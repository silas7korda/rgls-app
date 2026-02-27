
import React, { useMemo, useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Cpu, 
  PiggyBank, 
  Receipt, 
  Store, 
  CalendarDays, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { DataRecord } from '../types';

interface DashboardProps {
  records: DataRecord[];
  onDelete: (record: DataRecord) => void;
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onDelete, currency }) => {
  const [isPrivate, setIsPrivate] = useState(false);

  const totals = useMemo(() => {
    return records.reduce((acc, r) => ({
      store: acc.store + r.store,
      machine: acc.machine + r.machine,
      savings: acc.savings + r.savings,
      expenses: acc.expenses + (r.expenses || 0)
    }), { store: 0, machine: 0, savings: 0, expenses: 0 });
  }, [records]);

  const grandTotalRevenue = totals.machine + totals.savings;
  const getCurrencySymbol = () => currency.includes('GHC') ? '₵' : '$';

  const formatCurrency = (val: number) => {
    if (isPrivate) return `${getCurrencySymbol()} ••••`;
    return `${getCurrencySymbol()}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8">
      <div 
        className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-8 rounded-[40px] shadow-2xl shadow-[#007AFF]/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/60" />
                <h2 className="text-xl font-bold tracking-tight text-white/90">Enterprise Revenue</h2>
              </div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Cloud Synchronized Node</p>
            </div>
            <button 
              onClick={() => setIsPrivate(!isPrivate)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white/80 backdrop-blur-md border border-white/10 transition-colors"
            >
              {isPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p 
            className="text-5xl font-black mt-10 tracking-tighter tabular-nums text-white"
          >
            {formatCurrency(grandTotalRevenue)}
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard value={formatCurrency(totals.machine)} label="Machine" icon={Cpu} />
        <StatCard value={formatCurrency(totals.savings)} label="Savings" icon={PiggyBank} color="text-emerald-500" />
        <StatCard value={formatCurrency(totals.expenses)} label="Expenses" icon={Receipt} color="text-rose-500" />
        <StatCard value={formatCurrency(totals.store)} label="Gross Sales" icon={Store} />
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-tertiary">Live Feed</h3>
          <div className="h-px flex-1 mx-4 bg-main opacity-30"></div>
        </div>
        <div className="space-y-3 pb-20">
          {records.slice(0, 10).map((record) => (
            <div 
              key={record.id} 
              className="card-bg p-5 rounded-3xl border border-main flex justify-between items-center group hover:border-[#007AFF]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-glass flex items-center justify-center text-tertiary group-hover:text-[#007AFF] transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mb-0.5">{record.date.split('T')[0]}</p>
                  <p className="text-lg font-bold tabular-nums tracking-tight">
                    {isPrivate ? '••••' : `${getCurrencySymbol()}${record.store.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(record); }}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ value: string, label: string, icon: any, color?: string }> = ({ value, label, icon: Icon, color = "text-primary" }) => (
  <div 
    className="card-bg p-6 rounded-[32px] border border-main shadow-sm flex flex-col justify-between h-40 group hover:border-[#007AFF]/20 transition-all"
  >
    <div className="w-10 h-10 rounded-2xl bg-glass flex items-center justify-center text-tertiary group-hover:text-[#007AFF] transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={`text-xl font-bold tracking-tighter tabular-nums ${color}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
