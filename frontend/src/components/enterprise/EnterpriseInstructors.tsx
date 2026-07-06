"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Users } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseInstructorWithProfile } from "@/types/enterprise";

interface EnterpriseInstructorsProps {
  instructors: EnterpriseInstructorWithProfile[];
}

export function EnterpriseInstructors({
  instructors,
}: EnterpriseInstructorsProps) {
  const t = useTranslations("EnterpriseProfile");
  const locale = useLocale();

  if (!instructors || instructors.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Users className="w-6 h-6 text-orange-500" />
        {t("ourInstructors")}
        <span className="text-base font-normal text-slate-400">
          ({instructors.length})
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((member) => {
          const { instructor } = member;
          const fullName =
            `${instructor.user.firstName || ""} ${instructor.user.lastName || ""}`.trim() ||
            instructor.user.username;
          const initials = fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <Link
              key={member.id}
              href={`/${locale}/instructors/${instructor.user.username}`}
              className="block group"
            >
              <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all duration-300 p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-slate-700 group-hover:border-orange-500 transition-colors">
                    <AvatarImage
                      src={getMediaUrl(instructor.photoUrl)}
                      alt={fullName}
                    />
                    <AvatarFallback className="bg-slate-800 text-white text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold group-hover:text-orange-500 transition-colors truncate">
                      {fullName}
                    </p>
                    {instructor.tagline && (
                      <p className="text-xs text-slate-400 truncate">
                        {instructor.tagline}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      {instructor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {instructor.city}
                        </span>
                      )}
                      {instructor.verified && (
                        <Badge
                          variant="outline"
                          className="border-orange-500/30 text-orange-500 text-[10px] px-1.5 py-0"
                        >
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {member.role && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {member.role}
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
