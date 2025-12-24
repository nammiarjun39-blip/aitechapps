
import React, { useState } from 'react';
import { Room, Booking } from '../types';
import { closeBooking } from '../services/storage';

interface CheckOutModalProps {
  room: Room;
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

const BASE_RATE_PER_HOUR = 50; // Example base rate: ₹50 per hour

const CheckOutModal: React.FC<CheckOutModalProps> = ({ room, booking, onClose, onSuccess }) => {
  const [step, setStep] = useState<'BILLING' | 'CONFIRMATION'>('BILLING');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const checkInDate = new Date(booking.checkInTime);
  const now = new Date();
  const diffHours = Math.ceil((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60));
  
  // Calculate expected amount based on duration
  const expectedAmount = Math.max(1, diffHours) * BASE_RATE_PER_HOUR;

  const printReceipt = () => {
    const printArea = document.getElementById('receipt-print-area');
    if (!printArea) return;

    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 350px; margin: auto; padding: 20px; border: 1px solid #ddd; text-align: center;">
        <h2 style="margin: 0; color: #4f46e5;">Sri Venkateswara Lodge</h2>
        <p style="font-size: 10px; color: #777; margin: 5px 0;">Property Management Receipt</p>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
        <div style="text-align: left; font-size: 13px;">
          <p><strong>Receipt No:</strong> #${booking.serialNumber}</p>
          <p><strong>Guest:</strong> ${booking.guestName}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          <p><strong>Room:</strong> ${room.number}</p>
          <p><strong>Stay:</strong> ${diffHours} Hour(s)</p>
          <hr style="border: none; border-top: 1px dashed #ccc; margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
            <span>TOTAL PAID:</span>
            <span>₹${paidAmount || '0.00'}</span>
          </div>
        </div>
        <div style="margin-top: 30px; font-size: 9px; color: #aaa;">
          Thank You for your visit!
        </div>
      </div>
    `;
    window.print();
  };

  const handleFinalConfirm = async () => {
    const amount = Number(paidAmount);
    
    // Alert receptionist if amount is less than expected
    if (amount < expectedAmount) {
      const confirmLow = window.confirm(
        `Warning: The entered amount (₹${amount}) is less than the calculated expected amount (₹${expectedAmount}). \n\nAre you sure you want to finalize this checkout with a lower payment?`
      );
      if (!confirmLow) return;
    }

    setIsSyncing(true);
    await closeBooking(booking.id, amount);
    setIsSyncing(false);
    alert(`Success! Room ${room.number} checkout finalized.`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
        
        {/* Mobile Header */}
        <div className={`px-5 py-5 flex justify-between items-center ${step === 'BILLING' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
          <div className="text-white">
            <h3 className="text-lg font-black uppercase leading-tight">Room {room.number}</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              {step === 'BILLING' ? 'Checkout - Step 1' : 'Final Verification - Step 2'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {step === 'BILLING' ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In-house Guest</p>
                <h4 className="text-xl font-black text-slate-900 truncate">{booking.guestName}</h4>
                <div className="flex items-center text-xs text-indigo-600 font-bold">
                  <span className="mr-2">#{booking.serialNumber}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 rounded-full">{booking.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Stay</p>
                  <p className="text-sm font-black text-rose-600">{diffHours} hrs</p>
                </div>
                <div className="text-center border-l border-slate-200">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Expected</p>
                  <p className="text-sm font-black text-slate-900">₹{expectedAmount}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Collected (₹)</label>
                  {paidAmount && Number(paidAmount) < expectedAmount && (
                    <span className="text-[9px] font-bold text-rose-500 animate-pulse">Low Payment Alert</span>
                  )}
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  autoFocus
                  className={`w-full px-5 py-4 text-4xl font-black bg-slate-50 border-2 rounded-2xl focus:ring-4 outline-none transition-all placeholder:text-slate-200 ${
                    paidAmount && Number(paidAmount) < expectedAmount 
                      ? 'border-rose-300 text-rose-600 focus:ring-rose-100 focus:border-rose-500' 
                      : 'border-slate-200 text-slate-900 focus:ring-indigo-100 focus:border-indigo-600'
                  }`}
                  placeholder="0"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                   if (!paidAmount || Number(paidAmount) < 0) return alert('Enter a valid collection amount');
                   setStep('CONFIRMATION');
                }}
                className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-50 p-5 rounded-3xl space-y-4 border-2 border-slate-100">
                <p className="text-center text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Final Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Guest:</span>
                    <span className="text-slate-900">{booking.guestName}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Receipt:</span>
                    <span className="text-slate-900">#{booking.serialNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900 uppercase">Paid Amount:</span>
                      {Number(paidAmount) < expectedAmount && (
                        <span className="text-[8px] text-rose-500 font-bold italic">Below Expected (₹{expectedAmount})</span>
                      )}
                    </div>
                    <span className={`text-2xl font-black ${Number(paidAmount) < expectedAmount ? 'text-rose-600' : 'text-emerald-600'}`}>₹{paidAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  disabled={isSyncing}
                  className={`w-full py-4 ${isSyncing ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center`}
                >
                  {isSyncing ? (
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Confirm Checkout'}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                   <button
                    onClick={printReceipt}
                    className="py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center text-xs"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Print
                  </button>
                  <button
                    onClick={() => setStep('BILLING')}
                    className="py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-xs"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckOutModal;
