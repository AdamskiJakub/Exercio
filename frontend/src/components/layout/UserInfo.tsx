"use client";

interface UserInfoProps {
  firstName: string | null;
  lastName: string | null;
  email: string;
  className?: string;
}

export function UserInfo({
  firstName,
  lastName,
  email,
  className = "",
}: UserInfoProps) {
  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : email.split("@")[0];

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      <p className="text-sm font-semibold text-slate-100 truncate">
        {displayName}
      </p>
      <p className="text-xs text-slate-400 truncate">{email}</p>
    </div>
  );
}
