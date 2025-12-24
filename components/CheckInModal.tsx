
import React, { useState } from 'react';
import { Room, User, Booking } from '../types';
import { getNextSerialNumber, saveBooking } from '../services/storage';

interface CheckInModalProps {
  room: Room;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ room, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    aadhaar: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serial = getNextSerialNumber();
    const booking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      serialNumber: serial,
      roomNumber: room.number,
      ...formData,
      checkInTime: new Date().toISOString(),
      status: 'OPEN',
      paidAmount: 0,
      receptionistName: user.name,
      receptionistPhone: user.phone
    };

    saveBooking(booking);
    alert(`Booking Successful! Receipt Serial: ${serial}`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Check-In: Room {room.number}</h3>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.guestName}
                onChange={e => setFormData({...formData, guestName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                required
                pattern="[0-9]{12}"
                title="Please enter 12 digit Aadhaar number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.aadhaar}
                onChange={e => setFormData({...formData, aadhaar: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Home Address</label>
              <textarea
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Receptionist:</span>
              <span className="font-bold text-slate-700">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date/Time:</span>
              <span className="font-bold text-slate-700">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Confirm Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
