"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { RefreshCw, Settings, HelpCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchGoldPrices, convertToKaratPrices, fetchExchangeRates } from "@/lib/api"
import { useTranslations } from "@/lib/i18n/use-translations"
import { LanguageToggle } from "./language-toggle"
import Image from "next/image"


type KaratType = "18K" | "21K" | "24K"
type CurrencyType = "USD" | "SAR" | "EGP"

interface GoldRate {
  karat: KaratType
  buyPrice: number
  sellPrice: number
}

interface GoldEntry {
  id: number
  karat: KaratType
  weight: string
  buyTotal: number
  sellTotal: number
  isActive: boolean
}

export default function GoldCalculator() {
  const { locale, translations, dir, toggleLocale } = useTranslations()

  const [usdToSar, setUsdToSar] = useState<number>(3.75)
  const [usdToEgp, setUsdToEgp] = useState<number>(30.9)
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false)

  const [currency, setCurrency] = useState<CurrencyType>("USD")

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [egyptRates, setEgyptRates] = useState<GoldRate[]>([
    { karat: "18K", buyPrice: 29, sellPrice: 27 },
    { karat: "21K", buyPrice: 31, sellPrice: 29 },
    { karat: "24K", buyPrice: 32, sellPrice: 30 },
  ])

  const [internationalRates, setInternationalRates] = useState<GoldRate[]>([
    { karat: "18K", buyPrice: 30, sellPrice: 28 },
    { karat: "21K", buyPrice: 32, sellPrice: 30 },
    { karat: "24K", buyPrice: 33, sellPrice: 31 },
  ])

  const [entries, setEntries] = useState<GoldEntry[]>([
    { id: 1, karat: "18K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
    { id: 2, karat: "21K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
    { id: 3, karat: "24K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
  ])

  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalBuyValue: 0,
    totalSellValue: 0,
    averageBuyPrice: 0,
    averageSellPrice: 0,
  })

  const fetchLatestExchangeRates = useCallback(async () => {
    setIsLoadingRates(true)
    try {
      const data = await fetchExchangeRates()
      if (data && data.rates) {
        setUsdToSar(data.rates.SAR || 3.75)
        setUsdToEgp(data.rates.EGP || 30.9)
      }
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
    } finally {
      setIsLoadingRates(false)
    }
  }, [])

  const fetchLatestPrices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const goldData = await fetchGoldPrices("USD")

      const karatPrices = convertToKaratPrices(goldData.price)

      const newInternationalRates: GoldRate[] = [
        { karat: "18K", buyPrice: karatPrices["18K"].buyPrice, sellPrice: karatPrices["18K"].sellPrice },
        { karat: "21K", buyPrice: karatPrices["21K"].buyPrice, sellPrice: karatPrices["21K"].sellPrice },
        { karat: "24K", buyPrice: karatPrices["24K"].buyPrice, sellPrice: karatPrices["24K"].sellPrice },
      ]

      const egyptAdjustmentFactor = 0.95
      const newEgyptRates: GoldRate[] = [
        {
          karat: "18K",
          buyPrice: karatPrices["18K"].buyPrice * egyptAdjustmentFactor,
          sellPrice: karatPrices["18K"].sellPrice * egyptAdjustmentFactor,
        },
        {
          karat: "21K",
          buyPrice: karatPrices["21K"].buyPrice * egyptAdjustmentFactor,
          sellPrice: karatPrices["21K"].sellPrice * egyptAdjustmentFactor,
        },
        {
          karat: "24K",
          buyPrice: karatPrices["24K"].buyPrice * egyptAdjustmentFactor,
          sellPrice: karatPrices["24K"].sellPrice * egyptAdjustmentFactor,
        },
      ]

      setInternationalRates(newInternationalRates)
      setEgyptRates(newEgyptRates)
      setLastUpdated(new Date())
    } catch (err) {
      setError(translations.error)
      console.error("Error fetching gold prices:", err)
    } finally {
      setIsLoading(false)
    }
  }, [translations.error])

  useEffect(() => {
    fetchLatestPrices()
    fetchLatestExchangeRates()

    const goldIntervalId = setInterval(
      () => {
        fetchLatestPrices()
      },
      5 * 60 * 1000,
    )

    const ratesIntervalId = setInterval(
      () => {
        fetchLatestExchangeRates()
      },
      30 * 60 * 1000,
    )

    return () => {
      clearInterval(goldIntervalId)
      clearInterval(ratesIntervalId)
    }
  }, [fetchLatestPrices, fetchLatestExchangeRates])

  useEffect(() => {
    if (entries.length > 0) {
      const { updatedEntries, summaryData } = calculateTotals(entries)

      setEntries(updatedEntries)

      setSummary(summaryData)
    }
  }, [currency, egyptRates, internationalRates, usdToSar, usdToEgp])

  const calculateTotals = (currentEntries: GoldEntry[]) => {
    let totalWeight = 0
    let totalBuyValue = 0
    let totalSellValue = 0

    const updatedEntries = currentEntries.map((entry) => {
      const weight = Number.parseFloat(entry.weight) || 0
      totalWeight += weight

      const rate = internationalRates.find((r) => r.karat === entry.karat)

      if (rate) {
        let buyPrice = rate.buyPrice
        let sellPrice = rate.sellPrice

        if (currency === "SAR") {
          buyPrice *= usdToSar
          sellPrice *= usdToSar
        } else if (currency === "EGP") {
          buyPrice *= usdToEgp
          sellPrice *= usdToEgp
        }

        const buyTotal = weight * buyPrice
        const sellTotal = weight * sellPrice

        totalBuyValue += buyTotal
        totalSellValue += sellTotal

        return {
          ...entry,
          buyTotal,
          sellTotal,
        }
      }

      return entry
    })

    const averageBuyPrice = totalWeight > 0 ? totalBuyValue / totalWeight : 0
    const averageSellPrice = totalWeight > 0 ? totalSellValue / totalWeight : 0

    return {
      updatedEntries,
      summaryData: {
        totalWeight,
        totalBuyValue,
        totalSellValue,
        averageBuyPrice,
        averageSellPrice,
      },
    }
  }

  const handleWeightChange = (id: number, value: string) => {
    const sanitizedValue = value === "" ? "" : Math.max(0, Number.parseFloat(value) || 0).toString()

    const newEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, weight: sanitizedValue, isActive: true } : { ...entry, isActive: false },
    )

    const { updatedEntries, summaryData } = calculateTotals(newEntries)

    setEntries(updatedEntries)
    setSummary(summaryData)
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getCurrencySymbol = (): string => {
    switch (currency) {
      case "USD":
        return "$"
      case "SAR":
        return "﷼"
      case "EGP":
        return "£"
      default:
        return "$"
    }
  }

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return translations.never

    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(lastUpdated)
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 mr-4">
             <Image src="/assets/logo/logo-1.svg" alt="Gold Logo" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-semibold text-[#D4AF37]">{translations.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-slate-300 mr-4">
            {translations.lastUpdated}: {formatLastUpdated()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLatestPrices}
            disabled={isLoading}
            className="mr-2 text-black border-slate-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? translations.updating : translations.refreshPrices}
          </Button>
          <LanguageToggle locale={locale} toggleLocale={toggleLocale} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2 p-2">
                  <h3 className="font-semibold">{translations.help.title}</h3>
                  <p>
                    <strong>{translations.help.karatPurity}:</strong> {translations.help.karatPurityDesc}
                  </p>
                  <p>
                    <strong>{translations.help.buyPrice}:</strong> {translations.help.buyPriceDesc}
                  </p>
                  <p>
                    <strong>{translations.help.sellPrice}:</strong> {translations.help.sellPriceDesc}
                  </p>
                  <p>
                    <strong>{translations.help.exchangeRates}:</strong> {translations.help.exchangeRatesDesc}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-white mr-4">
              {translations.exchangeRates}:
              {isLoadingRates && (
                <span className="text-sm font-normal ml-2 text-slate-300">({translations.updatingRates})</span>
              )}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <Label htmlFor="usd-sar" className="text-white mr-2">
                  {translations.usdToSar}:
                </Label>
                <Input
                  id="usd-sar"
                  type="number"
                  value={usdToSar}
                  onChange={(e) => setUsdToSar(Number.parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-600 text-white border-slate-500"
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="usd-egp" className="text-white mr-2">
                  {translations.usdToEgp}:
                </Label>
                <Input
                  id="usd-egp"
                  type="number"
                  value={usdToEgp}
                  onChange={(e) => setUsdToEgp(Number.parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-600 text-white border-slate-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Label htmlFor="currency" className="text-white mr-2">
              {translations.currency}:
            </Label>
            <Select value={currency} onValueChange={(value: string) => setCurrency(value as CurrencyType)}>
              <SelectTrigger className="w-24 bg-slate-600 text-white border-slate-500">
                <SelectValue placeholder="USD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="EGP">EGP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#f5f1e6] border-[#D4AF37]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-slate-800">{translations.egyptGoldRates}</CardTitle>
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-700"
                onClick={fetchLatestPrices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {egyptRates.map((rate) => (
                <div key={rate.karat} className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-medium">{rate.karat}</span>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">{translations.buy}</div>
                      <div className="font-semibold text-emerald-600">
                        {getCurrencySymbol()}
                        {currency === "USD"
                          ? rate.buyPrice.toFixed(2)
                          : currency === "SAR"
                            ? (rate.buyPrice * usdToSar).toFixed(2)
                            : (rate.buyPrice * usdToEgp).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">{translations.sell}</div>
                      <div className="font-semibold text-red-600">
                        {getCurrencySymbol()}
                        {currency === "USD"
                          ? rate.sellPrice.toFixed(2)
                          : currency === "SAR"
                            ? (rate.sellPrice * usdToSar).toFixed(2)
                            : (rate.sellPrice * usdToEgp).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#e6f0f5] border-[#D4AF37]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-slate-800">
              {translations.internationalGoldRates}
            </CardTitle>
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-700"
                onClick={fetchLatestPrices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {internationalRates.map((rate) => (
                <div key={rate.karat} className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-medium">{rate.karat}</span>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-500">{translations.buy}</div>
                      <div className="font-semibold text-emerald-600">
                        {getCurrencySymbol()}
                        {currency === "USD"
                          ? rate.buyPrice.toFixed(2)
                          : currency === "SAR"
                            ? (rate.buyPrice * usdToSar).toFixed(2)
                            : (rate.buyPrice * usdToEgp).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">{translations.sell}</div>
                      <div className="font-semibold text-red-600">
                        {getCurrencySymbol()}
                        {currency === "USD"
                          ? rate.sellPrice.toFixed(2)
                          : currency === "SAR"
                            ? (rate.sellPrice * usdToSar).toFixed(2)
                            : (rate.sellPrice * usdToEgp).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-[#D4AF37]/20 mb-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold">{translations.desiredWeight}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translations.type}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translations.buyPricePerGram}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translations.sellPricePerGram}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translations.totalBuy}</th>
                  <th className="px-4 py-3 text-left font-semibold">{translations.totalSell}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const rate = internationalRates.find((r) => r.karat === entry.karat)
                  let buyPrice = rate ? rate.buyPrice : 0
                  let sellPrice = rate ? rate.sellPrice : 0

                  if (currency === "SAR") {
                    buyPrice *= usdToSar
                    sellPrice *= usdToSar
                  } else if (currency === "EGP") {
                    buyPrice *= usdToEgp
                    sellPrice *= usdToEgp
                  }

                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-700 ${entry.isActive ? "bg-slate-600" : "hover:bg-slate-700"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="0"
                              value={entry.weight}
                              onChange={(e) => handleWeightChange(entry.id, e.target.value)}
                              placeholder={translations.enterWeight}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                            <span className="ml-2 text-white">{translations.grams}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{entry.karat}</td>
                      <td className="px-4 py-3 text-emerald-400">
                        {getCurrencySymbol()}
                        {buyPrice.toFixed(2)}/g
                      </td>
                      <td className="px-4 py-3 text-red-400">
                        {getCurrencySymbol()}
                        {sellPrice.toFixed(2)}/g
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{formatCurrency(entry.buyTotal)}</td>
                      <td className="px-4 py-3 font-semibold text-red-400">{formatCurrency(entry.sellTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-700 text-white font-semibold">
                  <td className="px-4 py-3" colSpan={2}>
                    {translations.total}
                  </td>
                  <td className="px-4 py-3" colSpan={2}>
                    {translations.avgBuy}: {getCurrencySymbol()}
                    {summary.averageBuyPrice.toFixed(2)}/g
                    <br />
                    {translations.avgSell}: {getCurrencySymbol()}
                    {summary.averageSellPrice.toFixed(2)}/g
                  </td>
                  <td className="px-4 py-3 text-emerald-400">{formatCurrency(summary.totalBuyValue)}</td>
                  <td className="px-4 py-3 text-red-400">{formatCurrency(summary.totalSellValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-[#f5f1e6] border-[#D4AF37]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">{translations.summary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{translations.totalWeight}</h3>
              <p className="text-2xl font-bold text-slate-800">
                {summary.totalWeight.toFixed(2)} {translations.grams}
              </p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{translations.totalBuyValue}</h3>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalBuyValue)}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{translations.totalSellValue}</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSellValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
