
import React, { useState } from 'react';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleInput = (val: string) => {
    if (display === '0' && !isNaN(Number(val))) {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const calculate = () => {
    try {
      // Basic math evaluation (safe for simple expressions)
      // Replace symbols for JS evaluation
      const sanitized = display.replace('×', '*').replace('÷', '/');
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${sanitized}`)();
      setEquation(display + ' =');
      setDisplay(String(Number(result.toFixed(4))));
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const buttons = [
    ['C', '÷', '×', 'DEL'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '(', ')']
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
      <div className="bg-[#1c1c21] w-full max-w-sm rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 bg-white/5 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-calculator text-[#2e5bff]"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Financial Tool</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8 text-right bg-black/20">
          <div className="h-6 text-xs text-gray-500 font-medium mb-1">{equation}</div>
          <div className="text-4xl font-black tracking-tight text-white overflow-hidden text-ellipsis whitespace-nowrap">
            {display}
          </div>
        </div>

        <div className="p-6 grid grid-cols-4 gap-3">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (btn === '=') calculate();
                else if (btn === 'C') clear();
                else if (btn === 'DEL') setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
                else handleInput(btn);
              }}
              className={`h-14 rounded-2xl font-black text-lg transition-all active:scale-90 ${
                ['÷', '×', '-', '+', '='].includes(btn) 
                  ? 'bg-[#2e5bff] text-white shadow-lg shadow-blue-500/20' 
                  : btn === 'C' || btn === 'DEL'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-white/5 text-white hover:bg-white/10'
              } ${btn === '=' ? 'row-span-1' : ''}`}
            >
              {btn}
            </button>
          ))}
        </div>
        
        <div className="px-6 pb-6">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center italic">
                Secure calculation mode active
            </p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
