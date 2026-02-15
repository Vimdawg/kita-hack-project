/**
 * Gemini AI Integration Layer for FarmGPT
 *
 * Provides conversational, expert agricultural advice powered by
 * Google's Gemini AI. Supports:
 *  - Text-based chat with regional Malay dialect support
 *  - Multimodal image + text analysis (crop diseases, subsidies, manuals)
 *  - Weather synthesis for precision pesticide/fertilizer advice
 *
 * API Key priority: VITE_GEMINI_API_KEY env var → localStorage fallback.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL_TEXT = 'gemini-2.0-flash'
const MODEL_VISION = 'gemini-2.0-flash'

// ── System Prompt ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are FarmGPT AI — a friendly, expert agricultural advisor for Malaysian smallholders (B40 farmers).

Your responsibilities:
1. Provide clear, actionable crop health advice for Oil Palm, Paddy Rice, Rubber, and Cocoa.
2. Support Bahasa Malaysia and regional dialects (Kedah, Kelantan, Terengganu, Johor, Sabah, Sarawak). Always respond in the same language the user writes in.
3. When analyzing crop images, identify diseases and give step-by-step treatment plans with locally available products.
4. Synthesize weather data with pesticide/fertilizer application windows — give "Precision Advice" on optimal spray timing.
5. Help farmers understand government subsidies (KPKM, MDEC, MARDI, FELDA) and guide them through application steps.
6. Be concise but thorough. Use bullet points and numbered steps. Avoid jargon — explain in simple terms.
7. Always mention when a farmer should consult MARDI extension officers for serious issues.
8. Consider local soil types (Laterite, Alluvial, Peat) and micro-climates when giving advice.

Current context: You are embedded in a mobile farming app used across rural Malaysia. Many users have limited data connectivity. Keep responses focused and practical.`

// ── API Key Management ─────────────────────────────────────
// Env var takes priority, localStorage is a fallback for runtime override
export function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('farmgpt_gemini_key') || ''
}

export function setApiKey(key) {
  localStorage.setItem('farmgpt_gemini_key', key)
}

export function hasApiKey() {
  return !!getApiKey()
}

export function isKeyFromEnv() {
  return !!import.meta.env.VITE_GEMINI_API_KEY
}

// ── Convert File to Base64 ─────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Chat (Text Only) ──────────────────────────────────────
/**
 * Send a text message to Gemini and get a response.
 * @param {Array<{role: string, parts: Array}>} history - Conversation history
 * @param {string} userMessage - The user's new message
 * @returns {Promise<string>} The AI response text
 */
export async function sendMessage(history, userMessage) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key not set. Please add your Gemini API key in settings.')

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am FarmGPT AI, ready to help Malaysian farmers with crop advice, disease diagnosis, weather-based precision guidance, and subsidy navigation. How can I help you today?' }] },
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const response = await fetch(
    `${GEMINI_API_URL}/${MODEL_TEXT}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
}

// ── Multimodal (Image + Text) ─────────────────────────────
/**
 * Send an image with a text prompt to Gemini for multimodal analysis.
 * @param {File} imageFile - The image file to analyze
 * @param {string} prompt - Text prompt describing what to analyze
 * @param {Array<{role: string, parts: Array}>} history - Optional conversation history
 * @returns {Promise<string>} The AI response text
 */
export async function analyzeImage(imageFile, prompt, history = []) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key not set. Please add your Gemini API key in settings.')

  const base64Data = await fileToBase64(imageFile)
  const mimeType = imageFile.type || 'image/jpeg'

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am FarmGPT AI, ready to analyze crop images and provide expert advice.' }] },
    ...history,
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: prompt || 'Analyze this crop image. Identify any diseases, pests, or nutrient deficiencies. Provide treatment recommendations using locally available products in Malaysia.' },
      ],
    },
  ]

  const response = await fetch(
    `${GEMINI_API_URL}/${MODEL_VISION}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1500,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze the image.'
}

// ── Weather Synthesis (Precision Advice) ──────────────────
/**
 * Generate precision farming advice by correlating weather data
 * with crop management practices.
 * @param {object} weatherData - Weather conditions object
 * @param {string} cropType - The crop type
 * @param {string} farmLocation - Location/region of the farm
 * @returns {Promise<string>} Precision advice text
 */
export async function getWeatherAdvice(weatherData, cropType, farmLocation) {
  const weatherContext = `
Current Weather Conditions for ${farmLocation}:
- Temperature: ${weatherData.temperature || '30°C'}
- Humidity: ${weatherData.humidity || '75%'}
- Rain Probability: ${weatherData.rainChance || '40%'}
- Wind Speed: ${weatherData.windSpeed || '10 km/h'}
- Forecast: ${weatherData.forecast || 'Partly cloudy with afternoon showers'}

5-Day Outlook: ${weatherData.fiveDayOutlook || 'Rain expected Tuesday-Wednesday, clearing Thursday-Friday'}
`

  const prompt = `Based on the following weather data, provide Precision Advice for a ${cropType} farmer in ${farmLocation}, Malaysia.

${weatherContext}

Please advise on:
1. Is it safe to apply pesticides/fungicides today? If not, when is the optimal window?
2. Should fertilizer application be delayed? 
3. Any weather-related disease risks to watch for?
4. Recommended actions for the next 48 hours.

Keep the advice practical and concise.`

  return sendMessage([], prompt)
}

// ── Quick Prompts (Pre-built queries for common scenarios) ─
export const QUICK_PROMPTS = [
  {
    id: 'disease',
    emoji: '🔬',
    label: 'Diagnose Disease',
    prompt: 'I want to diagnose a crop disease. What symptoms should I describe or can I send a photo?',
  },
  {
    id: 'weather',
    emoji: '🌤️',
    label: 'Weather Advice',
    prompt: 'Based on current weather conditions, should I spray pesticides or apply fertilizer today? The weather is partly cloudy with 40% rain chance.',
  },
  {
    id: 'subsidy',
    emoji: '📋',
    label: 'Subsidy Help',
    prompt: 'Help me understand the B40 subsidy application process. What documents do I need and what are the current deadlines?',
  },
  {
    id: 'soil',
    emoji: '🌱',
    label: 'Soil Advice',
    prompt: 'What is the best fertilizer schedule for laterite soil in Selangor for oil palm cultivation?',
  },
  {
    id: 'malay',
    emoji: '🇲🇾',
    label: 'Tanya BM',
    prompt: 'Saya nak tanya tentang penyakit kelapa sawit. Macam mana nak kenal pasti Ganoderma dan apa tindakan yang perlu diambil?',
  },
  {
    id: 'market',
    emoji: '💰',
    label: 'Market Prices',
    prompt: 'What are the current CPO (Crude Palm Oil) market trends and how should smallholders plan their harvesting?',
  },
]
