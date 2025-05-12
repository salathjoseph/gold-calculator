// Gold price API service

// API configuration with the provided goldprice.org endpoint
const API_CONFIG = {
  baseUrl: "https://data-asg.goldprice.org/dbXRates",
}

// Conversion constants
const OZ_TO_GRAM = 31.1035
const GRAM_TO_KG = 1000
const TOLA_TO_GRAM = 11.66

// Gold purity factors for different karats
const PURITY_24K = 1.0 // 100% pure gold
const PURITY_22K = 0.9167 // 91.67% pure gold
const PURITY_21K = 0.875 // 87.5% pure gold
const PURITY_18K = 0.75 // 75% pure gold

export interface GoldPriceApiResponse {
  items: Array<{
    curr: string
    xauPrice: number // Gold price per ounce
    xagPrice: number // Silver price per ounce
    chgXau: number
    chgXag: number
    pcXau: number
    pcXag: number
    xauClose: number
    xagClose: number
  }>
  ts: number
  date: string
}

export interface GoldPriceData {
  timestamp: number
  price: number
  currency: string
  metal: string
}

export interface ExchangeRateData {
  base: string
  date: string
  rates: {
    [key: string]: number
  }
}

export interface GoldRatesByKarat {
  "18K": { buyPrice: number; sellPrice: number }
  "21K": { buyPrice: number; sellPrice: number }
  "24K": { buyPrice: number; sellPrice: number }
}

/**
 * Fetches the latest gold prices from goldprice.org API
 */
export async function fetchGoldPrices(currency = "USD"): Promise<GoldPriceData> {
  try {
    // Use the goldprice.org API endpoint
    const response = await fetch(`${API_CONFIG.baseUrl}/${currency}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: GoldPriceApiResponse = await response.json()

    // Find the item for the requested currency
    const currencyItem = data.items.find((item) => item.curr === currency)

    if (!currencyItem) {
      throw new Error(`Currency ${currency} not found in API response`)
    }

    // The API returns gold price per troy ounce
    const goldPricePerOz = currencyItem.xauPrice

    return {
      timestamp: data.ts,
      price: goldPricePerOz,
      currency: currency,
      metal: "XAU",
    }
  } catch (error) {
    console.error("Error fetching gold prices:", error)
    throw error
  }
}

/**
 * Fetches the latest currency exchange rates
 * This API also provides exchange rates, so we can extract them from the same response
 */
export async function fetchExchangeRates(): Promise<ExchangeRateData> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/USD`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: GoldPriceApiResponse = await response.json()

    // Create a rates object from the items array
    const rates: { [key: string]: number } = {}

    // Base currency is USD
    data.items.forEach((item) => {
      if (item.curr !== "USD") {
        // Calculate the exchange rate (1 USD = X of currency)
        // We use the gold price in USD divided by gold price in the target currency
        const usdItem = data.items.find((i) => i.curr === "USD")
        if (usdItem) {
          rates[item.curr] = usdItem.xauPrice / item.xauPrice
        }
      }
    })

    return {
      base: "USD",
      date: data.date,
      rates: rates,
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    throw error
  }
}

/**
 * Converts gold price per troy ounce to prices by karat
 * @param goldPricePerOz Gold price per troy ounce in USD
 * @returns Object with prices for different karats
 */
export function convertToKaratPrices(goldPricePerOz: number): GoldRatesByKarat {
  // Convert from troy ounce to gram
  const goldPricePerGram = goldPricePerOz / OZ_TO_GRAM

  // Calculate buy and sell prices with a small spread
  // Typically, sell prices are lower than buy prices
  const spread = 0.05 // 5% spread between buy and sell

  return {
    "18K": {
      buyPrice: Number.parseFloat((goldPricePerGram * PURITY_18K).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * PURITY_18K * (1 - spread)).toFixed(2)),
    },
    "21K": {
      buyPrice: Number.parseFloat((goldPricePerGram * PURITY_21K).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * PURITY_21K * (1 - spread)).toFixed(2)),
    },
    "24K": {
      buyPrice: Number.parseFloat((goldPricePerGram * PURITY_24K).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * PURITY_24K * (1 - spread)).toFixed(2)),
    },
  }
}
