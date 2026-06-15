import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Search, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { searchQuery, setSearchQuery, logout, user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'products', label: 'Products', icon: ShoppingBag, path: '/products' },
  ];

  // Determine active item based on current location path
  const getActiveTab = () => {
    if (location.pathname.startsWith('/products')) return 'products';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <aside className="w-64 bg-brand-sidebar text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center gap-3 select-none">
        {/* Customized Logo mirroring "Productr" SVG chain link */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight font-sans">Productr</span>
          <svg className="w-5 h-5 text-orange-500 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M8.46 16.06a3.5 3.5 0 0 1 0-4.95l2.12-2.12a1 1 0 1 0-1.41-1.42L7.05 9.7a5.5 5.5 0 0 0 0 7.78l2.83 2.83a5.5 5.5 0 0 0 7.78 0l2.12-2.12a1 1 0 1 0-1.41-1.42l-2.12 2.12a3.5 3.5 0 0 1-4.95 0l-2.84-2.83zm7.08-8.12a3.5 3.5 0 0 1 0 4.95l-2.12 2.12a1 1 0 0 0 1.41 1.42l2.12-2.12a5.5 5.5 0 0 0 0-7.78L14.12 1.7a5.5 5.5 0 0 0-7.78 0 1 1 0 1 0 1.41 1.42l2.12 2.12a3.5 3.5 0 0 1 4.95 0l2.83 2.83z"/>
          </svg>
        </div>
      </div>

      {/* Sidebar Search Bar */}
      <div className="px-4 mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-sidebarSearch text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2 rounded-lg border border-transparent focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700 transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-sidebarHover text-white border-l-2 border-brand-primary'
                  : 'hover:bg-brand-sidebarHover/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-primary' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout & User Info */}
      <div className="p-4 border-t border-slate-800 bg-brand-sidebarSearch/20 flex flex-col gap-2">
        {user && (
          <div className="px-2 py-1">
            <p className="text-xs text-slate-500 truncate">Logged in as</p>
            <p className="text-xs font-semibold text-slate-300 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
