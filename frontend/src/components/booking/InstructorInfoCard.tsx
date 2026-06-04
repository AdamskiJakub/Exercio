'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { getFullName, getPhotoUrl } from '@/lib/utils/user';

interface InstructorInfoCardProps {
  instructor: {
    photoUrl?: string | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      username?: string;
    };
  };
  label?: string;
  className?: string;
}

export function InstructorInfoCard({ 
  instructor, 
  label,
  className = '' 
}: InstructorInfoCardProps) {
  const fullName = getFullName(instructor.user, 'Instructor');
  const photoUrl = getPhotoUrl(instructor.photoUrl);

  return (
    <div className={`flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl group cursor-pointer hover:bg-slate-800 transition-colors ${className}`}>
      <div className="relative size-20 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-slate-600 group-hover:border-orange-500 transition-colors">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={fullName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-2xl font-bold text-slate-400">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        {label && <p className="text-sm text-slate-400">{label}</p>}
        <p className="text-lg font-semibold text-white group-hover:text-orange-500 transition-colors">
          {fullName}
        </p>
      </div>
    </div>
  );
}
