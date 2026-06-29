"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UserMenu } from "./user-menu";
import { useAuthStore } from "@/stores/auth-store";
import { DumbbellIcon, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const t = useTranslations("Common");
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="border-b border-slate-800 bg-slate-900 backdrop-blur-md sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label={t("homeAriaLabel")}
          >
            <DumbbellIcon
              className="w-8 h-8 text-orange-500"
              aria-hidden="true"
            />
            <span className="text-3xl font-bold bg-linear-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Trainly
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                {/* Desktop: Login/Register buttons */}
                <div className="hidden lg:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-6 py-6"
                    asChild
                    aria-label={t("login")}
                  >
                    <Link href="/login">{t("login")}</Link>
                  </Button>

                  <Button
                    size="lg"
                    className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-base px-8 py-6 font-semibold"
                    asChild
                    aria-label={t("register")}
                  >
                    <Link href="/register">{t("register")}</Link>
                  </Button>
                </div>

                {/* Mobile: Hamburger menu */}
                <div className="lg:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                        aria-label={t("menu")}
                      >
                        {mobileMenuOpen ? (
                          <X className="size-6" />
                        ) : (
                          <Menu className="size-6" />
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-72 bg-slate-900 border-slate-800 p-0"
                    >
                      <SheetHeader className="border-b border-slate-800 p-6">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                          <DumbbellIcon className="size-5 text-orange-500" />
                          Trainly
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex flex-col gap-3 p-6">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-base py-6"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/login">{t("login")}</Link>
                        </Button>

                        <Button
                          size="lg"
                          className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-base py-6 font-semibold"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/register">{t("register")}</Link>
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
