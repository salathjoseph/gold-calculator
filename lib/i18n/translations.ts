export type Locale = "en" | "ar"

export interface Translations {
  title: string
  lastUpdated: string
  refreshPrices: string
  updating: string
  exchangeRates: string
  usdToSar: string
  usdToEgp: string
  currency: string
  egyptGoldRates: string
  internationalGoldRates: string
  buy: string
  sell: string
  desiredWeight: string
  type: string
  buyPricePerGram: string
  sellPricePerGram: string
  totalBuy: string
  totalSell: string
  enterWeight: string
  grams: string
  total: string
  avgBuy: string
  avgSell: string
  summary: string
  totalWeight: string
  totalBuyValue: string
  totalSellValue: string
  help: {
    title: string
    karatPurity: string
    karatPurityDesc: string
    buyPrice: string
    buyPriceDesc: string
    sellPrice: string
    sellPriceDesc: string
    exchangeRates: string
    exchangeRatesDesc: string
  }
  error: string
  never: string
}

export const en: Translations = {
  title: "Gold Calculator",
  lastUpdated: "Last updated",
  refreshPrices: "Refresh Prices",
  updating: "Updating...",
  exchangeRates: "Exchange Rates",
  usdToSar: "USD to SAR",
  usdToEgp: "USD to EGP",
  currency: "Currency",
  egyptGoldRates: "Egypt Gold Rates",
  internationalGoldRates: "International Gold Rates",
  buy: "Buy",
  sell: "Sell",
  desiredWeight: "Desired Weight",
  type: "Type",
  buyPricePerGram: "Buy Price/Gram",
  sellPricePerGram: "Sell Price/Gram",
  totalBuy: "Total Buy",
  totalSell: "Total Sell",
  enterWeight: "Enter weight",
  grams: "grams",
  total: "Total",
  avgBuy: "Avg Buy",
  avgSell: "Avg Sell",
  summary: "Summary",
  totalWeight: "Total Weight",
  totalBuyValue: "Total Buy Value",
  totalSellValue: "Total Sell Value",
  help: {
    title: "Gold Calculator Help",
    karatPurity: "Karat Purity",
    karatPurityDesc: "Higher karat means higher gold content (24K is pure gold)",
    buyPrice: "Buy Price",
    buyPriceDesc: "The price at which you can buy gold",
    sellPrice: "Sell Price",
    sellPriceDesc: "The price at which you can sell gold",
    exchangeRates: "Exchange Rates",
    exchangeRatesDesc: "Affects prices when viewing in different currencies",
  },
  error: "Failed to fetch latest gold prices. Please try again later.",
  never: "Never",
}

export const ar: Translations = {
  title: "حاسبة الذهب",
  lastUpdated: "آخر تحديث",
  refreshPrices: "تحديث الأسعار",
  updating: "جاري التحديث...",
  exchangeRates: "أسعار الصرف",
  usdToSar: "دولار إلى ريال",
  usdToEgp: "دولار إلى جنيه",
  currency: "العملة",
  egyptGoldRates: "أسعار الذهب في مصر",
  internationalGoldRates: "أسعار الذهب العالمية",
  buy: "شراء",
  sell: "بيع",
  desiredWeight: "الوزن المطلوب",
  type: "النوع",
  buyPricePerGram: "سعر الشراء/جرام",
  sellPricePerGram: "سعر البيع/جرام",
  totalBuy: "إجمالي الشراء",
  totalSell: "إجمالي البيع",
  enterWeight: "أدخل الوزن",
  grams: "جرام",
  total: "الإجمالي",
  avgBuy: "متوسط الشراء",
  avgSell: "متوسط البيع",
  summary: "الملخص",
  totalWeight: "الوزن الإجمالي",
  totalBuyValue: "إجمالي قيمة الشراء",
  totalSellValue: "إجمالي قيمة البيع",
  help: {
    title: "مساعدة حاسبة الذهب",
    karatPurity: "نقاء القيراط",
    karatPurityDesc: "كلما زاد عدد القيراط زادت نسبة الذهب (24 قيراط هو ذهب نقي)",
    buyPrice: "سعر الشراء",
    buyPriceDesc: "السعر الذي يمكنك شراء الذهب به",
    sellPrice: "سعر البيع",
    sellPriceDesc: "السعر الذي يمكنك بيع الذهب به",
    exchangeRates: "أسعار الصرف",
    exchangeRatesDesc: "تؤثر على الأسعار عند عرضها بعملات مختلفة",
  },
  error: "فشل في جلب أحدث أسعار الذهب. يرجى المحاولة مرة أخرى لاحقًا.",
  never: "أبدًا",
}

export const getTranslations = (locale: Locale): Translations => {
  switch (locale) {
    case "ar":
      return ar
    case "en":
    default:
      return en
  }
}
