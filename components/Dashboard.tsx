
import React, { useMemo, useState } from 'react';
import { DataRecord, DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  records: DataRecord[];
  onDelete: (record: DataRecord) => void;
  currency: string;
  dateFormat: string;
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#007AFF] p-8 rounded-3xl shadow-xl shadow-[#007AFF]/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white/90 mb-1">Enterprise Revenue</h2>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Machine + Savings</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                <i className={`fa-solid ${isPrivate ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
          </div>
          <p className="text-4xl font-bold mt-8 tracking-tight tabular-nums text-white">
            {formatCurrency(grandTotalRevenue)}
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard value={formatCurrency(totals.machine)} label="Machine" icon="fa-robot" />
        <StatCard value={formatCurrency(totals.savings)} label="Savings" icon="fa-piggy-bank" color="text-emerald-500" />
        <StatCard value={formatCurrency(totals.expenses)} label="Expenses" icon="fa-receipt" color="text-rose-500" />
        <StatCard value={formatCurrency(totals.store)} label="Gross Sales" icon="fa-shop" />
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-tertiary">Recent Activity</h3>
          <div className="h-px flex-1 mx-4 bg-main opacity-50"></div>
        </div>
        <div className="space-y-3 pb-20">
          {records.slice(0, 10).map((record) => (
            <div key={record.id} className="card-bg p-4 rounded-2xl border border-main flex justify-between items-center group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center text-tertiary">
                  <i className="fa-solid fa-calendar-day text-xs"></i>
                </div>
                <div>
                  <p className="text-[9px] text-tertiary font-bold uppercase tracking-widest mb-0.5">{record.date.split('T')[0]}</p>
                  <p className="text-base font-bold tabular-nums">
                    {isPrivate ? '••••' : `${getCurrencySymbol()}${record.store.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(record); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-trash-can text-[10px]"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ value: string, label: string, icon: string, color?: string }> = ({ value, label, icon, color = "text-primary" }) => (
  <div className="card-bg p-5 rounded-3xl border border-main shadow-sm flex flex-col justify-between h-36">
    <div className="w-9 h-9 rounded-xl bg-glass flex items-center justify-center text-tertiary">
      <i className={`fa-solid ${icon} text-xs`}></i>
    </div>
    <div>
      <p className="text-[9px] font-bold text-tertiary uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-bold tracking-tight tabular-nums ${color}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
