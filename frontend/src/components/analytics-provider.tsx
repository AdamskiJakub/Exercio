"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { isCategoryAllowed } from "@/lib/utils/cookie-consent";

const GA_ID = "G-F444KP0X1W";

export function AnalyticsProvider() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Check consent on mount
    setConsented(isCategoryAllowed("analytics"));

    // Listen for consent changes in the same tab (dispatched by saveCookieConsent)
    const handleConsentChange = () =>
      setConsented(isCategoryAllowed("analytics"));
    window.addEventListener("cookie-consent-change", handleConsentChange);
    return () =>
      window.removeEventListener("cookie-consent-change", handleConsentChange);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
