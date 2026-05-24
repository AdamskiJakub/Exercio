'use client';

import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface PendingBookingsCountProps {
  className?: string;
}

export function PendingBookingsCount({ className }: PendingBookingsCountProps) {
  const { isAuthenticated, user } = useAuthStore();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', 'my', 'instructor'],
    queryFn: async () => {
      const response = await apiClient.get('/bookings/my?role=instructor');
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'INSTRUCTOR',
  });

  const pendingCount = bookings?.filter((b: any) => b.status === 'PENDING').length || 0;

  if (!isAuthenticated || user?.role !== 'INSTRUCTOR' || pendingCount === 0) return null;

  return (
    <div className={cn('relative inline-flex', className)}>
      <Bell className="size-5 text-orange-500 animate-pulse" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {pendingCount > 9 ? '9+' : pendingCount}
      </span>
    </div>
  );
}
