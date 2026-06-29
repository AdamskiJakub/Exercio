"use client";

import { useLocale, useTranslations } from "next-intl";
import { Award, Target, Languages as LanguagesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useSpecializations,
  useTags,
  useGoals,
  getSpecializationName,
  getTagName,
  getGoalName,
} from "@/hooks/useConfig";
import type { InstructorProfile } from "@/types";

interface AboutSectionProps {
  profile: InstructorProfile;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const locale = useLocale();
  const t = useTranslations("InstructorProfile");
  const { specializations } = useSpecializations();
  const { tags } = useTags();
  const { goals } = useGoals();

  const hasBio = !!profile.bio;
  const hasSpecializations =
    profile.specializations && profile.specializations.length > 0;
  const hasGoals = profile.goals && profile.goals.length > 0;
  const hasLanguages = profile.languages && profile.languages.length > 0;
  const hasTags = profile.tags && profile.tags.length > 0;

  if (!hasBio && !hasSpecializations && !hasGoals && !hasLanguages && !hasTags)
    return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Award className="size-5 text-orange-500" />
        {t("aboutMe")}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Bio */}
        {hasBio && (
          <div>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* RIGHT: Professional Info */}
        <div className="space-y-6">
          {/* Specializations */}
          {hasSpecializations && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                {t("specializations")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((specId) => {
                  const spec = specializations.find((s) => s.id === specId);
                  return spec ? (
                    <Badge
                      key={specId}
                      variant="secondary"
                      className="bg-slate-700 text-slate-200"
                    >
                      {getSpecializationName(spec, locale)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Goals */}
          {hasGoals && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {t("iHelpYouAchieve")}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goalId) => {
                  const goal = goals.find((g) => g.id === goalId);
                  return goal ? (
                    <Badge
                      key={goalId}
                      variant="outline"
                      className="border-orange-500/50 text-orange-400"
                    >
                      {goal.icon} {getGoalName(goal, locale)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {hasLanguages && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LanguagesIcon className="size-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {t("languages")}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="bg-slate-700 text-slate-200"
                  >
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {hasTags && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                {t("skillsExpertise")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <Badge
                      key={tagId}
                      variant="outline"
                      className="border-slate-600 text-slate-300 text-xs"
                    >
                      {getTagName(tag, locale)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
