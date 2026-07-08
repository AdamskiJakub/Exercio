import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Globe, MapPin, Link as LinkIcon } from "lucide-react";

interface EnterpriseProfileContactProps {
  email: string;
  phone: string;
  website: string;
  city: string;
  address: string;
  postalCode: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function EnterpriseProfileContact({
  email,
  phone,
  website,
  city,
  address,
  postalCode,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  onChange,
}: EnterpriseProfileContactProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div>
      {/* Contact Info */}
      <div className="flex items-center gap-3 mb-2 pt-4 border-t border-slate-700">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Phone className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("contactInfo") || "Contact Info"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            {t("email") || "Email"}
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium">
            {t("phone")}
          </Label>
          <Input
            type="tel"
            name="phone"
            id="phone"
            value={phone}
            onChange={onChange}
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="website" className="text-base font-medium">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              {t("website")}
            </div>
          </Label>
          <Input
            type="text"
            inputMode="url"
            name="website"
            id="website"
            value={website}
            onChange={onChange}
            className="h-11"
            placeholder={t("websitePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
              {t("city")}
            </div>
          </Label>
          <Input
            type="text"
            name="city"
            id="city"
            value={city}
            onChange={onChange}
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-base font-medium">
            {t("address") || "Address"}
          </Label>
          <Input
            type="text"
            name="address"
            id="address"
            value={address}
            onChange={onChange}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-base font-medium">
            {t("postalCode") || "Postal Code"}
          </Label>
          <Input
            type="text"
            name="postalCode"
            id="postalCode"
            value={postalCode}
            onChange={onChange}
            className="h-11"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3 mb-2 pt-4 border-t border-slate-700">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <LinkIcon className="w-5 h-5 text-purple-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("socialLinks") || "Social Links"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facebookUrl" className="text-base font-medium">
            Facebook
          </Label>
          <Input
            type="text"
            inputMode="url"
            name="facebookUrl"
            id="facebookUrl"
            value={facebookUrl}
            onChange={onChange}
            className="h-11"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagramUrl" className="text-base font-medium">
            Instagram
          </Label>
          <Input
            type="text"
            inputMode="url"
            name="instagramUrl"
            id="instagramUrl"
            value={instagramUrl}
            onChange={onChange}
            className="h-11"
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl" className="text-base font-medium">
            YouTube
          </Label>
          <Input
            type="text"
            inputMode="url"
            name="youtubeUrl"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={onChange}
            className="h-11"
            placeholder="https://youtube.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktokUrl" className="text-base font-medium">
            TikTok
          </Label>
          <Input
            type="text"
            inputMode="url"
            name="tiktokUrl"
            id="tiktokUrl"
            value={tiktokUrl}
            onChange={onChange}
            className="h-11"
            placeholder="https://tiktok.com/..."
          />
        </div>
      </div>
    </div>
  );
}
