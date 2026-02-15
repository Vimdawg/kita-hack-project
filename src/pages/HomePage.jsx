import { useNavigate } from 'react-router-dom'
import { ScanLine, Map, FileText, Users, CloudSun, Leaf, ArrowRight, Bot } from 'lucide-react'
import './HomePage.css'

const features = [
  {
    id: 'scan',
    path: '/scan',
    icon: ScanLine,
    title: 'Crop Scanner',
    description: 'AI-powered disease diagnosis — works offline',
    color: '#06D6A0',
    bgGlow: 'rgba(6, 214, 160, 0.12)',
  },
  {
    id: 'farm',
    path: '/farm',
    icon: Map,
    title: 'My Farm',
    description: 'Geospatial dashboard with weather overlay',
    color: '#118AB2',
    bgGlow: 'rgba(17, 138, 178, 0.12)',
  },
  {
    id: 'subsidies',
    path: '/subsidies',
    icon: FileText,
    title: 'Subsidies',
    description: 'Navigate B40 grants & auto-fill forms',
    color: '#E9C46A',
    bgGlow: 'rgba(233, 196, 106, 0.12)',
  },
  {
    id: 'ai',
    path: '/ai',
    icon: Bot,
    title: 'FarmGPT AI',
    description: 'Ask Gemini AI for expert farming advice',
    color: '#A855F7',
    bgGlow: 'rgba(168, 85, 247, 0.12)',
  },
  {
    id: 'community',
    path: '/community',
    icon: Users,
    title: 'Community',
    description: 'Learn from farmers with similar conditions',
    color: '#E07A5F',
    bgGlow: 'rgba(224, 122, 95, 0.12)',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero animate-fade-in">
        <div className="hero-badge">
          <Leaf size={14} />
          <span>Smart Farming Assistant</span>
        </div>
        <h1 className="hero-title">
          Farm<span className="text-accent">GPT</span>
        </h1>
        <p className="hero-subtitle">
          AI-powered crop management for Malaysian smallholders
        </p>
      </section>

      {/* Weather Quick Card */}
      <section className="weather-card glass-card animate-fade-in-delay-1" id="weather-widget">
        <div className="weather-left">
          <CloudSun size={28} className="weather-icon" />
          <div>
            <p className="weather-temp">31°C</p>
            <p className="weather-desc">Partly Cloudy</p>
          </div>
        </div>
        <div className="weather-right">
          <div className="weather-stat">
            <span className="weather-stat-label">Humidity</span>
            <span className="weather-stat-value">78%</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Rain</span>
            <span className="weather-stat-value">40%</span>
          </div>
        </div>
      </section>

      {/* Quick Scan CTA */}
      <button
        className="quick-scan-btn animate-fade-in-delay-2"
        id="quick-scan-btn"
        onClick={() => navigate('/scan')}
      >
        <div className="scan-btn-content">
          <div className="scan-btn-icon">
            <ScanLine size={24} />
          </div>
          <div className="scan-btn-text">
            <span className="scan-btn-title">Quick Crop Scan</span>
            <span className="scan-btn-desc">Snap a photo for instant diagnosis</span>
          </div>
        </div>
        <ArrowRight size={20} className="scan-btn-arrow" />
      </button>

      {/* Feature Cards */}
      <section className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              id={`feature-${feature.id}`}
              className={`feature-card glass-card animate-fade-in-delay-${index + 1}`}
              onClick={() => navigate(feature.path)}
              style={{ '--feature-color': feature.color, '--feature-glow': feature.bgGlow }}
            >
              <div className="feature-icon-wrapper">
                <Icon size={24} />
              </div>
              <div className="feature-info">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <ArrowRight size={16} className="feature-arrow" />
            </button>
          )
        })}
      </section>
    </div>
  )
}
