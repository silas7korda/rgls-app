
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  Trash2, 
  Edit3, 
  FolderOpen,
  Loader2
} from 'lucide-react';
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

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    if (val !== '') {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 500);
    }
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

  return (
    <div className="space-y-6 pb-24">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-[#007AFF] animate-spin" />
          ) : (
            <Search className={`w-5 h-5 ${searchTerm ? 'text-[#007AFF]' : 'text-tertiary'}`} />
          )}
        </div>
        <input 
          type="text" 
          placeholder="Search entries..." 
          className="w-full bg-glass border border-main rounded-3xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-[#007AFF]/40 focus:bg-white/[0.02] text-primary transition-all placeholder:text-tertiary font-medium"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(''); setIsSearching(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-2xl bg-glass border border-main flex items-center justify-center text-secondary hover:text-rose-500 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((record) => (
            <div 
              key={record.id} 
              className="relative card-bg rounded-[32px] border border-main overflow-hidden shadow-sm hover:border-[#007AFF]/20 transition-all"
            >
              <div className="p-5 border-b border-main flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/5 flex items-center justify-center text-[#007AFF]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-tertiary uppercase">
                      {formatDate(record.date)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => onDelete(record)}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(record)}
                    className="h-10 px-4 rounded-2xl bg-[#007AFF]/5 text-[#007AFF] font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-[#007AFF]/10 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-tertiary uppercase font-bold tracking-[0.15em]">Gross Sales</p>
                  <p className="text-2xl font-black text-primary tabular-nums tracking-tighter">{getCurrencySymbol()}{record.store.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-tertiary uppercase font-bold tracking-[0.15em]">Savings</p>
                  <p className="text-2xl font-black text-emerald-500 tabular-nums tracking-tighter">{getCurrencySymbol()}{record.savings.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-tertiary uppercase font-bold tracking-[0.15em]">Machine</p>
                  <p className="text-lg font-bold text-secondary tabular-nums tracking-tight">{getCurrencySymbol()}{record.machine.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-tertiary uppercase font-bold tracking-[0.15em]">Expenses</p>
                  <p className={`text-lg font-bold tabular-nums tracking-tight ${record.expenses ? 'text-rose-400' : 'opacity-20'}`}>
                    {record.expenses ? `${getCurrencySymbol()}${record.expenses.toLocaleString()}` : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-glass rounded-[32px] flex items-center justify-center mb-6 text-tertiary/20">
              <FolderOpen className="w-10 h-10" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-tertiary">No records found</p>
            <p className="text-[10px] text-tertiary/50 mt-2">Try adjusting your search parameters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRecords;
