# 🌾 FarmGPT — Smart Farming Assistant

> AI-powered crop management PWA for Malaysian B40 smallholders.

FarmGPT is a mobile-first Progressive Web App that gives Malaysian farmers offline crop disease diagnosis, a geospatial farm dashboard, government subsidy navigation, community knowledge sharing, and conversational AI advice powered by Google Gemini.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🔬 Crop Scanner** | Offline-first image-based disease diagnosis for Oil Palm, Paddy, Rubber & Cocoa (Edge AI) |
| **🗺️ My Farm** | Interactive Leaflet map with farm boundaries, pest-pressure overlays & weather forecasts |
| **📋 Subsidy Navigator** | Browse Malaysian B40 grants (KPKM, MDEC, MARDI, FELDA), OCR-scan NRIC/Land Titles & auto-fill forms |
| **👥 Community** | Anonymized success stories filtered by region, soil type & crop |
| **🤖 FarmGPT AI** | Conversational Gemini AI — multimodal (image + text), weather synthesis for precision spraying advice, Malay dialect support |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Tailwind CSS 4 |
| Build | Vite 7 |
| PWA | vite-plugin-pwa + Workbox (offline caching & service workers) |
| Maps | Leaflet + React-Leaflet |
| Icons | Lucide React |
| AI | Google Gemini API (gemini-2.0-flash) |
| Routing | React Router v7 |

---

## 📁 Project Structure

```
kita-hack-project/
├── index.html              # App entry point
├── vite.config.js          # Vite + PWA + Tailwind config
├── package.json
├── .env                    # VITE_GEMINI_API_KEY (git-ignored)
├── PRD.txt                 # Product Requirements Document
└── src/
    ├── main.jsx            # React root + BrowserRouter
    ├── App.jsx             # Route definitions
    ├── index.css           # Design system (dark theme, glass cards, animations)
    ├── components/
    │   ├── BottomNav.jsx   # 6-tab navigation bar
    │   └── DiagnosisCard.jsx  # Scan result card with "Get AI Advice" link
    ├── pages/
    │   ├── HomePage.jsx    # Dashboard with weather widget & feature cards
    │   ├── ScanPage.jsx    # Camera/upload → crop disease diagnosis
    │   ├── FarmPage.jsx    # Leaflet map with farm polygons & pest zones
    │   ├── SubsidyPage.jsx # Subsidy list, detail, OCR scanner & application form
    │   ├── CommunityPage.jsx  # Success stories feed with filters
    │   └── GeminiPage.jsx  # Gemini AI chat interface (text + image)
    └── utils/
        ├── diagnose.js     # Mock disease diagnosis engine (swap for TF.js)
        └── gemini.js       # Gemini API client (chat, vision, weather synthesis)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Gemini API key** (free) — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/kita-hack-project.git
cd kita-hack-project

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
cp .env.example .env
# Edit .env and paste your key:
#   VITE_GEMINI_API_KEY=AIzaSy...

# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser (or scan the QR code on mobile).

### Build for Production

```bash
npm run build    # Output → dist/
npm run preview  # Preview the production build locally
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Yes (for AI features) | Google Gemini API key. If not set, users can enter their key manually in the AI page settings. |

> **Note:** The `.env` file is git-ignored. Your API key is never committed to the repository.

---

## 📱 PWA & Offline Support

FarmGPT is a fully installable PWA:

- **Add to Home Screen** — works like a native app on Android & iOS
- **Offline caching** — Workbox service worker pre-caches assets and fonts
- **Crop Scanner** — designed for offline-first diagnosis (current demo uses mock data; swap `diagnose.js` internals for a real TensorFlow.js model with zero UI changes)

---

## 🤖 Gemini AI Integration

The AI layer (`src/utils/gemini.js`) provides three capabilities:

1. **`sendMessage(history, text)`** — Text chat with agricultural system prompt & Malay dialect support
2. **`analyzeImage(file, prompt)`** — Multimodal crop image analysis (disease ID, treatment plans)
3. **`getWeatherAdvice(weather, crop, location)`** — Weather synthesis for precision spray/fertilizer timing

The system prompt is pre-configured for Malaysian farming context (oil palm, paddy, rubber, cocoa), local soil types, and MARDI/KPKM subsidy knowledge.

---

## 🎨 Design System

- **Dark theme** with green accent — designed for outdoor visibility
- **Glass-card** UI pattern with backdrop blur
- **Animations** — `fadeInUp`, `pulse-glow`, `shimmer`
- **Mobile-first** — max 480px content width, safe-area insets, touch-optimized

---

## 🗺️ Roadmap

- [ ] Real TensorFlow.js model for offline crop diagnosis
- [ ] Firebase backend for user accounts & data persistence
- [ ] MetMalaysia API integration for live weather data
- [ ] OCR via Gemini Vision (replace simulated OCR)
- [ ] Push notifications for subsidy deadlines & weather alerts
- [ ] Multi-language toggle (BM / English / regional dialects)

---

## 🏗️ Built For

**Kita Hack 2026** — A hackathon project targeting Malaysian B40 smallholders, aiming to increase crop yields by 15% and reduce fertilizer waste by 8-12% through AI-powered precision agriculture.

---

## 📄 License

This project is for educational and hackathon demonstration purposes.
