import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert, Bot } from 'lucide-react'
import './DiagnosisCard.css'

const severityConfig = {
  high: {
    icon: ShieldAlert,
    label: 'High Severity',
    className: 'severity-high',
    badgeClass: 'badge-danger',
  },
  medium: {
    icon: AlertTriangle,
    label: 'Medium Severity',
    className: 'severity-medium',
    badgeClass: 'badge-warning',
  },
  low: {
    icon: AlertCircle,
    label: 'Low Severity',
    className: 'severity-low',
    badgeClass: 'badge-info',
  },
  none: {
    icon: CheckCircle2,
    label: 'Healthy',
    className: 'severity-none',
    badgeClass: 'badge-success',
  },
}

export default function DiagnosisCard({ diagnosis }) {
  const navigate = useNavigate()
  const config = severityConfig[diagnosis.severity] || severityConfig.none
  const Icon = config.icon
  const confidencePercent = Math.round(diagnosis.confidence * 100)

  const handleAskAI = () => {
    const prompt = `I just scanned my ${diagnosis.cropType || 'crop'} and the diagnosis is: ${diagnosis.disease} (${confidencePercent}% confidence, ${diagnosis.severity} severity). ${diagnosis.description} Can you give me more detailed advice on treatment, prevention, and what I should do next? Include locally available products in Malaysia.`
    navigate('/ai', { state: { initialPrompt: prompt } })
  }

  return (
    <div className={`diagnosis-card glass-card ${config.className}`} id="diagnosis-result">
      {/* Header */}
      <div className="diagnosis-header">
        <div className="diagnosis-icon-wrapper">
          <Icon size={24} />
        </div>
        <div className="diagnosis-title-area">
          <h3 className="diagnosis-disease-name">{diagnosis.disease}</h3>
          <div className="diagnosis-meta">
            <span className={`badge ${config.badgeClass}`}>{config.label}</span>
            <span className="diagnosis-confidence">
              {confidencePercent}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="confidence-bar-wrapper">
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="diagnosis-description">{diagnosis.description}</p>

      {/* Actions */}
      <div className="diagnosis-actions">
        <h4 className="actions-title">Recommended Actions</h4>
        <ul className="actions-list">
          {diagnosis.actions.map((action, index) => (
            <li key={index} className="action-item">
              <span className="action-number">{index + 1}</span>
              <span className="action-text">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ask AI for more advice */}
      <button className="ask-ai-btn" onClick={handleAskAI}>
        <Bot size={18} />
        <span>Get detailed AI advice</span>
      </button>
    </div>
  )
}
