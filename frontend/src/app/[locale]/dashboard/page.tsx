'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from 'next-intl';
import { InstructorDashboard } from '@/components/dashboard/InstructorDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const { isChecking, user } = useAuthGuard({
    requireAuth: true,
  });

  if (isChecking || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Role-based Dashboard */}
        {user.role === 'INSTRUCTOR' ? (
          <InstructorDashboard />
        ) : (
          <ClientDashboard />
        )}
      </div>
    </div>
  );
}
