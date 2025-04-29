// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Button } from "@/components/ui/button"
// import { RefreshCw, Settings, HelpCircle, AlertCircle } from "lucide-react"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import Image from "next/image"
// import { fetchGoldPrices, convertToKaratPrices } from "@/lib/api"

// // Define types
// type KaratType = "18K" | "22K" | "24K"
// type CurrencyType = "USD" | "SAR" | "EGP"

// interface GoldRate {
//   karat: KaratType
//   buyPrice: number
//   sellPrice: number
// }

// interface GoldEntry {
//   id: number
//   karat: KaratType
//   weight: string
//   buyTotal: number
//   sellTotal: number
//   isActive: boolean
// }

// export default function GoldCalculator() {
//   // Exchange rates
//   const [usdToSar, setUsdToSar] = useState<number>(3.75)
//   const [usdToEgp, setUsdToEgp] = useState<number>(48.5)

//   // Selected currency
//   const [currency, setCurrency] = useState<CurrencyType>("USD")

//   // API status
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

//   // Egypt gold rates
//   const [egyptRates, setEgyptRates] = useState<GoldRate[]>([
//     { karat: "18K", buyPrice: 29, sellPrice: 27 },
//     { karat: "22K", buyPrice: 31, sellPrice: 29 },
//     { karat: "24K", buyPrice: 32, sellPrice: 30 },
//   ])

//   // International gold rates
//   const [internationalRates, setInternationalRates] = useState<GoldRate[]>([
//     { karat: "18K", buyPrice: 30, sellPrice: 28 },
//     { karat: "22K", buyPrice: 32, sellPrice: 30 },
//     { karat: "24K", buyPrice: 33, sellPrice: 31 },
//   ])

//   // Gold entries
//   const [entries, setEntries] = useState<GoldEntry[]>([
//     { id: 1, karat: "18K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
//     { id: 2, karat: "22K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
//     { id: 3, karat: "24K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
//   ])

//   // Summary totals
//   const [summary, setSummary] = useState({
//     totalWeight: 0,
//     totalBuyValue: 0,
//     totalSellValue: 0,
//     averageBuyPrice: 0,
//     averageSellPrice: 0,
//   })

//   // Fetch gold prices from API
//   const fetchLatestPrices = useCallback(async () => {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Fetch gold prices in USD (we'll convert to other currencies as needed)
//       const goldData = await fetchGoldPrices("USD")

//       // Convert gold price per troy ounce to prices by karat
//       const karatPrices = convertToKaratPrices(goldData.rates.XAU)

//       // Update international rates
//       const newInternationalRates: GoldRate[] = [
//         { karat: "18K", buyPrice: karatPrices["18K"].buyPrice, sellPrice: karatPrices["18K"].sellPrice },
//         { karat: "22K", buyPrice: karatPrices["22K"].buyPrice, sellPrice: karatPrices["22K"].sellPrice },
//         { karat: "24K", buyPrice: karatPrices["24K"].buyPrice, sellPrice: karatPrices["24K"].sellPrice },
//       ]

//       // Update Egypt rates (slightly different from international rates)
//       // In a real implementation, you might fetch these separately or apply a market-specific adjustment
//       const egyptAdjustmentFactor = 0.95 // Example: Egypt prices are 95% of international prices
//       const newEgyptRates: GoldRate[] = [
//         {
//           karat: "18K",
//           buyPrice: karatPrices["18K"].buyPrice * egyptAdjustmentFactor,
//           sellPrice: karatPrices["18K"].sellPrice * egyptAdjustmentFactor,
//         },
//         {
//           karat: "22K",
//           buyPrice: karatPrices["22K"].buyPrice * egyptAdjustmentFactor,
//           sellPrice: karatPrices["22K"].sellPrice * egyptAdjustmentFactor,
//         },
//         {
//           karat: "24K",
//           buyPrice: karatPrices["24K"].buyPrice * egyptAdjustmentFactor,
//           sellPrice: karatPrices["24K"].sellPrice * egyptAdjustmentFactor,
//         },
//       ]

//       setInternationalRates(newInternationalRates)
//       setEgyptRates(newEgyptRates)
//       setLastUpdated(new Date())
//     } catch (err) {
//       setError("Failed to fetch latest gold prices. Please try again later.")
//       console.error("Error fetching gold prices:", err)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   // Fetch prices on initial load
//   useEffect(() => {
//     fetchLatestPrices()

