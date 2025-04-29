// Gold price API service

// API configuration - replace with your actual API key and endpoint
const API_CONFIG = {
  // Common gold price APIs include:
  // - Gold API (goldapi.io)
  // - Metals API (metals-api.com)
  // - Alpha Vantage (alphavantage.co)
  endpoint: "https://api.example.com/v1/gold", // Replace with actual API endpoint
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  currency: "USD",
}

export interface GoldPriceData {
  timestamp: number
  currency: string
  rates: {
    XAU: number // Gold price per troy ounce
  }
}

export interface GoldRatesByKarat {
  "18K": { buyPrice: number; sellPrice: number }
  "22K": { buyPrice: number; sellPrice: number }
  "24K": { buyPrice: number; sellPrice: number }
}

/**
 * Fetches the latest gold prices from the API
 */
export async function fetchGoldPrices(currency = "USD"): Promise<GoldPriceData> {
  try {
    // In a real implementation, you would use your actual API endpoint and key
    // For demonstration, we'll simulate an API response

    // Uncomment and modify this code when you have a real API key
    /*
    const response = await fetch(`${API_CONFIG.endpoint}?currency=${currency}`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
    */

    // Simulated response for demonstration
    return simulateGoldPriceResponse(currency)
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
  // Gold purity factors
  const purityFactors = {
    "18K": 0.75, // 18K gold is 75% pure
    "22K": 0.9167, // 22K gold is 91.67% pure
    "24K": 0.9999, // 24K gold is 99.99% pure (essentially pure gold)
  }

  // Convert from troy ounce to gram (1 troy oz = 31.1034768 grams)
  const goldPricePerGram = goldPricePerOz / 31.1034768

  // Calculate buy and sell prices with a small spread
  // Typically, sell prices are lower than buy prices
  const spread = 0.05 // 5% spread between buy and sell

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

/**
 * Simulates a gold price API response for demonstration
 * In production, replace this with actual API calls
 */
function simulateGoldPriceResponse(currency: string): GoldPriceData {
  // Base gold price in USD per troy ounce (approximate market value)
  const baseGoldPrice = 2300 + (Math.random() * 100 - 50) // Random fluctuation

  // Simple currency conversion factors (for demonstration only)
  const conversionRates: Record<string, number> = {
    USD: 1,
    SAR: 3.75,
    EGP: 48.5,
  }

  const rate = conversionRates[currency] || 1

  return {
    timestamp: Date.now(),
    currency: currency,
    rates: {
      XAU: baseGoldPrice * rate,
    },
  }
}
