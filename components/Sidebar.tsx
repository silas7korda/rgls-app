
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isDarkMode, setDarkMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' },
    { id: 'records', label: 'Data Records', icon: 'fa-table-list' },
    { id: 'import', label: 'Import Data', icon: 'fa-upload' },
    { id: 'export', label: 'Export Data', icon: 'fa-download' },
    { id: 'settings', label: 'Settings', icon: 'fa-gear' },
  ];

  return (
    <aside className="w-64 bg-[#16161a] border-r border-gray-800 flex flex-col">
      <div className="p-4 bg-[#2e5bff] flex items-center gap-3">
        <i className="fa-solid fa-building text-xl"></i>
        <span className="font-bold text-lg tracking-wider">RLGS ENTERPRISE</span>
      </div>

      <nav className="mt-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${
              currentView === item.id 
                ? 'bg-[#1a2b5e] text-[#2e5bff] border-l-4 border-[#2e5bff]' 
                : 'text-gray-400 hover:bg-[#1f1f23] hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Dark Mode</span>
          <button 
            onClick={() => setDarkMode(!isDarkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-[#2e5bff]' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
