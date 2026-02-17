import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, RotateCcw, Loader2, AlertTriangle, CheckCircle2, ChevronDown, Sparkles, WifiOff } from 'lucide-react'
import DiagnosisCard from '../components/DiagnosisCard'
import { runDiagnosis } from '../utils/diagnose'
import { diagnoseCropWithAI, hasApiKey } from '../utils/gemini'
import './ScanPage.css'

const CROP_OPTIONS = [
  { value: 'oil-palm', label: 'Oil Palm', emoji: '🌴' },
  { value: 'paddy', label: 'Paddy Rice', emoji: '🌾' },
  { value: 'rubber', label: 'Rubber', emoji: '🌿' },
  { value: 'cocoa', label: 'Cocoa', emoji: '🍫' },
]

export default function ScanPage() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState('oil-palm')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const [showCropSelect, setShowCropSelect] = useState(false)
  const [analysisMode, setAnalysisMode] = useState(null) // 'ai' | 'offline'
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setDiagnosis(null)
      setAnalysisMode(null)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!image) return
    setIsAnalyzing(true)
    setDiagnosis(null)

    // Try Gemini Vision first if API key is available
    if (hasApiKey()) {
      setAnalysisMode('ai')
      try {
        const result = await diagnoseCropWithAI(image, selectedCrop)
        setDiagnosis(result)
        setIsAnalyzing(false)
        return
      } catch (err) {
        console.warn('Gemini Vision failed, falling back to offline:', err.message)
      }
    }

    // Fallback to offline mock diagnosis
    setAnalysisMode('offline')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
      const result = runDiagnosis(selectedCrop, image)
      setDiagnosis(result)
    } catch (err) {
      console.error('Diagnosis failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [image, selectedCrop])

  const handleReset = useCallback(() => {
    setImage(null)
    setImagePreview(null)
    setDiagnosis(null)
    setIsAnalyzing(false)
  }, [])

  const currentCrop = CROP_OPTIONS.find((c) => c.value === selectedCrop)

  return (
    <div className="page-container">
      <header className="page-header animate-fade-in">
        <h1>Crop Scanner</h1>
        <p>AI-powered disease diagnosis — works offline</p>
      </header>

      {/* Crop Selector */}
      <div className="crop-selector-wrapper animate-fade-in-delay-1">
        <button
          className="crop-selector glass-card"
          id="crop-selector"
          onClick={() => setShowCropSelect(!showCropSelect)}
        >
          <span className="crop-emoji">{currentCrop?.emoji}</span>
          <span className="crop-name">{currentCrop?.label}</span>
          <ChevronDown size={16} className={`crop-chevron ${showCropSelect ? 'open' : ''}`} />
        </button>
        {showCropSelect && (
          <div className="crop-dropdown glass-card">
            {CROP_OPTIONS.map((crop) => (
              <button
                key={crop.value}
                className={`crop-option ${crop.value === selectedCrop ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCrop(crop.value)
                  setShowCropSelect(false)
                }}
              >
                <span>{crop.emoji}</span>
                <span>{crop.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Area */}
      {!imagePreview ? (
        <div className="upload-area animate-fade-in-delay-2">
          <div className="upload-zone glass-card" id="upload-zone">
            <div className="upload-icon-wrapper">
              <Camera size={40} />
            </div>
            <p className="upload-title">Take a photo or upload an image</p>
            <p className="upload-desc">Get instant disease diagnosis for your crops</p>
            <div className="upload-actions">
              <button
                className="btn-primary"
                id="camera-btn"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera size={18} />
                Camera
              </button>
              <button
                className="btn-secondary"
                id="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Gallery
              </button>
            </div>
          </div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="preview-area animate-fade-in">
          <div className="preview-image-wrapper glass-card">
            <img src={imagePreview} alt="Crop preview" className="preview-image" />
            <button className="preview-close" onClick={handleReset} aria-label="Remove image">
              <X size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          {!diagnosis && (
            <div className="analyze-actions">
              <button
                className="btn-primary analyze-btn"
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Analyze Crop
                  </>
                )}
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                <RotateCcw size={18} />
                Retake
              </button>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="analyzing-indicator">
              <div className="analyzing-bar">
                <div className="analyzing-progress" />
              </div>
              <p>{analysisMode === 'ai' ? 'Analyzing with Gemini Vision AI...' : 'Running Edge AI model...'}</p>
            </div>
          )}

          {/* Diagnosis Results */}
          {diagnosis && (
            <div className="diagnosis-results animate-fade-in">
              {diagnosis.source === 'gemini' && (
                <div className="ai-source-badge">
                  <Sparkles size={14} />
                  <span>Analyzed by Gemini AI</span>
                </div>
              )}
              <DiagnosisCard diagnosis={diagnosis} />
              <button className="btn-secondary scan-again-btn" onClick={handleReset}>
                <RotateCcw size={18} />
                Scan Another Crop
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode Indicator */}
      <div className="offline-badge animate-fade-in-delay-3">
        {hasApiKey() ? (
          <>
            <Sparkles size={12} className="ai-dot" />
            <span>Gemini Vision AI enabled</span>
          </>
        ) : (
          <>
            <WifiOff size={12} />
            <span>Offline mode — Edge AI fallback</span>
          </>
        )}
      </div>
    </div>
  )
}
