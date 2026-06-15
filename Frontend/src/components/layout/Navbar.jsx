import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Search, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Navbar = () => {
  const { user, logout } = useAppContext();
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const isProducts = location.pathname.startsWith('/products');

  return (
    <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between relative shadow-sm shrink-0">
      {/* Left side: Breadcrumb / Path indicator */}
      <div className="flex items-center gap-2">
        {isProducts ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">🛒 Products</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">🏠 Dashboard</span>
          </div>
        )}
      </div>

      {/* Middle/Right: Global search & Avatar */}
      <div className="flex items-center gap-4">
        {/* Sub-search shown on Products view or main header */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Services, Products"
            className="w-full bg-slate-50 text-brand-dark placeholder-slate-400 text-xs pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:bg-white focus:border-brand-primary/50 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Notifications Mock */}
        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-sm ring-2 ring-slate-100 select-none">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-brand-dark truncate">{user?.name || 'Owner'}</p>
                  <p className="text-xxs text-brand-lightText truncate">{user?.email || 'owner@example.com'}</p>
                </div>
                
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 text-left transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  My Profile
                </button>
                
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 text-left transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                
                <div className="h-px bg-slate-100 my-1" />
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
