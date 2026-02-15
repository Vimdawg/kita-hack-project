import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Circle, Popup, useMap } from 'react-leaflet'
import {
  MapPin, Plus, Trash2, CloudRain, CloudSun, Cloud, Droplets,
  Wind, Thermometer, Bug, AlertTriangle, Eye, EyeOff, Layers, Navigation
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './FarmPage.css'

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

// ── Weather Forecast Data ────────────────────────────────
const WEATHER_FORECAST = [
  { day: 'Today', icon: CloudSun, temp: '31°C', rain: '40%', desc: 'Partly Cloudy', alert: null },
  { day: 'Tue', icon: CloudRain, temp: '28°C', rain: '80%', desc: 'Heavy Rain', alert: 'warning' },
  { day: 'Wed', icon: CloudRain, temp: '27°C', rain: '70%', desc: 'Thunderstorm', alert: 'danger' },
  { day: 'Thu', icon: Cloud, temp: '30°C', rain: '30%', desc: 'Cloudy', alert: null },
  { day: 'Fri', icon: CloudSun, temp: '32°C', rain: '15%', desc: 'Mostly Sunny', alert: null },
]

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

  const handleFarmSelect = useCallback((farm) => {
    setSelectedFarm(farm)
    setFlyTarget(farm.center)
  }, [])

  const alertCount = WEATHER_FORECAST.filter((w) => w.alert).length

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
              {/* Current Conditions */}
              <div className="weather-current glass-card">
                <div className="weather-current-left">
                  <Thermometer size={20} className="weather-current-icon" />
                  <div>
                    <p className="weather-current-temp">31°C</p>
                    <p className="weather-current-desc">Partly Cloudy</p>
                  </div>
                </div>
                <div className="weather-current-stats">
                  <div className="weather-mini-stat">
                    <Droplets size={14} />
                    <span>78%</span>
                  </div>
                  <div className="weather-mini-stat">
                    <Wind size={14} />
                    <span>12 km/h</span>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast */}
              <h4 className="forecast-title">5-Day Forecast</h4>
              <div className="forecast-cards">
                {WEATHER_FORECAST.map((day) => {
                  const Icon = day.icon
                  return (
                    <div key={day.day} className={`forecast-card glass-card ${day.alert ? 'forecast-alert-' + day.alert : ''}`}>
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
                  <p>Heavy rain expected Tue-Wed. Consider delaying fertilizer application and pausing tapping operations.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Alerts Tab ───────────────── */}
          {activeTab === 'alerts' && (
            <div className="alerts-list">
              <div className="alert-item glass-card alert-danger">
                <div className="alert-item-icon">
                  <AlertTriangle size={18} />
                </div>
                <div className="alert-item-content">
                  <h4>Thunderstorm Warning</h4>
                  <p>Heavy rainfall (60-80mm) expected Wednesday. Secure loose equipment and check drainage channels.</p>
                  <span className="alert-time">Wed, Feb 17 • MetMalaysia</span>
                </div>
              </div>

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

              <div className="alert-item glass-card alert-info">
                <div className="alert-item-icon">
                  <CloudRain size={18} />
                </div>
                <div className="alert-item-content">
                  <h4>No-Action Weather Window</h4>
                  <p>Thursday-Friday: Clear skies. Optimal for spraying or fertilizer application.</p>
                  <span className="alert-time">Thu-Fri • FarmGPT</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
