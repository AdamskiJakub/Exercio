"use client";

import { useTranslations } from "next-intl";
import { Users, UserPlus } from "lucide-react";
import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseInstructorWithProfile } from "@/types/enterprise";

interface EnterpriseInstructorListProps {
  instructors: EnterpriseInstructorWithProfile[];
}

export function EnterpriseInstructorList({
  instructors,
}: EnterpriseInstructorListProps) {
  const t = useTranslations("Dashboard.enterprise");

  if (instructors.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-300 mb-2">{t("noInstructorsYet")}</p>
        <p className="text-sm text-slate-400 mb-4">
          {t("noInstructorsDescription")}
        </p>
        <Link
          href="/dashboard/enterprise/instructors"
          className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {t("inviteInstructor")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {instructors.slice(0, 5).map((inv: EnterpriseInstructorWithProfile) => (
        <NextLink
          key={inv.id}
          href={`/instructors/${inv.instructor?.user?.username}`}
          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {getMediaUrl(
              inv.instructor?.photoUrl || inv.instructor?.user?.avatarUrl,
            ) ? (
              <img
                src={getMediaUrl(
                  inv.instructor?.photoUrl || inv.instructor?.user?.avatarUrl,
                )}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-slate-300">
                {inv.instructor?.user?.firstName?.[0] || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-200">
                {inv.instructor?.user?.firstName}{" "}
                {inv.instructor?.user?.lastName}
              </p>
              {inv.status !== "ACCEPTED" && (
                <p className="text-xs text-slate-400">
                  {t("pendingInvitations")}
                </p>
              )}
            </div>
          </div>
        </NextLink>
      ))}
      <Link
        href="/dashboard/enterprise/instructors"
        className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
      >
        {t("manageInstructors")} →
      </Link>
    </div>
  );
}
