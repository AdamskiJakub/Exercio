import { getMediaUrl } from "@/lib/utils/media";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<
  AvatarSize,
  { container: string; img: string; initials: string }
> = {
  sm: {
    container:
      "w-10 h-10 rounded-full overflow-hidden bg-slate-600 shrink-0 border border-slate-600",
    img: "w-full h-full object-cover",
    initials:
      "w-full h-full flex items-center justify-center text-sm text-slate-300 font-medium",
  },
  md: {
    container:
      "size-14 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-slate-600",
    img: "w-full h-full object-cover",
    initials:
      "w-full h-full flex items-center justify-center text-white font-bold text-lg bg-slate-700",
  },
  lg: {
    container:
      "w-16 h-16 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-slate-600",
    img: "w-full h-full object-cover",
    initials:
      "w-full h-full flex items-center justify-center text-white font-bold text-xl bg-slate-700",
  },
};

interface UserAvatarProps {
  photoUrl?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: AvatarSize;
  alt?: string;
}

export function UserAvatar({
  photoUrl,
  avatarUrl,
  firstName,
  lastName,
  size = "sm",
  alt,
}: UserAvatarProps) {
  const src = getMediaUrl(photoUrl || avatarUrl);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const altText = alt || fullName || "User avatar";

  return (
    <div className={sizeClasses[size].container}>
      {src ? (
        <img src={src} alt={altText} className={sizeClasses[size].img} />
      ) : (
        <div className={sizeClasses[size].initials} aria-hidden="true">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}
