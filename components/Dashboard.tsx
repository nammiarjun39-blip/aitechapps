
import React, { useState } from 'react';
import { Room, Booking, RoomStatus, User } from '../types';
import CheckInModal from './CheckInModal';
import CheckOutModal from './CheckOutModal';

interface DashboardProps {
  rooms: Room[];
  bookings: Booking[];
  onRefresh: () => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ rooms, bookings, onRefresh, user }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalType, setModalType] = useState<'CHECKIN' | 'CHECKOUT' | null>(null);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    if (room.status === RoomStatus.AVAILABLE) {
      setModalType('CHECKIN');
    } else {
      setModalType('CHECKOUT');
    }
  };

  const getActiveBookingForRoom = (roomNumber: number) => {
    return bookings.find(b => b.roomNumber === roomNumber && b.status === 'OPEN');
  };

  const availableCount = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  const occupiedCount = rooms.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-indigo-100 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Rooms</p>
            <h4 className="text-2xl font-bold text-slate-900">{rooms.length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-emerald-100 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Available</p>
            <h4 className="text-2xl font-bold text-slate-900">{availableCount}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="bg-rose-100 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Occupied</p>
            <h4 className="text-2xl font-bold text-slate-900">{occupiedCount}</h4>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Room Status Grid</h3>
            <p className="text-sm text-slate-500">Select a room to manage check-in or check-out</p>
          </div>
          <div className="flex space-x-4 text-xs font-semibold">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
              Available
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span>
              Occupied
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
          {rooms.map((room) => {
            const booking = getActiveBookingForRoom(room.number);
            const isOccupied = room.status === RoomStatus.OCCUPIED;
            
            return (
              <button
                key={room.number}
                onClick={() => handleRoomClick(room)}
                className={`group relative h-24 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-1 ${
                  isOccupied
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                }`}
              >
                <span className="text-xs font-bold uppercase opacity-60">Room</span>
                <span className="text-2xl font-bold">{room.number}</span>
                {isOccupied && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 group-hover:opacity-40 rounded-b-lg"></div>
              </button>
            );
          })}
        </div>
      </div>

      {modalType === 'CHECKIN' && selectedRoom && (
        <CheckInModal 
          room={selectedRoom} 
          user={user}
          onClose={() => setModalType(null)} 
          onSuccess={() => {
            setModalType(null);
            onRefresh();
          }} 
        />
      )}

      {modalType === 'CHECKOUT' && selectedRoom && (
        <CheckOutModal 
          room={selectedRoom} 
          booking={getActiveBookingForRoom(selectedRoom.number)!}
          onClose={() => setModalType(null)} 
          onSuccess={() => {
            setModalType(null);
            onRefresh();
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
