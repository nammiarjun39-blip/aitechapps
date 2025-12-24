
import React, { useState, useEffect } from 'react';
import { User, Room, Booking } from './types';
import { initializeData, getCurrentUser, getRooms, getBookings, logout, fetchFromCloud } from './services/storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'DASHBOARD' | 'ADMIN'>('DASHBOARD');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initializeData();
    const storedUser = getCurrentUser();
    if (storedUser) setUser(storedUser);
    handleCloudSync();
  }, []);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    await fetchFromCloud(); // Try to get data from Google Sheets first
    refreshData();
    setIsSyncing(false);
  };

  const refreshData = () => {
    setRooms(getRooms());
    setBookings(getBookings());
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onViewChange={setView} 
        currentView={view} 
      />
      
      {isSyncing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-indigo-200 overflow-hidden z-[1000]">
          <div className="h-full bg-indigo-600 animate-[loading_1.5s_infinite] w-1/3"></div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-20">
        {view === 'DASHBOARD' ? (
          <Dashboard 
            rooms={rooms} 
            bookings={bookings} 
            onRefresh={handleCloudSync} 
            user={user} 
          />
        ) : (
          <AdminPanel 
            bookings={bookings} 
            onRefresh={handleCloudSync} 
          />
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          SV Lodge PMS • Connected to Google Sheets • {new Date().getFullYear()}
        </div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;
