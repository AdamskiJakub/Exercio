import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface BookingUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface InstructorProfile {
  id: string;
  sessionDuration: number;
  sessionPrice: number;
}

export interface InstructorUser extends BookingUser {
  instructorProfile: InstructorProfile | null;
}

export interface Booking {
  id: string;
  instructorId: string;
  clientId: string | null;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  client: BookingUser | null;
  instructorUser: InstructorUser;
}

export function useMyBookings(role: 'client' | 'instructor') {
  return useQuery({
    queryKey: ['bookings', 'my', role],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(`/bookings/my?role=${role}`);
      return response.data;
    },
  });
}
