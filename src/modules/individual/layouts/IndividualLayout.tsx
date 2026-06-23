import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface IndividualLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const IndividualLayout: React.FC<IndividualLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'orders', name: 'My Orders', icon: 'shopping_bag' },
    { id: 'addresses', name: 'Manage Addresses', icon: 'location_on' },
    { id: 'wishlist', name: 'Wishlist & Saved', icon: 'favorite' },
    { id: 'rewards', name: 'BuildPoints™ Rewards', icon: 'stars' },
    { id: 'profile', name: 'Profile Settings', icon: 'person' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-200 w-64 flex-shrink-0 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute md:relative'}`}>
        <div className="h-16 flex items-center justify-between px-lg border-b border-slate-800">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#FFC107] text-[28px] font-bold">house</span>
            <span className="font-extrabold text-lg tracking-wider text-white">ARCUS <span className="text-[#FFC107] text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">INDIVIDUAL</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-md px-sm space-y-xs">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-md px-md py-sm rounded-xl text-body-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-[#FFC107] text-slate-950 shadow-sm shadow-[#FFC107]/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-md border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[#FFC107] font-bold text-sm">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">Individual Portal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-lg shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-md">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-slate-950">
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
            <h2 className="text-headline-h6 font-extrabold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-md">
            <a
              href="#/"
              className="flex items-center gap-xs px-md h-10 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Exit Dashboard
            </a>
          </div>
        </header>

        <main className="flex-1 p-lg overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default IndividualLayout;