//     // Optional: Set up auto-refresh every 5 minutes
//     const intervalId = setInterval(
//       () => {
//         fetchLatestPrices()
//       },
//       5 * 60 * 1000,
//     )

//     return () => clearInterval(intervalId)
//   }, [fetchLatestPrices])

//   // Calculate totals when weight or rates change
//   useEffect(() => {
//     // Only recalculate when currency or rates change, not when entries change
//     if (entries.length > 0) {
//       const calculatedEntries = calculateTotals()

//       // Update only the buy/sell totals
//       setEntries(
//         entries.map((entry, index) => ({
//           ...entry,
//           buyTotal: calculatedEntries[index].buyTotal,
//           sellTotal: calculatedEntries[index].sellTotal,
//         })),
//       )
//     }
//   }, [currency, egyptRates, internationalRates, usdToSar, usdToEgp])

//   // Calculate all totals and summary
//   const calculateTotals = () => {
//     let totalWeight = 0
//     let totalBuyValue = 0
//     let totalSellValue = 0

//     // Calculate without updating state
//     const updatedEntries = entries.map((entry) => {
//       const weight = Number.parseFloat(entry.weight) || 0
//       totalWeight += weight

//       // Find the appropriate rate based on karat
//       const rate = internationalRates.find((r) => r.karat === entry.karat)

//       if (rate) {
//         let buyPrice = rate.buyPrice
//         let sellPrice = rate.sellPrice

//         // Apply currency conversion if needed
//         if (currency === "SAR") {
//           buyPrice *= usdToSar
//           sellPrice *= usdToSar
//         } else if (currency === "EGP") {
//           buyPrice *= usdToEgp
//           sellPrice *= usdToEgp
//         }

//         const buyTotal = weight * buyPrice
//         const sellTotal = weight * sellPrice

//         totalBuyValue += buyTotal
//         totalSellValue += sellTotal

//         return {
//           ...entry,
//           buyTotal,
//           sellTotal,
//         }
//       }

//       return entry
//     })

//     // Calculate averages
//     const averageBuyPrice = totalWeight > 0 ? totalBuyValue / totalWeight : 0
//     const averageSellPrice = totalWeight > 0 ? totalSellValue / totalWeight : 0

//     // Update summary without triggering the entries update
//     setSummary({
//       totalWeight,
//       totalBuyValue,
//       totalSellValue,
//       averageBuyPrice,
//       averageSellPrice,
//     })

//     // Only update entries if they've actually changed
//     // This is the key fix - we're not updating entries on every calculation
//     return updatedEntries
//   }

//   // Handle weight input change
//   const handleWeightChange = (id: number, value: string) => {
//     const newEntries = entries.map((entry) =>
//       entry.id === id ? { ...entry, weight: value, isActive: true } : { ...entry, isActive: false },
//     )

//     setEntries(newEntries)

//     // Calculate totals after updating entries
//     // We don't need to update entries again here
//     const calculatedEntries = calculateTotals()

//     // Only update the buy/sell totals without changing other entry properties
//     setEntries(
//       newEntries.map((entry, index) => ({
//         ...entry,
//         buyTotal: calculatedEntries[index].buyTotal,
//         sellTotal: calculatedEntries[index].sellTotal,
//       })),
//     )
//   }

//   // Set a suggested weight
//   const setSuggestedWeight = (id: number, weight: string) => {
//     const newEntries = entries.map((entry) =>
//       entry.id === id ? { ...entry, weight, isActive: true } : { ...entry, isActive: false },
//     )

//     setEntries(newEntries)

//     // Calculate totals after updating entries
//     const calculatedEntries = calculateTotals()

//     // Only update the buy/sell totals without changing other entry properties
//     setEntries(
//       newEntries.map((entry, index) => ({
//         ...entry,
//         buyTotal: calculatedEntries[index].buyTotal,
//         sellTotal: calculatedEntries[index].sellTotal,
//       })),
//     )
//   }

//   // Format currency
//   const formatCurrency = (value: number): string => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(value)
//   }

