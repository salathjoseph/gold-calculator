const API_CONFIG = {
  endpoint: "https://www.goldapi.io/api/XAU/USD",
  apiKey: "goldapi-6j5sma3r30d1-io",
}

export interface GoldPriceData {
  timestamp: number
  price: number
  currency: string
  exchange: string
  metal: string
  prev_close_price?: number
  ch?: number
  chp?: number
}

export interface GoldRatesByKarat {
  "18K": { buyPrice: number; sellPrice: number }
  "22K": { buyPrice: number; sellPrice: number }
  "24K": { buyPrice: number; sellPrice: number }
}

export async function fetchGoldPrices(currency = "USD"): Promise<GoldPriceData> {
  try {
    const response = await fetch(`https://www.goldapi.io/api/XAU/${currency}`, {
      headers: {
        "x-access-token": API_CONFIG.apiKey,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching gold prices:", error)
    throw error
  }
}

/**
 * Converts gold price per troy ounce to prices by karat
 * @param goldPricePerOz Gold price per troy ounce in USD
 * @returns Object with prices for different karats
 */
export function convertToKaratPrices(goldPricePerOz: number): GoldRatesByKarat {
  const purityFactors = {
    "18K": 0.75,
    "22K": 0.9167,
    "24K": 0.9999,
  }

  const goldPricePerGram = goldPricePerOz / 31.1034768

  const spread = 0.05

  return {
    "18K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["18K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["18K"] * (1 - spread)).toFixed(2)),
    },
    "22K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["22K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["22K"] * (1 - spread)).toFixed(2)),
    },
    "24K": {
      buyPrice: Number.parseFloat((goldPricePerGram * purityFactors["24K"]).toFixed(2)),
      sellPrice: Number.parseFloat((goldPricePerGram * purityFactors["24K"] * (1 - spread)).toFixed(2)),
    },
  }
}
