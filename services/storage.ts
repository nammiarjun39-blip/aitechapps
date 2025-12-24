
import { Booking, Room, RoomStatus, User } from '../types';

const STORAGE_KEYS = {
  BOOKINGS: 'sv_lodge_bookings',
  ROOMS: 'sv_lodge_rooms',
  SERIAL_COUNTER: 'sv_lodge_serial_counter',
  AUTH_USER: 'sv_lodge_auth_user'
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHohMkKknIDF0QUQeW8lgVDLQ0uyH--FY_v6Hkoiv5aJ8uyv9dlAc8DmCZD1XXPEYl/exec';

export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    const initialRooms: Room[] = Array.from({ length: 30 }, (_, i) => ({
      number: i + 1,
      status: RoomStatus.AVAILABLE
    }));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(initialRooms));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER)) {
    localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, '1');
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
};

/**
 * Cloud Data Read Management
 * Fetches latest records from Google Sheets to ensure local data matches the cloud.
 */
export const fetchFromCloud = async (): Promise<boolean> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    // Support both direct array or wrapped object structure
    const bookings: Booking[] = Array.isArray(data) ? data : (data.bookings || []);
    
    if (bookings) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      
      // Update room statuses based on cloud data
      const rooms: Room[] = Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        status: RoomStatus.AVAILABLE
      }));
      
      bookings.forEach((b: Booking) => {
        if (b.status === 'OPEN') {
          const idx = b.roomNumber - 1;
          if (rooms[idx]) rooms[idx].status = RoomStatus.OCCUPIED;
        }
      });
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      
      // Set serial counter to highest + 1 to prevent collisions
      const maxSerial = Math.max(...bookings.map((b: any) => parseInt(b.serialNumber) || 0), 0);
      localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, (maxSerial + 1).toString());
      
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Sync Read failed (likely CORS or Script error), using local persistent data:', error);
    return false;
  }
};

/**
 * Cloud Data Write Management
 * Pushes updates to Google Sheets for permanent storage.
 */
export const syncToCloud = async (booking: Booking) => {
  try {
    // We send the full booking object. The script should handle appending/updating.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
  } catch (error) {
    console.error('Cloud write failed:', error);
  }
};

export const getRooms = (): Room[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
};

export const getBookings = (): Booking[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
};

export const getNextSerialNumber = (): number => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER) || '1');
  localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, (current + 1).toString());
  return current;
};

export const saveBooking = async (booking: Booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  
  const rooms = getRooms();
  const roomIdx = rooms.findIndex(r => r.number === booking.roomNumber);
  if (roomIdx !== -1) {
    rooms[roomIdx].status = RoomStatus.OCCUPIED;
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }

  await syncToCloud(booking);
};

export const closeBooking = async (bookingId: string, paidAmount: number) => {
  const bookings = getBookings();
  const rooms = getRooms();
  
  const bookingIdx = bookings.findIndex(b => b.id === bookingId);
  if (bookingIdx !== -1) {
    const booking = bookings[bookingIdx];
    booking.status = 'CLOSED';
    booking.checkOutTime = new Date().toISOString();
    booking.paidAmount = paidAmount;
    
    const roomIdx = rooms.findIndex(r => r.number === booking.roomNumber);
    if (roomIdx !== -1) {
      rooms[roomIdx].status = RoomStatus.AVAILABLE;
    }
    
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

    await syncToCloud(booking);
  }
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  return user ? JSON.parse(user) : null;
};

export const login = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
};
