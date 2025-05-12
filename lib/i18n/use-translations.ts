"use client"

import { useState, useEffect } from "react"
import { type Locale, getTranslations, type Translations } from "./translations"

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>("en")
  const [translations, setTranslations] = useState<Translations>(getTranslations(locale))
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr")

  useEffect(() => {
    const newTranslations = getTranslations(locale)
    setTranslations(newTranslations)
    setDir(locale === "ar" ? "rtl" : "ltr")

    // Update document direction
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = locale
  }, [locale])

  const toggleLocale = () => {
    setLocale(locale === "en" ? "ar" : "en")
  }

  return {
    locale,
    setLocale,
    translations,
    dir,
    toggleLocale,
  }
}
