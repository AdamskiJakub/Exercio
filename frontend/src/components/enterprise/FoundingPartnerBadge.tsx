"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Gem, Shield, Users, Map } from "lucide-react";

interface FoundingPartnerBadgeProps {
  variant: "card" | "profile";
}

const variantStyles = {
  card: "inline-flex items-center gap-1 px-2 py-0.5 text-xs",
  profile:
    "inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm shadow-sm",
} as const;

export function FoundingPartnerBadge({ variant }: FoundingPartnerBadgeProps) {
  const t = useTranslations("EnterpriseProfile");
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={t("foundingPartnerTooltip")}
        className={`${variantStyles[variant]} bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full font-medium text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all cursor-pointer`}
        title={t("foundingPartnerTooltip")}
      >
        <span>{t("foundingPartnerBadge")}</span>
      </button>
      <FoundingPartnerModal
        open={showModal}
        onOpenChange={setShowModal}
        t={t}
      />
    </>
  );
}

function FoundingPartnerModal({
  open,
  onOpenChange,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: (key: string) => string;
}) {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-slate-900 border border-amber-500/30 text-slate-100 max-w-md cursor-default"
        onClick={handleContentClick}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-300 text-lg">
            <span className="text-amber-400" aria-hidden="true">
              ◆
            </span>
            {t("foundingPartnerModalTitle")}
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm leading-relaxed mt-2">
            {t("foundingPartnerModalDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <h4 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t("foundingPartnerBenefits")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Gem
                  className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{t("foundingPartnerBenefit1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield
                  className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{t("foundingPartnerBenefit2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Users
                  className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{t("foundingPartnerBenefit3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Map
                  className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{t("foundingPartnerBenefit4")}</span>
              </li>
            </ul>
          </div>
        </div>

        <Button
          variant="gold"
          className="w-full mt-2 cursor-pointer"
          onClick={() => onOpenChange(false)}
          aria-label={t("close")}
        >
          {t("close")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
