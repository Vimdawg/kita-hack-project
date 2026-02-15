import { useState, useRef, useCallback } from 'react'
import {
  FileText, ScanLine, FileCheck, Bell, Clock, ChevronRight, Search,
  CheckCircle2, AlertCircle, Camera, Upload, X, Loader2, ArrowLeft,
  Building2, Wallet, Sprout, GraduationCap, Calendar, ExternalLink
} from 'lucide-react'
import './SubsidyPage.css'

// ── Malaysian Agriculture Subsidies Database ──────────────
const SUBSIDIES = [
  {
    id: 1,
    name: 'MySubsidi Pertanian B40',
    provider: 'KPKM (Ministry of Agriculture)',
    amount: 'RM 200 – RM 1,000/year',
    icon: Sprout,
    color: '#2D6A4F',
    category: 'fertilizer',
    deadline: '2026-03-31',
    daysLeft: 44,
    eligibility: ['B40 household', 'Registered farmer with NAFAS/LPP', 'Malaysian citizen'],
    description: 'Annual fertilizer and input subsidy for registered B40 smallholders cultivating oil palm, paddy, rubber, or cocoa.',
    documents: ['NRIC (MyKad)', 'Land Title / TOL', 'Farm Registration Card', 'B40 Household Income Declaration'],
    status: 'open',
  },
  {
    id: 2,
    name: 'MDEC Smart Agriculture Grant',
    provider: 'MDEC / MyDigital',
    amount: 'Up to RM 5,000',
    icon: GraduationCap,
    color: '#118AB2',
    category: 'technology',
    deadline: '2026-04-15',
    daysLeft: 59,
    eligibility: ['SME / Smallholder', 'Adopting digital tools', 'Registered with SSM/NAFAS'],
    description: 'Digital adoption grant for smallholders adopting precision agriculture technology including IoT sensors, drone monitoring, or AI-powered diagnostics.',
    documents: ['NRIC (MyKad)', 'SSM / Business Registration', 'Technology Adoption Plan', 'Bank Statement (3 months)'],
    status: 'open',
  },
  {
    id: 3,
    name: 'Skim Padi Bukit / Huma',
    provider: 'MARDI / DOA',
    amount: 'RM 350/hectare',
    icon: Sprout,
    color: '#E9C46A',
    category: 'paddy',
    deadline: '2026-02-28',
    daysLeft: 13,
    eligibility: ['Paddy farmers (Bukit/Huma)', 'Min. 0.5 hectare planted', 'Registered with PPK'],
    description: 'Subsidy for upland paddy (padi bukit/huma) farmers to offset production costs and encourage domestic rice cultivation.',
    documents: ['NRIC (MyKad)', 'PPK Registration', 'Land Title / Geran Tanah', 'Planting Record'],
    status: 'closing-soon',
  },
  {
    id: 4,
    name: 'FELDA Replanting Assistance',
    provider: 'FELDA / MPOB',
    amount: 'RM 7,500/hectare',
    icon: Building2,
    color: '#E07A5F',
    category: 'replanting',
    deadline: '2026-06-30',
    daysLeft: 135,
    eligibility: ['FELDA settlers', 'Oil palm > 25 years old', 'Land under FELDA scheme'],
    description: 'Financial assistance for replanting aging oil palm trees. Covers cost of seedlings, land preparation, and maintenance during immature phase.',
    documents: ['NRIC (MyKad)', 'FELDA Settler ID', 'Land Agreement', 'Tree Age Assessment Report'],
    status: 'open',
  },
]

// ── OCR Simulated Results ─────────────────────────────────
const SIMULATED_OCR = {
  nric: {
    name: 'AHMAD BIN IBRAHIM',
    nricNo: '850312-01-5423',
    address: 'No. 12, Kampung Seri Mawar, 43800 Dengkil, Selangor',
    dateOfBirth: '12/03/1985',
  },
  landTitle: {
    titleNo: 'PN 12345/2018',
    lotNo: 'Lot 3782',
    district: 'Hulu Langat',
    state: 'Selangor',
    area: '4.2 hectares',
    owner: 'AHMAD BIN IBRAHIM',
  },
}

