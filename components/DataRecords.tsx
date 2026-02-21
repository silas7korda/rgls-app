
import React, { useState, useEffect, useMemo } from 'react';
import { DataRecord } from '../types';

interface DataRecordsProps {
  records: DataRecord[];
  onDelete: (record: DataRecord) => void;
  onEdit: (record: DataRecord) => void;
  currency: string;
  dateFormat: string;
}

const DataRecords: React.FC<DataRecordsProps> = ({ records, onDelete, onEdit, currency, dateFormat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm !== '') {
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(e.target.value !== '');
  };

  const filtered = useMemo(() => {
    return records.filter(r => 
      r.date.includes(searchTerm) || 
      r.store.toString().includes(searchTerm)
    );
  }, [records, searchTerm]);

  const getCurrencySymbol = () => currency.includes('GHC') ? '₵' : '$';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateFormat === 'DD/MM/YY') return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
    if (dateFormat === 'YY-MM-DD') return `${d.getFullYear().toString().slice(-2)}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchTerm ? 'text-[#007AFF]' : 'text-tertiary'}`}></i>
          <input 
            type="text" 
            placeholder="Search entries..." 
            className="w-full bg-glass border border-main rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#007AFF]/40 focus:bg-glass text-primary transition-all placeholder:text-tertiary"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-glass flex items-center justify-center text-[10px]"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        <button 
          onClick={handlePrint}
          className="w-12 h-12 bg-glass border border-main rounded-2xl flex items-center justify-center text-secondary hover:text-[#007AFF] hover:border-[#007AFF]/30 transition-all active:scale-90"
          title="Print Records"
        >
          <i className="fa-solid fa-print text-base"></i>
        </button>
      </div>

      <div className="space-y-3">
        {isSearching ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card-bg rounded-2xl border border-main p-6 animate-pulse">
              <div className="flex justify-between mb-6">
                <div className="h-3 w-20 bg-glass rounded"></div>
                <div className="h-6 w-12 bg-glass rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-8 w-full bg-glass rounded-lg"></div>
                <div className="h-8 w-full bg-glass rounded-lg"></div>
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((record) => (
            <div key={record.id} className="relative card-bg rounded-2xl border border-main overflow-hidden shadow-sm transition-all active:scale-[0.99] duration-300">
              <div className="p-4 border-b border-main flex justify-between items-center bg-glass/50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>
                  <span className="text-[10px] font-bold tracking-wider text-tertiary uppercase">
                    {formatDate(record.date)}
                  </span>
                </div>
                <div className="flex gap-1.5">
                   <button 
                    onClick={() => onDelete(record)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 transition-all"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => onEdit(record)}
                    className="h-8 px-3 rounded-xl bg-[#007AFF]/5 text-[#007AFF] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#007AFF]/10 transition-all"
                  >
                    <i className="fa-solid fa-pen-to-square text-[9px]"></i> Edit
                  </button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 gap-y-6">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-tertiary uppercase font-bold tracking-wider">Gross Sales</p>
                  <p className="text-xl font-bold text-primary tabular-nums">{getCurrencySymbol()}{record.store.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[9px] text-tertiary uppercase font-bold tracking-wider">Savings</p>
                  <p className="text-xl font-bold text-emerald-500 tabular-nums">{getCurrencySymbol()}{record.savings.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-tertiary uppercase font-bold tracking-wider">Machine</p>
                  <p className="text-base font-medium text-secondary tabular-nums">{getCurrencySymbol()}{record.machine.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[9px] text-tertiary uppercase font-bold tracking-wider">Expenses</p>
                  <p className={`text-base font-medium tabular-nums ${record.expenses ? 'text-rose-400' : 'opacity-20'}`}>
                    {record.expenses ? `${getCurrencySymbol()}${record.expenses.toLocaleString()}` : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-20 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-glass rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-folder-open text-2xl"></i>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRecords;
