"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

export function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("en")}
        className="w-12"
      >
        EN
      </Button>
      <Button
        variant={language === "ar" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("ar")}
        className="w-12"
      >
        AR
      </Button>
    </div>
  )
}