//   // Currency symbol
//   const getCurrencySymbol = (): string => {
//     switch (currency) {
//       case "USD":
//         return "$"
//       case "SAR":
//         return "﷼"
//       case "EGP":
//         return "£"
//       default:
//         return "$"
//     }
//   }

//   // Format date for last updated
//   const formatLastUpdated = (): string => {
//     if (!lastUpdated) return "Never"

//     return new Intl.DateTimeFormat("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     }).format(lastUpdated)
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row items-center justify-between mb-8">
//         <div className="flex items-center mb-4 md:mb-0">
//           <div className="w-16 h-16 mr-4">
//             <Image src="/assets/logo/logo.png" alt="Gold Logo" width={64} height={64} className="object-contain" />
//           </div>
//           <h1 className="text-3xl font-semibold text-[#D4AF37]">Gold Calculator</h1>
//         </div>
//         <div className="flex items-center">
//           <div className="text-sm text-slate-300 mr-4">Last updated: {formatLastUpdated()}</div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={fetchLatestPrices}
//             disabled={isLoading}
//             className="mr-2 text-white border-slate-600"
//           >
//             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
//             {isLoading ? "Updating..." : "Refresh Prices"}
//           </Button>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="text-white">
//                   <HelpCircle className="h-5 w-5" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent className="max-w-sm">
//                 <div className="space-y-2 p-2">
//                   <h3 className="font-semibold">Gold Calculator Help</h3>
//                   <p>
//                     <strong>Karat Purity:</strong> Higher karat means higher gold content (24K is pure gold)
//                   </p>
//                   <p>
//                     <strong>Buy Price:</strong> The price at which you can buy gold
//                   </p>
//                   <p>
//                     <strong>Sell Price:</strong> The price at which you can sell gold
//                   </p>
//                   <p>
//                     <strong>Exchange Rates:</strong> Affects prices when viewing in different currencies
//                   </p>
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="destructive" className="mb-6">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* Exchange Rates */}
//       <div className="bg-slate-700 rounded-lg p-4 mb-6">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex items-center">
//             <h2 className="text-lg font-medium text-white mr-4">Exchange Rates:</h2>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex items-center">
//                 <Label htmlFor="usd-sar" className="text-white mr-2">
//                   USD to SAR:
//                 </Label>
//                 <Input
//                   id="usd-sar"
//                   type="number"
//                   value={usdToSar}
//                   onChange={(e) => setUsdToSar(Number.parseFloat(e.target.value) || 0)}
//                   className="w-24 bg-slate-600 text-white border-slate-500"
//                 />
//               </div>
//               <div className="flex items-center">
//                 <Label htmlFor="usd-egp" className="text-white mr-2">
//                   USD to EGP:
//                 </Label>
//                 <Input
//                   id="usd-egp"
//                   type="number"
//                   value={usdToEgp}
//                   onChange={(e) => setUsdToEgp(Number.parseFloat(e.target.value) || 0)}
//                   className="w-24 bg-slate-600 text-white border-slate-500"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center">
//             <Label htmlFor="currency" className="text-white mr-2">
//               Currency:
//             </Label>
//             <Select value={currency} onValueChange={(value: string) => setCurrency(value as CurrencyType)}>
//               <SelectTrigger className="w-24 bg-slate-600 text-white border-slate-500">
//                 <SelectValue placeholder="USD" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="USD">USD</SelectItem>
//                 <SelectItem value="SAR">SAR</SelectItem>
//                 <SelectItem value="EGP">EGP</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </div>

