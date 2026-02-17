/**
 * Open-Meteo Weather Integration for FarmGPT
 *
 * Fetches real weather data for Malaysian farm locations.
 * Uses Open-Meteo — 100% free, no API key, no rate limits.
 * https://open-meteo.com/
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Default: Kuala Lumpur area (matches demo farm coordinates)
const DEFAULT_LAT = 3.139
const DEFAULT_LON = 101.687

// ── WMO Weather Code → description & icon mapping ────────
const WMO_CODES = {
  0: { desc: 'Clear Sky', icon: 'sun' },
  1: { desc: 'Mostly Clear', icon: 'sun' },
  2: { desc: 'Partly Cloudy', icon: 'cloud-sun' },
  3: { desc: 'Overcast', icon: 'cloud' },
  45: { desc: 'Foggy', icon: 'cloud' },
  48: { desc: 'Freezing Fog', icon: 'cloud' },
  51: { desc: 'Light Drizzle', icon: 'cloud-rain' },
  53: { desc: 'Drizzle', icon: 'cloud-rain' },
  55: { desc: 'Heavy Drizzle', icon: 'cloud-rain' },
  61: { desc: 'Light Rain', icon: 'cloud-rain' },
  63: { desc: 'Rain', icon: 'cloud-rain' },
  65: { desc: 'Heavy Rain', icon: 'cloud-rain' },
  71: { desc: 'Light Snow', icon: 'cloud' },
  73: { desc: 'Snow', icon: 'cloud' },
  75: { desc: 'Heavy Snow', icon: 'cloud' },
  80: { desc: 'Rain Showers', icon: 'cloud-rain' },
  81: { desc: 'Heavy Showers', icon: 'cloud-rain' },
  82: { desc: 'Violent Showers', icon: 'cloud-rain' },
  95: { desc: 'Thunderstorm', icon: 'cloud-rain' },
  96: { desc: 'Thunderstorm + Hail', icon: 'cloud-rain' },
  99: { desc: 'Severe Thunderstorm', icon: 'cloud-rain' },
}

function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: 'Unknown', icon: 'cloud' }
}

// ── Day name helper ──────────────────────────────────────
function getDayLabel(dateStr, index) {
  if (index === 0) return 'Today'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// ── Determine alert level from weather ───────────────────
function getAlertLevel(rainProbability, weatherCode) {
  if (weatherCode >= 95 || rainProbability >= 80) return 'danger'
  if (weatherCode >= 61 || rainProbability >= 60) return 'warning'
  return null
}

// ── Generate weather advisory text ───────────────────────
function generateAdvisory(forecast) {
  const rainyDays = forecast.filter((d) => d.alert)
  const clearDays = forecast.filter((d) => !d.alert)

  if (rainyDays.length === 0) {
    return 'Good weather conditions all week. Suitable for spraying, fertilizer application, and harvesting operations.'
  }

  const rainyNames = rainyDays.map((d) => d.day).join(', ')
  const clearNames = clearDays.filter((d) => d.day !== 'Today').map((d) => d.day).join(', ')

  let advisory = `Heavy rain expected ${rainyNames}. Consider delaying fertilizer application and pausing tapping operations.`
  if (clearNames) {
    advisory += ` Optimal spray window: ${clearNames}.`
  }
  return advisory
}

// ── Generate weather-based alerts ────────────────────────
function generateAlerts(forecast, current) {
  const alerts = []

  // Thunderstorm warning
  const stormDays = forecast.filter((d) => d.alert === 'danger')
  if (stormDays.length > 0) {
    alerts.push({
      id: 'storm',
      type: 'danger',
      title: 'Thunderstorm Warning',
      description: `Heavy rainfall expected ${stormDays.map((d) => d.day).join(', ')}. Secure loose equipment and check drainage channels.`,
      time: `${stormDays[0].day} • MetMalaysia`,
    })
  }

  // Heavy rain warning
  const rainyDays = forecast.filter((d) => d.alert === 'warning')
  if (rainyDays.length > 0 && stormDays.length === 0) {
    alerts.push({
      id: 'rain',
      type: 'warning',
      title: 'Heavy Rain Expected',
      description: `Rain forecast for ${rainyDays.map((d) => d.day).join(', ')}. Delay pesticide spraying for better effectiveness.`,
      time: `${rainyDays[0].day} • Open-Meteo`,
    })
  }

  // Optimal spray window
  const clearWindow = forecast.filter((d) => !d.alert && d.day !== 'Today')
  if (clearWindow.length > 0) {
    alerts.push({
      id: 'spray-window',
      type: 'info',
      title: 'Optimal Spray Window',
      description: `${clearWindow.map((d) => d.day).join(', ')}: Clear skies expected. Good for spraying or fertilizer application.`,
      time: `${clearWindow[0].day} • FarmGPT`,
    })
  }

  // High humidity disease risk
  if (current.humidity >= 85) {
    alerts.push({
      id: 'humidity',
      type: 'warning',
      title: 'High Humidity — Disease Risk',
      description: `Humidity at ${current.humidity}%. Increased risk of fungal diseases (Ganoderma, Rice Blast). Monitor crops closely.`,
      time: 'Now • FarmGPT',
    })
  }

  return alerts
}

// ── Fetch Current + 5-Day Forecast ───────────────────────
/**
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{current, forecast[], advisory, alerts[]}>}
 */
export async function fetchWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,precipitation_probability_max',
    timezone: 'Asia/Kuala_Lumpur',
    forecast_days: '5',
  })

  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`)

  const data = await response.json()

  // Parse current conditions
  const weatherInfo = getWeatherInfo(data.current.weather_code)
  const current = {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    rainChance: data.current.precipitation_probability ?? 0,
    description: weatherInfo.desc,
    icon: weatherInfo.icon,
  }

  // Parse 5-day forecast
  const forecast = data.daily.time.map((date, i) => {
    const dayWeather = getWeatherInfo(data.daily.weather_code[i])
    const rainProb = data.daily.precipitation_probability_max[i] ?? 0
    return {
      day: getDayLabel(date, i),
      date,
      temp: `${Math.round(data.daily.temperature_2m_max[i])}°C`,
      rain: `${rainProb}%`,
      rainValue: rainProb,
      desc: dayWeather.desc,
      icon: dayWeather.icon,
      alert: getAlertLevel(rainProb, data.daily.weather_code[i]),
    }
  })

  const advisory = generateAdvisory(forecast)
  const alerts = generateAlerts(forecast, current)

  return { current, forecast, advisory, alerts }
}
