import { useState, useRef, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bot, Send, Image, X, Loader2, Settings, Key, ChevronDown,
  Sparkles, Camera, Upload, ArrowLeft, Check, AlertCircle, Mic
} from 'lucide-react'
import {
  sendMessage, analyzeImage, hasApiKey, getApiKey, setApiKey, isKeyFromEnv, QUICK_PROMPTS
} from '../utils/gemini'
import './GeminiPage.css'

// ── Simple Markdown-ish renderer ──────────────────────────
function formatResponse(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
    .replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function GeminiPage() {
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(hasApiKey())
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!hasApiKey() && !isKeyFromEnv()) {
      setShowSettings(true)
    }
  }, [])

  // Handle initial prompt from navigation (e.g. from DiagnosisCard)
  const initialPromptHandled = useRef(false)
  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt
    if (initialPrompt && !initialPromptHandled.current && hasApiKey()) {
      initialPromptHandled.current = true
      handleSend(initialPrompt)
    }
  }, [location.state])

  // Build chat history for API
  const getChatHistory = useCallback(() => {
    return messages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }))
  }, [messages])

  // ── Send Text Message ────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = overrideText || input.trim()
    if (!text && !imageFile) return
    if (!hasApiKey()) {
      setShowSettings(true)
      return
    }

    setError(null)
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text || 'Analyze this image',
      image: imagePreview,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      let response
      if (imageFile) {
        response = await analyzeImage(imageFile, text, getChatHistory())
        setImageFile(null)
        setImagePreview(null)
      } else {
        response = await sendMessage(getChatHistory(), text)
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'model', text: response },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'error',
          text: err.message || 'Failed to get response. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, imageFile, imagePreview, getChatHistory])

  // ── Handle Image Attachment ──────────────────────────────
  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const removeImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
  }, [])

  // ── Save API Key ─────────────────────────────────────────
  const handleSaveKey = useCallback(() => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim())
      setApiKeySaved(true)
      setShowSettings(false)
      setApiKeyInput('')
    }
  }, [apiKeyInput])

  // ── Quick Prompt ─────────────────────────────────────────
  const handleQuickPrompt = useCallback((prompt) => {
    handleSend(prompt)
  }, [handleSend])

  // ── Enter key handling ───────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="gemini-page">
      {/* ── Header ──────────────────────── */}
      <header className="gemini-header">
        <div className="gemini-header-left">
          <div className="gemini-logo">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="gemini-title">FarmGPT AI</h1>
            <p className="gemini-subtitle">
              {hasApiKey() ? 'Powered by Gemini' : 'Setup required'}
            </p>
          </div>
        </div>
        {!isKeyFromEnv() && (
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        )}
      </header>

      {/* ── API Key Settings Panel ──────── */}
      {showSettings && (
        <div className="settings-panel glass-card animate-fade-in">
          <div className="settings-header">
            <Key size={18} />
            <h3>Gemini API Key</h3>
            <button className="settings-close" onClick={() => setShowSettings(false)}>
              <X size={16} />
            </button>
          </div>
          <p className="settings-desc">
            Enter your Google Gemini API key to enable AI features.
            Get one free at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              aistudio.google.com
            </a>
          </p>
          <div className="api-key-input-wrapper">
            <input
              type="password"
              className="api-key-input"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
            />
            <button className="api-key-save-btn" onClick={handleSaveKey}>
              <Check size={16} />
            </button>
          </div>
          {apiKeySaved && (
            <div className="api-key-status">
              <Check size={14} />
              <span>API key saved</span>
            </div>
          )}
        </div>
      )}

      {/* ── Chat Messages Area ──────────── */}
      <div className="gemini-messages">
        {messages.length === 0 ? (
          <div className="gemini-welcome">
            <div className="welcome-icon">
              <Sparkles size={40} />
            </div>
            <h2>Ask FarmGPT AI</h2>
            <p>
              Get expert advice on crops, diseases, weather timing, subsidies — 
              in English or Bahasa Malaysia.
            </p>

            {/* Quick Prompts */}
            <div className="quick-prompts">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.id}
                  className="quick-prompt-btn glass-card"
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  <span className="qp-emoji">{qp.emoji}</span>
                  <span className="qp-label">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role === 'user' ? 'user-message' : ''} ${msg.role === 'error' ? 'error-message' : ''}`}
              >
                {msg.role !== 'user' && (
                  <div className={`message-avatar ${msg.role === 'error' ? 'error-avatar' : ''}`}>
                    {msg.role === 'error' ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>
                )}
                <div className="message-content">
                  {msg.image && (
                    <div className="message-image-wrapper">
                      <img src={msg.image} alt="Attached" className="message-image" />
                    </div>
                  )}
                  {msg.role === 'model' ? (
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                    />
                  ) : (
                    <div className="message-text">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chat-message">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Image Preview ───────────────── */}
      {imagePreview && (
        <div className="image-attachment-bar">
          <div className="attachment-preview">
            <img src={imagePreview} alt="Attachment" />
            <button className="remove-attachment" onClick={removeImage}>
              <X size={14} />
            </button>
          </div>
          <span className="attachment-label">Image attached</span>
        </div>
      )}

      {/* ── Input Area ──────────────────── */}
      <div className="gemini-input-area">
        <div className="input-wrapper glass-card">
          <button
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach image"
          >
            <Image size={20} />
          </button>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={imageFile ? 'Describe what to analyze...' : 'Ask FarmGPT AI...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !imageFile)}
            aria-label="Send"
          >
            {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