//       {/* Gold Rates Cards */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         {/* Egypt Gold Rates */}
//         <Card className="bg-[#f5f1e6] border-[#D4AF37]/20">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-xl font-semibold text-slate-800">Egypt Gold Rates</CardTitle>
//             <div className="flex">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="text-slate-700"
//                 onClick={fetchLatestPrices}
//                 disabled={isLoading}
//               >
//                 <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//               </Button>
//               <Button variant="ghost" size="icon" className="text-slate-700">
//                 <Settings className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {egyptRates.map((rate) => (
//                 <div key={rate.karat} className="flex justify-between items-center py-2 border-b border-slate-200">
//                   <span className="font-medium">{rate.karat}</span>
//                   <div className="flex gap-4">
//                     <div className="text-right">
//                       <div className="text-sm text-slate-500">Buy</div>
//                       <div className="font-semibold text-emerald-600">
//                         {getCurrencySymbol()}
//                         {currency === "USD"
//                           ? rate.buyPrice.toFixed(2)
//                           : currency === "SAR"
//                             ? (rate.buyPrice * usdToSar).toFixed(2)
//                             : (rate.buyPrice * usdToEgp).toFixed(2)}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-slate-500">Sell</div>
//                       <div className="font-semibold text-red-600">
//                         {getCurrencySymbol()}
//                         {currency === "USD"
//                           ? rate.sellPrice.toFixed(2)
//                           : currency === "SAR"
//                             ? (rate.sellPrice * usdToSar).toFixed(2)
//                             : (rate.sellPrice * usdToEgp).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* International Gold Rates */}
//         <Card className="bg-[#e6f0f5] border-[#D4AF37]/20">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-xl font-semibold text-slate-800">International Gold Rates</CardTitle>
//             <div className="flex">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="text-slate-700"
//                 onClick={fetchLatestPrices}
//                 disabled={isLoading}
//               >
//                 <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//               </Button>
//               <Button variant="ghost" size="icon" className="text-slate-700">
//                 <Settings className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {internationalRates.map((rate) => (
//                 <div key={rate.karat} className="flex justify-between items-center py-2 border-b border-slate-200">
//                   <span className="font-medium">{rate.karat}</span>
//                   <div className="flex gap-4">
//                     <div className="text-right">
//                       <div className="text-sm text-slate-500">Buy</div>
//                       <div className="font-semibold text-emerald-600">
//                         {getCurrencySymbol()}
//                         {currency === "USD"
//                           ? rate.buyPrice.toFixed(2)
//                           : currency === "SAR"
//                             ? (rate.buyPrice * usdToSar).toFixed(2)
//                             : (rate.buyPrice * usdToEgp).toFixed(2)}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-slate-500">Sell</div>
//                       <div className="font-semibold text-red-600">
//                         {getCurrencySymbol()}
//                         {currency === "USD"
//                           ? rate.sellPrice.toFixed(2)
//                           : currency === "SAR"
//                             ? (rate.sellPrice * usdToSar).toFixed(2)
//                             : (rate.sellPrice * usdToEgp).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Gold Calculator Table */}
//       <Card className="bg-slate-800 border-[#D4AF37]/20 mb-6">
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-700 text-white">
//                   <th className="px-4 py-3 text-left font-semibold">Desired Weight</th>
//                   <th className="px-4 py-3 text-left font-semibold">Type</th>
//                   <th className="px-4 py-3 text-left font-semibold">Buy Price/Gram</th>
//                   <th className="px-4 py-3 text-left font-semibold">Sell Price/Gram</th>
//                   <th className="px-4 py-3 text-left font-semibold">Total Buy</th>
//                   <th className="px-4 py-3 text-left font-semibold">Total Sell</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {entries.map((entry) => {
//                   // Find the rate for this karat
//                   const rate = internationalRates.find((r) => r.karat === entry.karat)
//                   let buyPrice = rate ? rate.buyPrice : 0
//                   let sellPrice = rate ? rate.sellPrice : 0

//                   // Apply currency conversion
//                   if (currency === "SAR") {
//                     buyPrice *= usdToSar
//                     sellPrice *= usdToSar
//                   } else if (currency === "EGP") {
//                     buyPrice *= usdToEgp
//                     sellPrice *= usdToEgp
//                   }

