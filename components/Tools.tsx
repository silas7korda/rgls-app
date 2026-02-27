
import React, { useState, useCallback } from 'react';
import { 
  Calculator, 
  Coins, 
  Brain, 
  PieChart, 
  FileDown, 
  ChevronLeft,
  Toolbox,
  Delete
} from 'lucide-react';
import { DataRecord } from '../types';

type ActiveTool = 'none' | 'calculator' | 'converter' | 'ai' | 'upgrade_prompt' | 'export';

interface ToolsProps {
  records: DataRecord[];
  onExport: () => void;
}

const Tools: React.FC<ToolsProps> = ({ onExport }) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');

  const haptic = useCallback((type: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'light' ? 10 : 20);
    }
  }, []);

  const openTool = (tool: ActiveTool) => {
    haptic('medium');
    setActiveTool(tool);
  };

  const closeTool = () => {
    haptic('light');
    setActiveTool('none');
  };

  if (activeTool === 'calculator') {
    return <ModernCalculator onClose={closeTool} haptic={haptic} />;
  }

  if (activeTool === 'converter') {
    return <SimplePlaceholder toolName="Currency Converter" icon={Coins} onClose={closeTool} />;
  }

  if (activeTool === 'ai') {
    return <SimplePlaceholder toolName="AI Business Analyst" icon={Brain} onClose={closeTool} />;
  }

  return (
    <div className="space-y-8 pb-16 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div 
          className="w-12 h-12 rounded-2xl bg-[#007AFF]/5 flex items-center justify-center border border-[#007AFF]/10"
        >
          <Toolbox className="w-6 h-6 text-[#007AFF]" />
        </div>
        <h3 className="font-bold tracking-[0.2em] uppercase text-[10px] text-tertiary">Business Suite</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 px-1">
        <ToolButton 
          icon={Calculator} 
          label="Calculator" 
          desc="Verify Margins" 
          color="bg-[#007AFF]" 
          onClick={() => openTool('calculator')} 
        />
        <ToolButton 
          icon={Coins} 
          label="Converter" 
          desc="GHC to USD" 
          color="bg-emerald-500" 
          onClick={() => openTool('converter')} 
        />
        <ToolButton 
          icon={Brain} 
          label="AI Tools" 
          desc="Growth Logic" 
          color="bg-indigo-500" 
          onClick={() => openTool('ai')} 
        />
        <ToolButton 
          icon={PieChart} 
          label="Insights" 
          desc="Market Drift" 
          color="bg-amber-500" 
          onClick={() => openTool('upgrade_prompt')}
        />
        <ToolButton 
          icon={FileDown} 
          label="Export Data" 
          desc="Excel & CSV" 
          color="bg-slate-600" 
          onClick={onExport} 
        />
      </div>

      <div 
        className="px-2 pt-4"
      >
        <div className="bg-white/[0.02] border border-main p-5 rounded-3xl space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-tertiary">System Status</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-secondary tracking-tight">Financial Engine Online</span>
            </div>
            <span className="text-[9px] font-bold text-tertiary">v3.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolButtonProps {
  icon: any;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon: Icon, label, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-start p-5 rounded-3xl border border-main bg-card transition-all duration-300 relative overflow-hidden group"
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-5 text-white ${color} shadow-lg shadow-black/20 transition-transform group-hover:scale-110`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-bold text-primary mb-0.5 tracking-tight">{label}</span>
    <span className="text-[9px] font-bold text-tertiary uppercase tracking-wider">{desc}</span>
  </button>
);

interface ModernCalculatorProps {
  onClose: () => void;
  haptic: (type?: 'light' | 'medium') => void;
}

const ModernCalculator: React.FC<ModernCalculatorProps> = ({ onClose, haptic }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleInput = (val: string) => {
    haptic('light');
    if (display === '0' && !isNaN(Number(val))) setDisplay(val);
    else if (display.length < 12) setDisplay(display + val);
  };

  const calculate = () => {
    haptic('medium');
    try {
      const sanitized = display.replace('×', '*').replace('÷', '/');
      const result = new Function(`return ${sanitized}`)();
      setEquation(display + ' =');
      setDisplay(String(Number(result.toFixed(6))));
    } catch { setDisplay('Error'); }
  };

  const buttons = [
    { label: 'C', type: 'action' }, { label: '÷', type: 'operator' }, { label: '×', type: 'operator' }, { label: 'DEL', type: 'action' },
    { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '-', type: 'operator' },
    { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '+', type: 'operator' },
    { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '=', type: 'equals' },
    { label: '0', type: 'num' }, { label: '.', type: 'num' }, { label: '(', type: 'num' }, { label: ')', type: 'num' }
  ];

  return (
    <div 
      className="max-w-md mx-auto h-[75vh] flex flex-col bg-[#0c0c0e] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
        <button onClick={onClose} className="text-gray-500 hover:text-white flex items-center gap-2 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
        </button>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">Calculator</span>
        <Calculator className="w-4 h-4 text-gray-700" />
      </div>

      <div className="flex-1 flex flex-col justify-end p-8 text-right bg-gradient-to-b from-transparent to-black/20">
        <div className="h-6 text-[11px] font-bold text-gray-700 tracking-wider mb-2 uppercase">{equation}</div>
        <div className="text-6xl font-bold tracking-tighter text-white tabular-nums leading-none truncate">{display}</div>
      </div>

      <div className="p-4 grid grid-cols-4 gap-2 bg-black/40">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
              if (btn.label === '=') calculate();
              else if (btn.label === 'C') { haptic('medium'); setDisplay('0'); setEquation(''); }
              else if (btn.label === 'DEL') { haptic('light'); setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); }
              else handleInput(btn.label);
            }}
            className={`h-16 rounded-[24px] font-bold text-lg transition-all flex items-center justify-center border ${
              btn.type === 'operator' ? 'bg-blue-600/10 text-blue-500 border-blue-500/10' :
              btn.type === 'equals' ? 'bg-blue-600 text-white border-blue-400/20' :
              btn.type === 'action' ? 'bg-red-500/5 text-red-500 border-red-500/10' :
              'bg-white/[0.03] text-white border-white/[0.03]'
            }`}
          >
            {btn.label === 'DEL' ? <Delete className="w-5 h-5" /> : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface SimplePlaceholderProps {
  toolName: string;
  icon: any;
  onClose: () => void;
  upgradeRequired?: boolean;
}

const SimplePlaceholder: React.FC<SimplePlaceholderProps> = ({ toolName, icon: Icon, onClose, upgradeRequired = false }) => (
  <div 
    className="max-w-md mx-auto h-[60vh] flex flex-col items-center justify-center bg-[#0c0c0e] rounded-[48px] border border-white/5 p-12 text-center space-y-6"
  >
    <div className={`w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl ${upgradeRequired ? 'text-amber-500' : 'text-gray-500'}`}>
      <Icon className="w-10 h-10" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{toolName}</h3>
      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
        {upgradeRequired 
          ? "Module is currently restricted. Upgrade to Enterprise Platinum for full access to Market Drift analytics." 
          : "Module is currently restricted. Upgrade to Enterprise Platinum for full access."}
      </p>
    </div>
    <button 
      onClick={onClose}
      className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] text-white"
    >
      Return to Suite
    </button>
  </div>
);

export default Tools;
