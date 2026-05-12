'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import { getMediaUrl } from '@/lib/utils/media';

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch instructor profile if user is an instructor (to get photoUrl)
  // Important: Only fetch when user is INSTRUCTOR, otherwise instructorProfile should be undefined
  const { data: instructorProfile } = useMyInstructorProfile({
    enabled: isAuthenticated && user?.role === 'INSTRUCTOR',
  });

  // Use instructor's photoUrl if available AND user is actually an instructor
  const avatarUrl = (user?.role === 'INSTRUCTOR' && instructorProfile?.photoUrl)
    ? getMediaUrl(instructorProfile.photoUrl) 
    : undefined;

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      setMobileMenuOpen(false);
      router.push('/');
    }
  };

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="relative rounded-full outline-none">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-700 hover:border-orange-500 transition-colors">
                <AvatarImage src={avatarUrl} alt={user.email} />
                <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 bg-slate-800 rounded-full p-0.5 border border-slate-700">
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" variant="bordered" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-slate-700">
                  <AvatarImage src={avatarUrl} alt={user.email} />
                  <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold text-sm">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem asChild className="cursor-pointer text-slate-200">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="text-slate-400" />
                <span>{t('dashboard')}</span>
              </Link>
            </DropdownMenuItem>

            {user.role === 'INSTRUCTOR' && (
              <DropdownMenuItem asChild className="cursor-pointer text-slate-200">
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="text-slate-400" />
                  <span>{t('editProfile')}</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-red-900/30! hover:text-red-300! focus:bg-red-900/30! focus:text-red-300!"
            >
              <LogOut className="text-red-400" />
              <span className="font-medium text-red-400">{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="relative rounded-full outline-none"
        >
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-700 active:border-orange-500 transition-colors">
            <AvatarImage src={avatarUrl} alt={user.email} />
            <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 bg-slate-800 rounded-full p-0.5 border border-slate-700">
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>
        </button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-3/4 bg-slate-900 border-l-2 border-slate-700 p-0">
            <SheetHeader className="border-b border-slate-700 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-slate-700">
                  <AvatarImage src={avatarUrl} alt={user.email} />
                  <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-left">
                  <SheetTitle className="text-base font-semibold text-slate-100 truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email.split('@')[0]}
                  </SheetTitle>
                  <p className="text-sm text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col justify-between h-[calc(100%-120px)]">
              <div className="flex flex-col p-4 space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate-400" />
                  <span className="font-medium">{t('dashboard')}</span>
                </Link>

                {user.role === 'INSTRUCTOR' && (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">{t('editProfile')}</span>
                  </Link>
                )}
              </div>

              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">{t('logout')}</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