//                   return (
//                     <tr
//                       key={entry.id}
//                       className={`border-b border-slate-700 ${entry.isActive ? "bg-slate-600" : "hover:bg-slate-700"}`}
//                     >
//                       <td className="px-4 py-3">
//                         <div className="flex flex-col space-y-2">
//                           <div className="flex items-center">
//                             <Input
//                               type="number"
//                               value={entry.weight}
//                               onChange={(e) => handleWeightChange(entry.id, e.target.value)}
//                               placeholder="Enter weight"
//                               className="bg-slate-700 border-slate-600 text-white"
//                             />
//                             <span className="ml-2 text-white">grams</span>
//                           </div>
//                           <div className="flex space-x-2">
//                             {["5", "10", "20", "50", "100"].map((weight) => (
//                               <Button
//                                 key={weight}
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-xs py-0 h-6 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
//                                 onClick={() => setSuggestedWeight(entry.id, weight)}
//                               >
//                                 {weight}g
//                               </Button>
//                             ))}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-white">{entry.karat}</td>
//                       <td className="px-4 py-3 text-emerald-400">
//                         {getCurrencySymbol()}
//                         {buyPrice.toFixed(2)}/g
//                       </td>
//                       <td className="px-4 py-3 text-red-400">
//                         {getCurrencySymbol()}
//                         {sellPrice.toFixed(2)}/g
//                       </td>
//                       <td className="px-4 py-3 font-semibold text-emerald-400">{formatCurrency(entry.buyTotal)}</td>
//                       <td className="px-4 py-3 font-semibold text-red-400">{formatCurrency(entry.sellTotal)}</td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//               <tfoot>
//                 <tr className="bg-slate-700 text-white font-semibold">
//                   <td className="px-4 py-3" colSpan={2}>
//                     Total
//                   </td>
//                   <td className="px-4 py-3" colSpan={2}>
//                     Avg Buy: {getCurrencySymbol()}
//                     {summary.averageBuyPrice.toFixed(2)}/g
//                     <br />
//                     Avg Sell: {getCurrencySymbol()}
//                     {summary.averageSellPrice.toFixed(2)}/g
//                   </td>
//                   <td className="px-4 py-3 text-emerald-400">{formatCurrency(summary.totalBuyValue)}</td>
//                   <td className="px-4 py-3 text-red-400">{formatCurrency(summary.totalSellValue)}</td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Summary Card */}
//       <Card className="bg-[#f5f1e6] border-[#D4AF37]/20">
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-slate-800">Summary</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-slate-100 p-4 rounded-lg">
//               <h3 className="text-sm font-medium text-slate-500 mb-1">Total Weight</h3>
//               <p className="text-2xl font-bold text-slate-800">{summary.totalWeight.toFixed(2)} grams</p>
//             </div>
//             <div className="bg-slate-100 p-4 rounded-lg">
//               <h3 className="text-sm font-medium text-slate-500 mb-1">Total Buy Value</h3>
//               <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalBuyValue)}</p>
//             </div>
//             <div className="bg-slate-100 p-4 rounded-lg">
//               <h3 className="text-sm font-medium text-slate-500 mb-1">Total Sell Value</h3>
//               <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSellValue)}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

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
import Image from "next/image"
import { fetchGoldPrices, convertToKaratPrices } from "@/lib/api"
import { useTranslation } from "@/hooks/use-translation"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

