import React, { useState, useMemo } from 'react';
import { DataRecord } from '../types';

interface CalendarTrackerProps {
  records: DataRecord[];
  currency: string;
}

const CalendarTracker: React.FC<CalendarTrackerProps> = ({ records, currency }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getCurrencySymbol = () => currency.includes('GHC') ? '₵' : '$';
  const symbol = getCurrencySymbol();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  // Records for the current viewing month
  const monthRecords = useMemo(() => {
    const prefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    return records.filter(r => r.date.startsWith(prefix));
  }, [records, year, month]);

  // Totals for the month
  const monthTotals = useMemo(() => {
    return monthRecords.reduce((acc, r) => ({
      store: acc.store + (r.store || 0),
      machine: acc.machine + (r.machine || 0),
      savings: acc.savings + (r.savings || 0),
      expenses: acc.expenses + (r.expenses || 0)
    }), { store: 0, machine: 0, savings: 0, expenses: 0 });
  }, [monthRecords]);

  // Group records by date string (YYYY-MM-DD)
  const recordsByDate = useMemo(() => {
    const map: Record<string, { count: number; total: number; storeTotal: number; machineTotal: number; items: DataRecord[] }> = {};
    records.forEach(r => {
      const dateKey = r.date.split(' ')[0]; // Extract YYYY-MM-DD
      if (!map[dateKey]) map[dateKey] = { count: 0, total: 0, storeTotal: 0, machineTotal: 0, items: [] };
      map[dateKey].count += 1;
      map[dateKey].total += r.machine + r.savings;
      map[dateKey].storeTotal += r.store;
      map[dateKey].machineTotal += r.machine;
      map[dateKey].items.push(r);
    });
    return map;
  }, [records]);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (monthRecords.length === 0) return null;
    
    let bestDayValue = 0;
    let bestDayDate = '';
    const dailyTotals = Object.entries(recordsByDate)
      .filter(([date]) => date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`))
      .map(([date, data]) => {
        // Fix: Explicitly cast data to a typed object to resolve the 'unknown' property access error
        const entryData = data as { total: number };
        if (entryData.total > bestDayValue) {
          bestDayValue = entryData.total;
          bestDayDate = date;
        }
        return entryData.total;
      });

    const avgDaily = monthTotals.machine / (dailyTotals.length || 1);
    const profitMargin = monthTotals.store > 0 ? ((monthTotals.machine + monthTotals.savings) / monthTotals.store) * 100 : 0;
    
    return {
      bestDayValue,
      bestDayDate,
      avgDaily,
      profitMargin,
      entryCount: monthRecords.length,
      activeDays: dailyTotals.length
    };
  }, [monthRecords, monthTotals, recordsByDate, year, month]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    const firstDay = startDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, current: false, date: null });
    }

    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ day: i, current: true, date: dateStr, data: recordsByDate[dateStr] });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, date: null });
    }

    return days;
  }, [year, month, recordsByDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
    setSelectedDate(null);
  };

  const selectedData = selectedDate ? recordsByDate[selectedDate] : null;

  // Trend data for the graph (Daily revenue for the month)
  const trendData = useMemo(() => {
    const days = daysInMonth(year, month);
    const trend = [];
    let max = 100;
    for (let i = 1; i <= days; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const val = recordsByDate[dateStr]?.total || 0;
      if (val > max) max = val;
      trend.push({ day: i, val });
    }
    return trend.map(t => ({ ...t, height: (t.val / max) * 100 }));
  }, [year, month, recordsByDate]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 h-full pb-32">
      <div className="px-1 py-6 border-b border-white/[0.03] flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{monthName}</h2>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">{year} Growth Tracker</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:scale-90 transition-all border border-white/5">
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
          </button>
          <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 active:scale-90 transition-all border border-white/5">
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>

      <div className="bg-[#121214] p-6 rounded-[40px] border border-white/[0.04] shadow-2xl mb-8">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[9px] font-black text-white/20 uppercase py-2 tracking-widest">{d}</div>
          ))}
          {calendarDays.map((d, idx) => {
            const isSelected = selectedDate === d.date;
            const isToday = d.date === todayStr;
            return (
              <div 
                key={idx} 
                onClick={() => d.date && setSelectedDate(isSelected ? null : d.date)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                  d.current ? 'cursor-pointer active:scale-90 hover:bg-white/5' : 'opacity-0 pointer-events-none'
                } ${isSelected ? 'ring-2 ring-[#2e5bff] bg-[#2e5bff]/10' : ''} ${
                  isToday && !isSelected ? 'border-2 border-white/20' : ''
                } ${d.data && !isSelected ? 'bg-[#2e5bff] shadow-lg shadow-[#2e5bff]/20' : 'bg-white/[0.02]'}`}
              >
                <span className={`text-[11px] font-black ${d.data || isSelected || isToday ? 'text-white' : 'text-white/20'}`}>{d.day}</span>
                {isToday && !isSelected && !d.data && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2e5bff]"></div>
                )}
                {d.data && (
                  <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-[#2e5bff]' : 'bg-white/60'}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-10">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Day Details: {selectedDate} {selectedDate === todayStr ? '(TODAY)' : ''}</h3>
            </div>
            {selectedData && (
              <span className="text-[10px] font-black text-[#2e5bff] uppercase tracking-widest">{selectedData.count} Records</span>
            )}
          </div>

          <div className="space-y-4">
            {selectedData ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-white/[0.02] p-4 rounded-3xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">Store Revenue</p>
                    <p className="text-lg font-black text-white">{symbol}{selectedData.storeTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-3xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">Machine Total</p>
                    <p className="text-lg font-black text-emerald-400">{symbol}{selectedData.machineTotal.toLocaleString()}</p>
                  </div>
                </div>
                {selectedData.items.map((item) => (
                  <div key={item.id} className="bg-[#121214] p-5 rounded-[30px] border border-white/[0.06] flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#2e5bff]/10 flex items-center justify-center text-[#2e5bff]">
                        <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">{item.date.split(' ')[1] || '00:00'}</p>
                        <p className="text-sm font-black tabular-nums">{symbol}{item.store.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Yield</p>
                      <p className="text-sm font-black text-emerald-400">+{symbol}{(item.machine + item.savings).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-10 bg-white/[0.02] rounded-[35px] border border-dashed border-white/5 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No transaction data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDate && (
        <div className="space-y-8 px-2 animate-in fade-in duration-500">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Monthly Yield Analytics</h3>
              <div className="h-px flex-1 mx-5 bg-white/5"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SummaryCard label="Grocery Store" value={monthTotals.store} symbol={symbol} sub="Gross Sales" />
              <SummaryCard label="Machine Revenue" value={monthTotals.machine} symbol={symbol} color="text-emerald-400" sub="Pure Income" />
              <SummaryCard label="Operational Savings" value={monthTotals.savings} symbol={symbol} color="text-blue-400" sub="Allocated 20%" />
              <SummaryCard label="Expense Drift" value={monthTotals.expenses} symbol={symbol} color="text-rose-500" sub="System Leakage" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Statistical Performance</h3>
              <div className="h-px flex-1 mx-5 bg-white/5"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#121214] p-5 rounded-[30px] border border-white/[0.04] shadow-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <i className="fa-solid fa-trophy text-[10px]"></i>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Best Day</span>
                 </div>
                 <p className="text-lg font-black text-white">{symbol}{stats?.bestDayValue.toLocaleString() || '0'}</p>
                 <p className="text-[7px] font-bold text-white/10 uppercase mt-1">{stats?.bestDayDate || 'N/A'}</p>
              </div>
              
              <div className="bg-[#121214] p-5 rounded-[30px] border border-white/[0.04] shadow-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <i className="fa-solid fa-chart-line text-[10px]"></i>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Daily Average</span>
                 </div>
                 <p className="text-lg font-black text-white">{symbol}{stats?.avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</p>
                 <p className="text-[7px] font-bold text-white/10 uppercase mt-1">Machine Flow</p>
              </div>

              <div className="bg-[#121214] p-5 rounded-[30px] border border-white/[0.04] shadow-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <i className="fa-solid fa-percentage text-[10px]"></i>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Growth Ratio</span>
                 </div>
                 <p className="text-lg font-black text-white">{stats?.profitMargin.toFixed(1) || '0'}%</p>
                 <p className="text-[7px] font-bold text-white/10 uppercase mt-1">Efficiency Tier</p>
              </div>

              <div className="bg-[#121214] p-5 rounded-[30px] border border-white/[0.04] shadow-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                      <i className="fa-solid fa-calendar-check text-[10px]"></i>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Activity</span>
                 </div>
                 <p className="text-lg font-black text-white">{stats?.activeDays || '0'} Days</p>
                 <p className="text-[7px] font-bold text-white/10 uppercase mt-1">{stats?.entryCount || '0'} Records</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Revenue Trends</h3>
              <div className="h-px flex-1 mx-5 bg-white/5"></div>
            </div>
            
            <div className="bg-[#121214] p-8 rounded-[40px] border border-white/[0.04] shadow-2xl overflow-hidden relative">
               <div className="flex items-end justify-between h-32 gap-1 px-1 relative z-10">
                 {trendData.map((t, idx) => (
                   <div key={idx} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full h-full flex items-end">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-700 ${t.val > 0 ? 'bg-[#2e5bff]/40 group-hover:bg-[#2e5bff]' : 'bg-white/5'}`}
                          style={{ height: `${Math.max(t.height, 4)}%` }}
                        ></div>
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1c1c21] p-1.5 rounded-lg border border-white/10 z-20 pointer-events-none">
                           <p className="text-[7px] font-black text-white whitespace-nowrap">{symbol}{t.val.toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
               <div className="flex justify-between mt-4 px-1 relative z-10">
                 <span className="text-[7px] font-black text-white/20 uppercase">Start</span>
                 <span className="text-[7px] font-black text-white/20 uppercase">End</span>
               </div>
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                  <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(circle, #2e5bff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Strategic Analysis</h3>
              <div className="h-px flex-1 mx-5 bg-white/5"></div>
            </div>
            
            <div className="bg-[#121214] p-7 rounded-[40px] border border-white/[0.04] shadow-xl">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2e5bff]/10 flex items-center justify-center text-[#2e5bff] shrink-0">
                    <i className="fa-solid fa-microchip text-sm"></i>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-white leading-relaxed">
                      {stats && stats.profitMargin > 15 ? 
                        `System efficiency is high at ${stats.profitMargin.toFixed(1)}%. Revenue is primarily driven by machine consistency.` : 
                        "Data indicates a period of stabilization. Focus on increasing machine up-time to improve margins."
                      }
                    </p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Stable Growth</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Risk Protected</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-[#2e5bff] p-7 rounded-[40px] relative overflow-hidden shadow-2xl shadow-blue-500/20">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Net Monthly Liquidity</p>
                <div className="flex justify-between items-baseline">
                  <h4 className="text-3xl font-black text-white">
                    {symbol}{(monthTotals.machine + monthTotals.savings - (monthTotals.expenses || 0)).toLocaleString()}
                  </h4>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <i className="fa-solid fa-arrow-trend-up text-[9px] text-emerald-400"></i>
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">OPTIMIZED</span>
                  </div>
                </div>
             </div>
             <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-7xl text-white/5 -rotate-12"></i>
          </div>
        </div>
      )}
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  symbol: string;
  color?: string;
  sub: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, symbol, color = "text-white", sub }) => (
  <div className="bg-[#121214] p-6 rounded-[35px] border border-white/[0.04] shadow-xl">
    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-lg font-black truncate ${color}`}>{symbol}{value.toLocaleString()}</p>
    <p className="text-[7px] font-bold text-white/10 uppercase tracking-widest mt-1">{sub}</p>
  </div>
);

export default CalendarTracker;