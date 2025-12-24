
import React from 'react';
import { User, UserRole } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onViewChange: (view: 'DASHBOARD' | 'ADMIN') => void;
  currentView: 'DASHBOARD' | 'ADMIN';
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onViewChange, currentView }) => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sri Venkateswara Lodge</h1>
              <p className="text-xs text-slate-500 font-medium">Professional Room Management</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-4">
            <button
              onClick={() => onViewChange('DASHBOARD')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'DASHBOARD' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => onViewChange('ADMIN')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'ADMIN' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">{user.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