// Define types
type KaratType = "18K" | "22K" | "24K"
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
  const { t, dir, language } = useTranslation()

  // Exchange rates
  const [usdToSar, setUsdToSar] = useState<number>(3.75)
  const [usdToEgp, setUsdToEgp] = useState<number>(48.5)

  // Selected currency
  const [currency, setCurrency] = useState<CurrencyType>("USD")

  // API status
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Egypt gold rates
  const [egyptRates, setEgyptRates] = useState<GoldRate[]>([
    { karat: "18K", buyPrice: 29, sellPrice: 27 },
    { karat: "22K", buyPrice: 31, sellPrice: 29 },
    { karat: "24K", buyPrice: 32, sellPrice: 30 },
  ])

  // International gold rates
  const [internationalRates, setInternationalRates] = useState<GoldRate[]>([
    { karat: "18K", buyPrice: 30, sellPrice: 28 },
    { karat: "22K", buyPrice: 32, sellPrice: 30 },
    { karat: "24K", buyPrice: 33, sellPrice: 31 },
  ])

  // Gold entries
  const [entries, setEntries] = useState<GoldEntry[]>([
    { id: 1, karat: "18K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
    { id: 2, karat: "22K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
    { id: 3, karat: "24K", weight: "", buyTotal: 0, sellTotal: 0, isActive: false },
  ])

  // Summary totals
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalBuyValue: 0,
    totalSellValue: 0,
    averageBuyPrice: 0,
    averageSellPrice: 0,
  })

  // Fetch gold prices from API
  const fetchLatestPrices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch gold prices in USD (we'll convert to other currencies as needed)
      const goldData = await fetchGoldPrices("USD")

      // Convert gold price per troy ounce to prices by karat
      const karatPrices = convertToKaratPrices(goldData.rates.XAU)

      // Update international rates
      const newInternationalRates: GoldRate[] = [
        { karat: "18K", buyPrice: karatPrices["18K"].buyPrice, sellPrice: karatPrices["18K"].sellPrice },
        { karat: "22K", buyPrice: karatPrices["22K"].buyPrice, sellPrice: karatPrices["22K"].sellPrice },
        { karat: "24K", buyPrice: karatPrices["24K"].buyPrice, sellPrice: karatPrices["24K"].sellPrice },
      ]

      // Update Egypt rates (slightly different from international rates)
      // In a real implementation, you might fetch these separately or apply a market-specific adjustment
      const egyptAdjustmentFactor = 0.95 // Example: Egypt prices are 95% of international prices
      const newEgyptRates: GoldRate[] = [
        {
          karat: "18K",
          buyPrice: karatPrices["18K"].buyPrice * egyptAdjustmentFactor,
          sellPrice: karatPrices["18K"].sellPrice * egyptAdjustmentFactor,
        },
        {
          karat: "22K",
          buyPrice: karatPrices["22K"].buyPrice * egyptAdjustmentFactor,
          sellPrice: karatPrices["22K"].sellPrice * egyptAdjustmentFactor,
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
      setError("Failed to fetch latest gold prices. Please try again later.")
      console.error("Error fetching gold prices:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch prices on initial load
  useEffect(() => {
    fetchLatestPrices()

    // Optional: Set up auto-refresh every 5 minutes
    const intervalId = setInterval(
      () => {
        fetchLatestPrices()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [fetchLatestPrices])

  // Calculate totals when weight or rates change
  useEffect(() => {
    // Only recalculate when currency or rates change, not when entries change
    if (entries.length > 0) {
      const calculatedEntries = calculateTotals()

      // Update only the buy/sell totals
      setEntries(
        entries.map((entry, index) => ({
          ...entry,
          buyTotal: calculatedEntries[index].buyTotal,
          sellTotal: calculatedEntries[index].sellTotal,
        })),
      )
    }
  }, [currency, egyptRates, internationalRates, usdToSar, usdToEgp])

  // Calculate all totals and summary
  const calculateTotals = () => {
    let totalWeight = 0
    let totalBuyValue = 0
    let totalSellValue = 0

    // Calculate without updating state
    const updatedEntries = entries.map((entry) => {
      const weight = Number.parseFloat(entry.weight) || 0
      totalWeight += weight

      // Find the appropriate rate based on karat
      const rate = internationalRates.find((r) => r.karat === entry.karat)

      if (rate) {
        let buyPrice = rate.buyPrice
        let sellPrice = rate.sellPrice

        // Apply currency conversion if needed
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

    // Calculate averages
    const averageBuyPrice = totalWeight > 0 ? totalBuyValue / totalWeight : 0
    const averageSellPrice = totalWeight > 0 ? totalSellValue / totalWeight : 0

    // Update summary without triggering the entries update
    setSummary({
      totalWeight,
      totalBuyValue,
      totalSellValue,
      averageBuyPrice,
      averageSellPrice,
    })

    // Only update entries if they've actually changed
    // This is the key fix - we're not updating entries on every calculation
    return updatedEntries
  }

  // Handle weight input change
  const handleWeightChange = (id: number, value: string) => {
    const newEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, weight: value, isActive: true } : { ...entry, isActive: false },
    )

    setEntries(newEntries)

    // Calculate totals after updating entries
    // We don't need to update entries again here
    const calculatedEntries = calculateTotals()

    // Only update the buy/sell totals without changing other entry properties
    setEntries(
      newEntries.map((entry, index) => ({
        ...entry,
        buyTotal: calculatedEntries[index].buyTotal,
        sellTotal: calculatedEntries[index].sellTotal,
      })),
    )
  }

  // Set a suggested weight
  const setSuggestedWeight = (id: number, weight: string) => {
    const newEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, weight, isActive: true } : { ...entry, isActive: false },
    )

    setEntries(newEntries)

    // Calculate totals after updating entries
    const calculatedEntries = calculateTotals()

    // Only update the buy/sell totals without changing other entry properties
    setEntries(
      newEntries.map((entry, index) => ({
        ...entry,
        buyTotal: calculatedEntries[index].buyTotal,
        sellTotal: calculatedEntries[index].sellTotal,
      })),
    )
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Currency symbol
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

  // Format date for last updated
  const formatLastUpdated = (): string => {
    if (!lastUpdated) return language === "ar" ? "أبداً" : "Never"

    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
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
            <Image src="/assets/logo/logo.png" alt="Gold Logo" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-semibold text-[#D4AF37]">{t("goldCalculator")}</h1>
        </div>
        <div className="flex items-center">
          <LanguageSwitcher />
          <div className="text-sm text-slate-300 mx-4">
            {t("lastUpdated")} {formatLastUpdated()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLatestPrices}
            disabled={isLoading}
            className="mr-2 text-white border-slate-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? t("updating") : t("refreshPrices")}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2 p-2">
                  <h3 className="font-semibold">{t("goldCalculatorHelp")}</h3>
                  <p>
                    <strong>{t("karatPurity")}</strong> {t("karatPurityDesc")}
                  </p>
                  <p>
                    <strong>{t("buyPrice")}</strong> {t("buyPriceDesc")}
                  </p>
                  <p>
                    <strong>{t("sellPrice")}</strong> {t("sellPriceDesc")}
                  </p>
                  <p>
                    <strong>{t("exchangeRates")}</strong> {t("exchangeRatesDesc")}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Exchange Rates */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-white mr-4">{t("exchangeRates")}</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <Label htmlFor="usd-sar" className="text-white mr-2">
                  {t("usdToSar")}
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
                  {t("usdToEgp")}
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
              {t("currency")}
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

      {/* Gold Rates Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Egypt Gold Rates */}
        <Card className="bg-[#f5f1e6] border-[#D4AF37]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-slate-800">{t("egyptGoldRates")}</CardTitle>
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
                      <div className="text-sm text-slate-500">{t("buy")}</div>
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
                      <div className="text-sm text-slate-500">{t("sell")}</div>
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

        {/* International Gold Rates */}
        <Card className="bg-[#e6f0f5] border-[#D4AF37]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-slate-800">{t("internationalGoldRates")}</CardTitle>
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
                      <div className="text-sm text-slate-500">{t("buy")}</div>
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
                      <div className="text-sm text-slate-500">{t("sell")}</div>
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

      {/* Gold Calculator Table */}
      <Card className="bg-slate-800 border-[#D4AF37]/20 mb-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold">{t("desiredWeight")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("type")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("buyPriceGram")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("sellPriceGram")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("totalBuy")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("totalSell")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  // Find the rate for this karat
                  const rate = internationalRates.find((r) => r.karat === entry.karat)
                  let buyPrice = rate ? rate.buyPrice : 0
                  let sellPrice = rate ? rate.sellPrice : 0

                  // Apply currency conversion
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
                              value={entry.weight}
                              onChange={(e) => handleWeightChange(entry.id, e.target.value)}
                              placeholder={language === "ar" ? "أدخل الوزن" : "Enter weight"}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                            <span className="ml-2 text-white">{t("grams")}</span>
                          </div>
                          <div className="flex space-x-2">
                            {["5", "10", "20", "50", "100"].map((weight) => (
                              <Button
                                key={weight}
                                variant="outline"
                                size="sm"
                                className="text-xs py-0 h-6 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                                onClick={() => setSuggestedWeight(entry.id, weight)}
                              >
                                {weight}g
                              </Button>
                            ))}
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
                    {t("total")}
                  </td>
                  <td className="px-4 py-3" colSpan={2}>
                    {t("avgBuy")} {getCurrencySymbol()}
                    {summary.averageBuyPrice.toFixed(2)}/g
                    <br />
                    {t("avgSell")} {getCurrencySymbol()}
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
          <CardTitle className="text-xl font-semibold text-slate-800">{t("summary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{t("totalWeight")}</h3>
              <p className="text-2xl font-bold text-slate-800">
                {summary.totalWeight.toFixed(2)} {t("grams")}
              </p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{t("totalBuyValue")}</h3>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalBuyValue)}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">{t("totalSellValue")}</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSellValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
