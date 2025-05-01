"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import type { Locale } from "@/lib/i18n/translations"

interface LanguageToggleProps {
  locale: Locale
  toggleLocale: () => void
}

export function LanguageToggle({ locale, toggleLocale }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="text-white border-slate-600"
      title={locale === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <Languages className="h-4 w-4 mr-2" />
      {locale === "en" ? "العربية" : "English"}
    </Button>
  )
}
