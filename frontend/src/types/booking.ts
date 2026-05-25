export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isShortNotice: boolean;
  isException?: boolean;
  available: boolean;
  booking?: {
    id: string;
    status: string;
    notes?: string;
    clientName: string;
    clientEmail?: string;
    cancellationReason?: string;
    cancelledBy?: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  datetime: Date;
  isException?: boolean;
  booking?: {
    id: string;
    status: string;
    notes?: string;
    clientName: string;
    clientEmail?: string;
    cancellationReason?: string;
    cancelledBy?: string;
  };
}

export interface DaySlots {
  date: Date;
  slots: TimeSlot[];
  hasException?: boolean;
}

export interface Booking {
  id: string;
  clientId?: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  duration?: number;
  price?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
  isShortNotice: boolean;
  notes?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
