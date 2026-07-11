"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <section className="space-y-6" aria-labelledby="instructors-heading">
      <div className="flex items-center justify-between">
        <h2
          id="instructors-heading"
          className="text-2xl font-bold text-white flex items-center gap-2"
        >
          <Users className="w-6 h-6 text-emerald-500" aria-hidden="true" />
          {t("ourInstructors")}
          <span className="text-base font-normal text-slate-400">
            ({instructors.length})
          </span>
        </h2>
      </div>

      {/* Responsive grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
      >
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
              className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
              role="listitem"
            >
              <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden h-full">
                <div className="p-5 flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 border-2 border-slate-700 group-hover:border-emerald-500 transition-colors mb-3">
                    <AvatarImage
                      src={getMediaUrl(instructor.photoUrl)}
                      alt={fullName}
                    />
                    <AvatarFallback className="bg-slate-800 text-white text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <p className="text-white font-semibold group-hover:text-emerald-500 transition-colors truncate max-w-full">
                    {fullName}
                  </p>
                  {instructor.tagline && (
                    <p className="text-xs text-slate-400 truncate max-w-full mt-0.5">
                      {instructor.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    {instructor.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {instructor.city}
                      </span>
                    )}
                    {instructor.verified && (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-500 text-[10px] px-1.5 py-0"
                      >
                        ✓
                      </Badge>
                    )}
                  </div>

                  {member.role && (
                    <div className="mt-3 pt-3 border-t border-slate-800 w-full">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        {member.role}
                      </span>
                    </div>
                  )}

                  {/* View profile button — emerald filled */}
                  <div className="mt-4 w-full">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-sm">
                      {t("viewProfile")}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
