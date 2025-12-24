
import React, { useState, useMemo } from 'react';
import { Booking } from '../types';

interface AdminPanelProps {
  bookings: Booking[];
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          b.guestName.toLowerCase().includes(searchLower) ||
          b.phone.includes(searchTerm) ||
          b.serialNumber.toString().includes(searchTerm) ||
          b.roomNumber.toString() === searchTerm || 
          b.receptionistName.toLowerCase().includes(searchLower) ||
          b.receptionistPhone.includes(searchTerm);
        
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.serialNumber - a.serialNumber);
  }, [bookings, searchTerm, filterStatus]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  }, [bookings]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Administration Database</h2>
          <p className="text-slate-500 text-sm">Managing records for Sri Venkateswara Lodge</p>
        </div>
        <button 
          onClick={onRefresh}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Online Data
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collections</p>
          <p className="text-xl font-black text-emerald-600">₹{totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
          <p className="text-xl font-black text-indigo-600">{bookings.filter(b => b.status === 'OPEN').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logs</p>
          <p className="text-xl font-black text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
          <p className="text-xl font-black text-amber-600">
            {bookings.length ? Math.round((bookings.filter(b => b.status === 'CLOSED').length / bookings.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Name, Phone, Room or Serial..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm outline-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">All Records</option>
            <option value="OPEN">Check-ins Only</option>
            <option value="CLOSED">Check-outs Only</option>
          </select>
        </div>

        {/* Mobile-Responsive List / Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Receipt #</th>
                <th className="px-6 py-4">Guest Information</th>
                <th className="px-6 py-4 text-center">Room</th>
                <th className="px-6 py-4">Receptionist Staff</th>
                <th className="px-6 py-4">Billing / Timing</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{b.serialNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900">{b.guestName}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{b.phone}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {b.aadhaar}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs">
                      {b.roomNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-black text-slate-700">{b.receptionistName}</div>
                    <div className="text-[9px] text-indigo-500 font-bold">{b.receptionistPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-400">IN: {new Date(b.checkInTime).toLocaleString([], {hour:'2-digit', minute:'2-digit', day:'numeric', month:'short'})}</div>
                    {b.paidAmount > 0 ? (
                      <div className="text-sm font-black text-emerald-600 mt-1">Paid: ₹{b.paidAmount}</div>
                    ) : (
                      <div className="text-[10px] font-black text-rose-500 mt-1 animate-pulse italic">STAYING</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      b.status === 'OPEN' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                    No results found for your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
