
import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Database, 
  Wrench, 
  MoreHorizontal 
} from 'lucide-react';

interface TabBarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: 'dashboard', label: 'HOME', icon: LayoutDashboard },
    { id: 'calendar', label: 'TRACK', icon: Calendar },
    { id: 'records', label: 'RECORDS', icon: Database },
    { id: 'tools', label: 'TOOLS', icon: Wrench },
    { id: 'settings', label: 'MORE', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
      <div className="bg-app/80 backdrop-blur-2xl rounded-[32px] border border-main px-2 py-2 flex justify-between items-center shadow-2xl">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              className="relative flex flex-col items-center justify-center h-14 flex-1 rounded-[24px] transition-all group"
            >
              {isActive && (
                <div 
                  className="absolute inset-0 bg-white/[0.05] rounded-[24px]"
                />
              )}
              <Icon 
                className={`w-5 h-5 mb-1 transition-all duration-300 relative z-10 ${
                  isActive ? 'text-[#007AFF] scale-110' : 'text-tertiary group-hover:text-secondary'
                }`} 
              />
              <span className={`text-[8px] font-bold tracking-wider relative z-10 transition-colors duration-300 ${
                isActive ? 'text-primary' : 'text-tertiary group-hover:text-secondary'
              }`}>
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