export default function SubsidyPage() {
  const [view, setView] = useState('list') // 'list' | 'detail' | 'apply' | 'scanner'
  const [selectedSubsidy, setSelectedSubsidy] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [scanType, setScanType] = useState(null) // 'nric' | 'landTitle'
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [formData, setFormData] = useState({})
  const [reminderSet, setReminderSet] = useState({})
  const fileInputRef = useRef(null)

  const filteredSubsidies = SUBSIDIES.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectSubsidy = useCallback((subsidy) => {
    setSelectedSubsidy(subsidy)
    setView('detail')
  }, [])

  const handleStartApplication = useCallback(() => {
    setView('apply')
    setScanResult(null)
    setFormData({})
  }, [])

  const handleScanDocument = useCallback((type) => {
    setScanType(type)
    setView('scanner')
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsScanning(true)

    // Simulate OCR processing
    setTimeout(() => {
      const result = SIMULATED_OCR[scanType]
      setScanResult(result)
      setIsScanning(false)

      // Auto-fill form fields
      if (scanType === 'nric') {
        setFormData((prev) => ({
          ...prev,
          fullName: result.name,
          nric: result.nricNo,
          address: result.address,
        }))
      } else if (scanType === 'landTitle') {
        setFormData((prev) => ({
          ...prev,
          landTitle: result.titleNo,
          lotNo: result.lotNo,
          district: result.district,
          landArea: result.area,
        }))
      }

      setView('apply')
    }, 2000)
  }, [scanType])

  const toggleReminder = useCallback((subsidyId) => {
    setReminderSet((prev) => ({ ...prev, [subsidyId]: !prev[subsidyId] }))
  }, [])

  return (
    <div className="page-container">
      {/* ── SUBSIDY LIST VIEW ──────────── */}
      {view === 'list' && (
        <>
          <header className="page-header animate-fade-in">
            <h1>Subsidies</h1>
            <p>Navigate B40 grants & auto-fill forms</p>
          </header>

          {/* Search */}
          <div className="subsidy-search glass-card animate-fade-in-delay-1">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search subsidies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              id="subsidy-search"
            />
          </div>

          {/* Category Filters */}
          <div className="filter-chips animate-fade-in-delay-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'fertilizer', label: '🌱 Fertilizer' },
              { value: 'technology', label: '💻 Tech' },
              { value: 'paddy', label: '🌾 Paddy' },
              { value: 'replanting', label: '🌴 Replanting' },
            ].map((cat) => (
              <button
                key={cat.value}
                className={`filter-chip ${filterCategory === cat.value ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Subsidy Cards */}
          <div className="subsidy-list">
            {filteredSubsidies.map((subsidy, index) => {
              const Icon = subsidy.icon
              return (
                <button
                  key={subsidy.id}
                  className={`subsidy-card glass-card animate-fade-in-delay-${Math.min(index + 1, 4)}`}
                  onClick={() => handleSelectSubsidy(subsidy)}
                  id={`subsidy-${subsidy.id}`}
                >
                  <div className="subsidy-card-header">
                    <div className="subsidy-icon" style={{ background: `${subsidy.color}20`, color: subsidy.color }}>
                      <Icon size={22} />
                    </div>
                    <div className="subsidy-card-info">
                      <h3>{subsidy.name}</h3>
                      <p className="subsidy-provider">{subsidy.provider}</p>
                    </div>
                    <ChevronRight size={16} className="subsidy-chevron" />
                  </div>
                  <div className="subsidy-card-footer">
                    <span className="subsidy-amount">
                      <Wallet size={13} />
                      {subsidy.amount}
                    </span>
                    <span className={`badge ${subsidy.status === 'closing-soon' ? 'badge-warning' : 'badge-success'}`}>
                      <Clock size={10} />
                      {subsidy.daysLeft}d left
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── SUBSIDY DETAIL VIEW ────────── */}
      {view === 'detail' && selectedSubsidy && (
        <div className="detail-view animate-fade-in">
          <button className="back-btn" onClick={() => setView('list')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="detail-header">
            <div className="detail-icon" style={{ background: `${selectedSubsidy.color}20`, color: selectedSubsidy.color }}>
              {(() => { const Icon = selectedSubsidy.icon; return <Icon size={28} /> })()}
            </div>
            <h2>{selectedSubsidy.name}</h2>
            <p className="detail-provider">{selectedSubsidy.provider}</p>
          </div>

          <div className="detail-amount-bar glass-card">
            <div className="detail-amount">
              <Wallet size={18} />
              <span>{selectedSubsidy.amount}</span>
            </div>
            <div className={`badge ${selectedSubsidy.status === 'closing-soon' ? 'badge-warning' : 'badge-success'}`}>
              <Clock size={10} />
              {selectedSubsidy.daysLeft} days left
            </div>
          </div>

          <div className="detail-section">
            <p className="detail-description">{selectedSubsidy.description}</p>
          </div>

          {/* Eligibility */}
          <div className="detail-section">
            <h4 className="section-title">Eligibility</h4>
            <ul className="eligibility-list">
              {selectedSubsidy.eligibility.map((item, i) => (
                <li key={i} className="eligibility-item">
                  <CheckCircle2 size={14} className="eligibility-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents */}
          <div className="detail-section">
            <h4 className="section-title">Required Documents</h4>
            <ul className="documents-list">
              {selectedSubsidy.documents.map((doc, i) => (
                <li key={i} className="document-item">
                  <FileText size={14} />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline */}
          <div className="detail-section">
            <h4 className="section-title">Deadline</h4>
            <div className="deadline-bar glass-card">
              <div className="deadline-info">
                <Calendar size={16} />
                <span>{selectedSubsidy.deadline}</span>
              </div>
              <button
                className={`reminder-btn ${reminderSet[selectedSubsidy.id] ? 'active' : ''}`}
                onClick={() => toggleReminder(selectedSubsidy.id)}
              >
                <Bell size={14} />
                {reminderSet[selectedSubsidy.id] ? 'Reminder Set' : 'Set Reminder'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button className="btn-primary apply-btn" onClick={handleStartApplication} id="start-application-btn">
              <FileCheck size={18} />
              Start Application
            </button>
          </div>
        </div>
      )}

      {/* ── APPLICATION FORM VIEW ──────── */}
      {view === 'apply' && selectedSubsidy && (
        <div className="apply-view animate-fade-in">
          <button className="back-btn" onClick={() => setView('detail')}>
            <ArrowLeft size={18} />
            <span>Back to Details</span>
          </button>

          <h2 className="apply-title">Application Form</h2>
          <p className="apply-subtitle">{selectedSubsidy.name}</p>

          {/* OCR Scan Buttons */}
          <div className="ocr-section">
            <h4 className="section-title">Quick Fill with OCR</h4>
            <p className="ocr-desc">Scan your documents to auto-fill the form</p>
            <div className="ocr-buttons">
              <button className="ocr-btn glass-card" onClick={() => handleScanDocument('nric')}>
                <ScanLine size={20} />
                <div>
                  <span className="ocr-btn-title">Scan NRIC</span>
                  <span className="ocr-btn-desc">MyKad front</span>
                </div>
                {formData.nric && <CheckCircle2 size={16} className="ocr-done" />}
              </button>
              <button className="ocr-btn glass-card" onClick={() => handleScanDocument('landTitle')}>
                <ScanLine size={20} />
                <div>
                  <span className="ocr-btn-title">Scan Land Title</span>
                  <span className="ocr-btn-desc">Geran Tanah</span>
                </div>
                {formData.landTitle && <CheckCircle2 size={16} className="ocr-done" />}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <h4 className="section-title">Personal Information</h4>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="As per NRIC"
              />
            </div>
            <div className="form-group">
              <label>NRIC Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.nric || ''}
                onChange={(e) => setFormData({ ...formData, nric: e.target.value })}
                placeholder="e.g. 850312-01-5423"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">Land Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Land Title No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.landTitle || ''}
                  onChange={(e) => setFormData({ ...formData, landTitle: e.target.value })}
                  placeholder="e.g. PN 12345"
                />
              </div>
              <div className="form-group">
                <label>Lot No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lotNo || ''}
                  onChange={(e) => setFormData({ ...formData, lotNo: e.target.value })}
                  placeholder="e.g. Lot 3782"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Hulu Langat"
                />
              </div>
              <div className="form-group">
                <label>Land Area</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.landArea || ''}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  placeholder="e.g. 4.2 hectares"
                />
              </div>
            </div>
          </div>

          <button className="btn-primary submit-btn" id="submit-application-btn">
            <FileCheck size={18} />
            Submit Application
          </button>
        </div>
      )}

      {/* ── OCR SCANNER VIEW ───────────── */}
      {view === 'scanner' && (
        <div className="scanner-view animate-fade-in">
          <button className="back-btn" onClick={() => setView('apply')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <h2 className="scanner-title">
            {scanType === 'nric' ? 'Scan NRIC (MyKad)' : 'Scan Land Title'}
          </h2>
          <p className="scanner-desc">
            {scanType === 'nric'
              ? 'Position the front of your MyKad in the frame'
              : 'Position your Geran Tanah / Land Title document'}
          </p>

          {isScanning ? (
            <div className="scanning-indicator">
              <div className="scanning-animation">
                <Loader2 size={40} className="spin" />
              </div>
              <p>Processing document with OCR...</p>
              <p className="scanning-sub">Extracting text fields</p>
            </div>
          ) : (
            <div className="scanner-upload glass-card">
              <div className="scanner-icon-wrapper">
                <ScanLine size={48} />
              </div>
              <p>Take a photo or upload document image</p>
              <div className="scanner-actions">
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={18} />
                  Capture
                </button>
                <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} />
                  Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
