"use client"

import { useState, useEffect } from "react"
import { type Language, translations, type TranslationKey, getDirection } from "@/lib/i18n"

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("en")

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)

    // Update document direction
    document.documentElement.dir = getDirection(newLanguage)
    document.documentElement.lang = newLanguage
  }

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  // Get current direction
  const dir = getDirection(language)

  return {
    language,
    changeLanguage,
    t,
    dir,
  }
}
