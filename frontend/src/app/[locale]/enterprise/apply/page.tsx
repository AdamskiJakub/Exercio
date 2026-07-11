import { EnterpriseApplyPage } from "@/components/enterprise/EnterpriseApplyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dołącz jako Partner — Exercio",
  description:
    "Zarejestruj swoją szkołę tańca, studio fitness lub klub sportowy na Exercio i zyskaj dostęp do bazy instruktorów.",
};

export default function ApplyPage() {
  return <EnterpriseApplyPage />;
}
