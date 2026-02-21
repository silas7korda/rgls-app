
import React from 'react';
import { ViewType } from '../types';

interface TabBarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: 'dashboard', label: 'HOME', icon: 'fa-house' },
    { id: 'calendar', label: 'TRACK', icon: 'fa-calendar-days' },
    { id: 'records', label: 'RECORDS', icon: 'fa-folder-open' },
    { id: 'tools', label: 'TOOLS', icon: 'fa-screwdriver-wrench' },
    { id: 'settings', label: 'MORE', icon: 'fa-ellipsis' },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
      <div className="bg-app/80 backdrop-blur-2xl rounded-[28px] border border-main px-1.5 py-1.5 flex justify-between items-center shadow-2xl">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              className={`relative flex flex-col items-center justify-center h-12 flex-1 rounded-[22px] transition-all duration-300 ${
                isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <i className={`fa-solid ${tab.icon} ${isActive ? 'text-[#007AFF]' : 'text-tertiary'} text-sm mb-1`}></i>
              <span className={`text-[8px] font-bold tracking-wider ${isActive ? 'text-primary' : 'text-tertiary'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
