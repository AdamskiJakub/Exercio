import { EnterpriseApplyPage } from "@/components/enterprise/EnterpriseApplyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zostań Partnerem Założycielskim — Exercio",
  description:
    "Dołącz do grona pierwszych Partnerów Exercio. Rozwijaj swoją firmę razem z nami — zyskaj obecność w rozwijającym się marketplace sportowym.",
};

export default function ApplyPage() {
  return <EnterpriseApplyPage />;
}
