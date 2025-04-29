import { en } from "./translations/en"
import { ar } from "./translations/ar"

export type Language = "en" | "ar"

export const translations = {
  en,
  ar,
}

export type TranslationKey = keyof typeof en

export function getDirection(lang: Language): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr"
}
