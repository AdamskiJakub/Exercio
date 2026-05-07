'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AvailabilityManager } from '@/components/availability/availability-manager';

export default function AvailabilityPage() {
  const { isChecking, user } = useAuthGuard({
    requireAuth: true,
    requireRole: 'INSTRUCTOR',
  });

  if (isChecking || !user) {
    return <LoadingSpinner />;
  }

  return <AvailabilityManager />;
}
