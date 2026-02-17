import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Circle, Popup, useMap } from 'react-leaflet'
import {
  MapPin, Plus, Trash2, CloudRain, CloudSun, Cloud, Sun, Droplets,
  Wind, Thermometer, Bug, AlertTriangle, Eye, EyeOff, Layers, Navigation, Loader2
} from 'lucide-react'
import { fetchWeather } from '../utils/weather'
import 'leaflet/dist/leaflet.css'
import './FarmPage.css'

const WEATHER_ICONS = { 'sun': Sun, 'cloud-sun': CloudSun, 'cloud': Cloud, 'cloud-rain': CloudRain }

// ── Malaysian Farm Locations (Demo Data) ──────────────────
const DEMO_FARMS = [
  {
    id: 1,
    name: 'My Oil Palm Plot',
    crop: 'Oil Palm 🌴',
    area: '4.2 hectares',
    coordinates: [
      [3.1390, 101.6869],
      [3.1410, 101.6869],
      [3.1410, 101.6899],
      [3.1390, 101.6899],
    ],
    center: [3.1400, 101.6884],
    color: '#2D6A4F',
    soilType: 'Laterite (Serdang Series)',
    lastScan: '2 days ago',
    health: 'good',
  },
  {
    id: 2,
    name: 'Paddy Field (Lot B)',
    crop: 'Paddy Rice 🌾',
    area: '2.8 hectares',
    coordinates: [
      [3.1360, 101.6840],
      [3.1375, 101.6840],
      [3.1375, 101.6865],
      [3.1360, 101.6865],
    ],
    center: [3.1368, 101.6853],
    color: '#118AB2',
    soilType: 'Alluvial (Briah Series)',
    lastScan: '5 days ago',
    health: 'warning',
  },
]

// ── Pest Pressure Zones ──────────────────────────────────
const PEST_ZONES = [
  {
    id: 'pest-1',
    center: [3.1395, 101.6875],
    radius: 120,
    severity: 'high',
    pest: 'Ganoderma (BSR)',
    reports: 3,
    color: 'rgba(230, 57, 70, 0.25)',
    borderColor: '#E63946',
  },
  {
    id: 'pest-2',
    center: [3.1365, 101.6850],
    radius: 80,
    severity: 'medium',
    pest: 'Rice Blast',
    reports: 1,
    color: 'rgba(255, 209, 102, 0.2)',
    borderColor: '#FFD166',
  },
]

// Weather forecast is now fetched live from Open-Meteo

// ── Map Recenter Component ────────────────────────────────
function FlyToFarm({ center }) {
  const map = useMap()
  if (center) {
    map.flyTo(center, 16, { duration: 1 })
  }
  return null
}

