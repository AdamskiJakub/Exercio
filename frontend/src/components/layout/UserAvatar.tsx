"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";

function getInitials(
  firstName: string | null,
  lastName: string | null,
): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "?";
}

interface UserAvatarProps {
  src?: string;
  alt: string;
  firstName: string | null;
  lastName: string | null;
  size?: "sm" | "md" | "lg";
  showChevron?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const fallbackSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function UserAvatar({
  src,
  alt,
  firstName,
  lastName,
  size = "md",
  showChevron = false,
  className = "",
}: UserAvatarProps) {
  return (
    <div className={`relative inline-flex ${className}`}>
      <Avatar
        className={`${sizeClasses[size]} cursor-pointer border-2 border-slate-700 hover:border-orange-500 transition-colors`}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback
          className={`bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold ${fallbackSizeClasses[size]}`}
        >
          {getInitials(firstName, lastName)}
        </AvatarFallback>
      </Avatar>
      {showChevron && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-slate-800 rounded-full p-0.5 border border-slate-700">
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>
      )}
    </div>
  );
}
