import React from 'react';
import { Glasses, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-teal-500 rounded-lg">
            <Glasses size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Léo Ótica</h1>
            <span className="text-xs text-slate-400 font-medium tracking-wider">ERP & CRM</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">LO</div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Léo Admin</p>
              <p className="text-xs text-slate-400 truncate">Gerente Geral</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg text-sm transition-colors">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
};