export default function FarmPage() {
  const [showPestOverlay, setShowPestOverlay] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [activeTab, setActiveTab] = useState('farms') // 'farms' | 'weather' | 'alerts'
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    // Fetch weather for default farm area (KL)
    fetchWeather(3.139, 101.687)
      .then(setWeather)
      .catch((err) => console.warn('Weather fetch failed:', err))
      .finally(() => setWeatherLoading(false))
  }, [])

  const handleFarmSelect = useCallback((farm) => {
    setSelectedFarm(farm)
    setFlyTarget(farm.center)
  }, [])

  const alertCount = weather ? weather.alerts.length + 1 : 1 // +1 for pest alert

  return (
    <div className="farm-page">
      {/* Map */}
      <div className="map-container" id="farm-map">
        <MapContainer
          center={[3.1390, 101.6870]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <FlyToFarm center={flyTarget} />

          {/* Farm Boundaries */}
          {DEMO_FARMS.map((farm) => (
            <Polygon
              key={farm.id}
              positions={farm.coordinates}
              pathOptions={{
                color: farm.color,
                fillColor: farm.color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: selectedFarm?.id === farm.id ? '' : '6 4',
              }}
              eventHandlers={{
                click: () => handleFarmSelect(farm),
              }}
            >
              <Popup className="farm-popup">
                <div className="popup-content">
                  <h4>{farm.name}</h4>
                  <p>{farm.crop} • {farm.area}</p>
                  <p className="popup-soil">Soil: {farm.soilType}</p>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Pest Pressure Overlays */}
          {showPestOverlay &&
            PEST_ZONES.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: zone.borderColor,
                  fillColor: zone.color,
                  fillOpacity: 0.35,
                  weight: 1.5,
                  dashArray: '4 3',
                }}
              >
                <Popup className="farm-popup">
                  <div className="popup-content">
                    <h4>⚠️ {zone.pest}</h4>
                    <p>Severity: <strong>{zone.severity}</strong></p>
                    <p>{zone.reports} report(s) nearby</p>
                  </div>
                </Popup>
              </Circle>
            ))}
        </MapContainer>

        {/* Map Overlay Controls */}
        <div className="map-overlay-controls">
          <button
            className={`map-control-btn ${showPestOverlay ? 'active' : ''}`}
            onClick={() => setShowPestOverlay(!showPestOverlay)}
            title="Toggle pest pressure"
          >
            <Bug size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="farm-panel">
        {/* Tab Bar */}
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activeTab === 'farms' ? 'active' : ''}`}
            onClick={() => setActiveTab('farms')}
          >
            <Layers size={16} />
            <span>My Farms</span>
          </button>
          <button
            className={`panel-tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <CloudSun size={16} />
            <span>Weather</span>
          </button>
          <button
            className={`panel-tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle size={16} />
            <span>Alerts</span>
            {alertCount > 0 && <span className="alert-count">{alertCount}</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="panel-content">
          {/* ── Farms Tab ────────────────── */}
          {activeTab === 'farms' && (
            <div className="farms-list">
              {DEMO_FARMS.map((farm) => (
                <button
                  key={farm.id}
                  className={`farm-item glass-card ${selectedFarm?.id === farm.id ? 'selected' : ''}`}
                  onClick={() => handleFarmSelect(farm)}
                >
                  <div className="farm-item-header">
                    <div className="farm-color-dot" style={{ background: farm.color }} />
                    <div className="farm-item-info">
                      <h4>{farm.name}</h4>
                      <p>{farm.crop} • {farm.area}</p>
                    </div>
                    <Navigation size={16} className="farm-nav-icon" />
                  </div>
                  <div className="farm-item-details">
                    <span className="farm-detail">
                      <MapPin size={12} />
                      {farm.soilType}
                    </span>
                    <span className={`badge ${farm.health === 'good' ? 'badge-success' : 'badge-warning'}`}>
                      {farm.health === 'good' ? '● Healthy' : '● Needs Attention'}
                    </span>
                  </div>
                </button>
              ))}

              <button className="add-farm-btn glass-card" id="add-farm-btn">
                <Plus size={20} />
                <span>Add New Farm Plot</span>
              </button>
            </div>
          )}

          {/* ── Weather Tab ──────────────── */}
          {activeTab === 'weather' && (
            <div className="weather-forecast-list">
              {weatherLoading ? (
                <div className="weather-loading-panel">
                  <Loader2 size={24} className="spin" />
                  <span>Loading weather…</span>
                </div>
              ) : weather ? (
                <>
                  {/* Current Conditions */}
                  <div className="weather-current glass-card">
                    <div className="weather-current-left">
                      <Thermometer size={20} className="weather-current-icon" />
                      <div>
                        <p className="weather-current-temp">{weather.current.temperature}°C</p>
                        <p className="weather-current-desc">{weather.current.description}</p>
                      </div>
                    </div>
                    <div className="weather-current-stats">
                      <div className="weather-mini-stat">
                        <Droplets size={14} />
                        <span>{weather.current.humidity}%</span>
                      </div>
                      <div className="weather-mini-stat">
                        <Wind size={14} />
                        <span>{weather.current.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Day Forecast */}
                  <h4 className="forecast-title">5-Day Forecast</h4>
                  <div className="forecast-cards">
                    {weather.forecast.map((day) => {
                      const Icon = WEATHER_ICONS[day.icon] || CloudSun
                      const rainPct = parseInt(day.rain)
                      const alertClass = rainPct >= 70 ? 'forecast-alert-danger' : rainPct >= 50 ? 'forecast-alert-warning' : ''
                      return (
                        <div key={day.day} className={`forecast-card glass-card ${alertClass}`}>
                          <span className="forecast-day">{day.day}</span>
                          <Icon size={20} className="forecast-icon" />
                          <span className="forecast-temp">{day.temp}</span>
                          <div className="forecast-rain">
                            <Droplets size={10} />
                            <span>{day.rain}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Weather Advisory */}
                  <div className="weather-advisory glass-card">
                    <AlertTriangle size={16} className="advisory-icon" />
                    <div>
                      <h5>Weather Advisory</h5>
                      <p>{weather.advisory}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="weather-loading-panel">
                  <CloudSun size={24} />
                  <span>Weather data unavailable</span>
                </div>
              )}
            </div>
          )}

          {/* ── Alerts Tab ───────────────── */}
          {activeTab === 'alerts' && (
            <div className="alerts-list">
              {/* Dynamic weather alerts */}
              {weather?.alerts.map((alert, idx) => {
                const severity = alert.type === 'storm' ? 'danger' : alert.type === 'rain' ? 'warning' : 'info'
                const AlertIcon = alert.type === 'storm' ? AlertTriangle : alert.type === 'rain' ? CloudRain : CloudSun
                return (
                  <div key={`weather-${idx}`} className={`alert-item glass-card alert-${severity}`}>
                    <div className="alert-item-icon">
                      <AlertIcon size={18} />
                    </div>
                    <div className="alert-item-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.message}</p>
                      <span className="alert-time">Open-Meteo • FarmGPT</span>
                    </div>
                  </div>
                )
              })}

              {/* Persistent pest alert */}
              <div className="alert-item glass-card alert-warning">
                <div className="alert-item-icon">
                  <Bug size={18} />
                </div>
                <div className="alert-item-content">
                  <h4>Ganoderma Alert — Nearby Plots</h4>
                  <p>3 Basal Stem Rot cases reported within 500m of your oil palm plot. Inspect trunk bases for fungal brackets.</p>
                  <span className="alert-time">Today • MARDI Regional</span>
                </div>
              </div>

              {(!weather || weather.alerts.length === 0) && (
                <div className="alert-item glass-card alert-info">
                  <div className="alert-item-icon">
                    <CloudSun size={18} />
                  </div>
                  <div className="alert-item-content">
                    <h4>No Weather Alerts</h4>
                    <p>Conditions look clear. Good time for field operations.</p>
                    <span className="alert-time">FarmGPT</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
