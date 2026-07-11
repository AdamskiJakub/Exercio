import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2 } from "lucide-react";

interface EnterpriseProfileBasicInfoProps {
  companyName: string;
  shortDescription: string;
  description: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function EnterpriseProfileBasicInfo({
  companyName,
  shortDescription,
  description,
  onChange,
}: EnterpriseProfileBasicInfoProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Building2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("companyInfo")}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-base font-medium">
            {t("companyName")}
          </Label>
          <Input
            type="text"
            name="companyName"
            id="companyName"
            value={companyName}
            onChange={onChange}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription" className="text-base font-medium">
            {t("shortDescription") || "Short Description"}
          </Label>
          <Input
            type="text"
            name="shortDescription"
            id="shortDescription"
            value={shortDescription}
            onChange={onChange}
            className="h-11"
            placeholder={
              t("shortDescriptionPlaceholder") ||
              "Brief tagline for your company"
            }
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="description" className="text-base font-medium">
          {t("description")}
        </Label>
        <Textarea
          name="description"
          id="description"
          value={description}
          onChange={onChange}
          className="min-h-30"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>
    </div>
  );
}
