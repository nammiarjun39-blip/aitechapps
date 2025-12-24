
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED'
}

export interface Room {
  number: number;
  status: RoomStatus;
}

export interface Booking {
  id: string;
  serialNumber: number;
  roomNumber: number;
  guestName: string;
  phone: string;
  aadhaar: string;
  address: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'OPEN' | 'CLOSED';
  paidAmount: number;
  receptionistName: string;
  receptionistPhone: string;
}

export type UserRole = 'ADMIN' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}
