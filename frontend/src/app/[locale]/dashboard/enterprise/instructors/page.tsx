"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import {
  useEnterpriseInstructors,
  useSearchInstructors,
  useRemoveInstructor,
} from "@/hooks/useEnterpriseInstructors";
import { useSendInvitation } from "@/hooks/useEnterpriseInvitations";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  X,
  Trash2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { InstructorCard } from "@/components/ui/instructor-card";
import type {
  SearchInstructorResult,
  EnterpriseInstructorWithProfile,
} from "@/types/enterprise";

export default function EnterpriseInstructorsPage() {
  const t = useTranslations("Dashboard.enterprise");
  const { isChecking, user } = useAuthGuard({ requireAuth: true });
  const { data: profile, isLoading: profileLoading } = useMyEnterpriseProfile();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  const enterpriseId = profile?.id || "";
  const { data: instructors, isLoading: instructorsLoading } =
    useEnterpriseInstructors(enterpriseId);
  const { data: searchResults, isLoading: searchLoading } =
    useSearchInstructors(enterpriseId, searchQuery, undefined);

  const sendInvitation = useSendInvitation(enterpriseId);
  const removeInstructor = useRemoveInstructor(enterpriseId);

  if (isChecking || !user || profileLoading) {
    return <LoadingSpinner />;
  }

  if (user.role !== "ENTERPRISE") {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-400 text-lg">{t("noAccess")}</p>
      </div>
    );
  }

  const handleSendInvitation = async (instructorId: string) => {
    try {
      await sendInvitation.mutateAsync({ instructorId });
      toast.success(t("invitationSent"));
      setSearchQuery("");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(t("invitationFailed"), {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleRemoveInstructor = async (instructorId: string) => {
    try {
      await removeInstructor.mutateAsync(instructorId);
      toast.success(t("removeSuccess"));
      setRemoveConfirmId(null);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(t("removeFailed"), {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const activeInstructors = instructors?.filter(
    (inv) => inv.status === "ACCEPTED",
  );
  const pendingInstructors = instructors?.filter(
    (inv) => inv.status === "PENDING",
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("instructors")}
            </h1>
            <p className="text-slate-400 text-base">
              {t("instructorsDescription")}
            </p>
          </div>
        </div>

        {/* Search Instructors Panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                {t("inviteInstructor")}
              </h2>
            </div>
          </div>

          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchInstructors")}
              className="pl-10 h-11 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
              aria-label={t("searchInstructors")}
            />
          </div>

          <div
            aria-live="polite"
            aria-busy={searchLoading}
            role="region"
            aria-label={t("searchResults") || "Search results"}
          >
            {searchLoading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <ul className="space-y-2 max-h-64 overflow-y-auto" role="list">
                {(searchResults as SearchInstructorResult[]).map(
                  (instructor) => (
                    <li key={instructor.id} role="listitem">
                      <InstructorCard
                        instructor={{
                          username: instructor.user?.username || "",
                          firstName: instructor.user?.firstName,
                          lastName: instructor.user?.lastName,
                          photoUrl: instructor.photoUrl,
                          avatarUrl: instructor.user?.avatarUrl,
                          specializations: instructor.specializationSlugs,
                          tagline: instructor.tagline,
                          city: instructor.city,
                        }}
                        hoverColor="emerald"
                        action={
                          <Button
                            onClick={() => handleSendInvitation(instructor.id)}
                            disabled={sendInvitation.isPending}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            aria-label={`${t("sendInvitation")} ${instructor.user?.firstName || ""} ${instructor.user?.lastName || ""}`}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            {t("sendInvitation")}
                          </Button>
                        }
                      />
                    </li>
                  ),
                )}
              </ul>
            )}

            {searchQuery.length >= 2 &&
              searchResults &&
              searchResults.length === 0 &&
              !searchLoading && (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle
                    className="w-8 h-8 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p>{t("noResults") || "No instructors found"}</p>
                </div>
              )}

            {searchQuery.length < 2 && (
              <p className="text-sm text-slate-400 text-center py-4">
                {t("searchMinChars") || "Type at least 2 characters to search"}
              </p>
            )}
          </div>
        </motion.div>

        {/* Active Instructors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {t("activeInstructors")}
              <span className="text-sm font-normal text-slate-400 ml-2">
                ({activeInstructors?.length || 0})
              </span>
            </h2>
          </div>

          {instructorsLoading ? (
            <LoadingSpinner />
          ) : activeInstructors && activeInstructors.length > 0 ? (
            <ul className="space-y-2" role="list">
              {(activeInstructors as EnterpriseInstructorWithProfile[]).map(
                (inv) => (
                  <li key={inv.id} role="listitem">
                    <InstructorCard
                      instructor={{
                        username: inv.instructor?.user?.username || "",
                        firstName: inv.instructor?.user?.firstName,
                        lastName: inv.instructor?.user?.lastName,
                        photoUrl: inv.instructor?.photoUrl,
                        avatarUrl: inv.instructor?.user?.avatarUrl,
                        specializations: inv.instructor?.specializations,
                        tagline: inv.instructor?.tagline,
                        city: inv.instructor?.city,
                      }}
                      hoverColor="emerald"
                      action={
                        removeConfirmId === inv.instructorId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400">
                              {t("confirmRemoveInstructor")}
                            </span>
                            <Button
                              onClick={() =>
                                handleRemoveInstructor(inv.instructorId)
                              }
                              disabled={removeInstructor.isPending}
                              size="sm"
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              {t("removeInstructor")}
                            </Button>
                            <Button
                              onClick={() => setRemoveConfirmId(null)}
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              {t("cancel") || "Cancel"}
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRemoveConfirmId(inv.instructorId)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            aria-label={`${t("removeInstructor")} ${inv.instructor?.user?.firstName || ""} ${inv.instructor?.user?.lastName || ""}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )
                      }
                    />
                  </li>
                ),
              )}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Users
                className="w-12 h-12 text-slate-600 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-slate-300 mb-2">{t("noInstructorsYet")}</p>
              <p className="text-sm text-slate-400 mb-4">
                {t("noInstructorsDescription")}
              </p>
            </div>
          )}
        </motion.div>

        {/* Pending Invitations */}
        {pendingInstructors && pendingInstructors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {t("pendingInvitations")}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({pendingInstructors.length})
                </span>
              </h2>
            </div>

            <ul className="space-y-2" role="list">
              {(pendingInstructors as EnterpriseInstructorWithProfile[]).map(
                (inv) => (
                  <li key={inv.id} role="listitem">
                    <InstructorCard
                      instructor={{
                        username: inv.instructor?.user?.username || "",
                        firstName: inv.instructor?.user?.firstName,
                        lastName: inv.instructor?.user?.lastName,
                        photoUrl: inv.instructor?.photoUrl,
                        avatarUrl: inv.instructor?.user?.avatarUrl,
                        specializations: inv.instructor?.specializations,
                        tagline: inv.instructor?.tagline,
                        city: inv.instructor?.city,
                      }}
                      hoverColor="emerald"
                      action={
                        <Button
                          onClick={() =>
                            handleRemoveInstructor(inv.instructorId)
                          }
                          disabled={removeInstructor.isPending}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          aria-label={`${t("cancelInvitation") || "Cancel"} ${inv.instructor?.user?.firstName || ""} ${inv.instructor?.user?.lastName || ""}`}
                        >
                          <X className="w-4 h-4 mr-1" aria-hidden="true" />
                          {t("cancelInvitation") || "Cancel"}
                        </Button>
                      }
                    />
                  </li>
                ),
              )}
            </ul>
          </motion.div>
        )}
      </div>

      <BottomNavBar
        backText={t("backToDashboard") || "Back to Dashboard"}
        backHref="/dashboard"
      />
    </div>
  );
}
