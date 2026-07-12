"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface LegalCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}

export function LegalCheckbox({
  checked,
  onChange,
  error,
  id = "agreeToTerms",
}: LegalCheckboxProps) {
  const t = useTranslations("Legal");

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-0 cursor-pointer accent-orange-500"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-label={`${t("agreeToTerms")} ${t("termsShort")} & ${t("privacyShort")}`}
        />
        <label
          htmlFor={id}
          className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none"
        >
          {t("agreeToTerms")}{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 underline underline-offset-2 transition-colors"
            aria-label={t("termsShort")}
          >
            {t("termsShort")}
          </Link>
          {" & "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 underline underline-offset-2 transition-colors"
            aria-label={t("privacyShort")}
          >
            {t("privacyShort")}
          </Link>
        </label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-500 ml-7"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
