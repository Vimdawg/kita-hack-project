import { useState, useCallback } from 'react'
import {
  Users, MessageCircle, ThumbsUp, Filter, Plus, Send, MapPin,
  Leaf, ChevronDown, Heart, Share2, ArrowLeft, X, Award
} from 'lucide-react'
import './CommunityPage.css'

// ── Success Stories Database ──────────────────────────────
const STORIES = [
  {
    id: 1,
    author: 'Farmer A',
    region: 'Selangor',
    crop: 'Oil Palm 🌴',
    soilType: 'Laterite',
    avatar: '👨‍🌾',
    timeAgo: '2 days ago',
    title: 'Reduced Ganoderma spread by 40% with Trichoderma',
    content: 'After detecting early Basal Stem Rot using FarmGPT\'s scanner, I applied Trichoderma harzianum biocontrol agent around the affected area. Combined with sanitation trenching, the infection did not spread to neighboring palms. Yield recovered within 6 months.',
    tags: ['Ganoderma', 'Biocontrol', 'Oil Palm'],
    likes: 24,
    comments: 8,
    yieldImpact: '+18% yield recovery',
  },
  {
    id: 2,
    author: 'Farmer B',
    region: 'Kedah',
    crop: 'Paddy Rice 🌾',
    soilType: 'Alluvial',
    avatar: '👩‍🌾',
    timeAgo: '5 days ago',
    title: 'Switched to MR220 variety — 15% higher yield',
    content: 'After FarmGPT flagged recurring Rice Blast on my MR84 plots, I switched to the resistant MR220 variety recommended by MARDI. Combined with adjusted nitrogen application, my yield increased by 15% and I haven\'t seen blast symptoms since.',
    tags: ['Rice Blast', 'Variety Switch', 'Paddy'],
    likes: 31,
    comments: 12,
    yieldImpact: '+15% yield increase',
  },
  {
    id: 3,
    author: 'Farmer C',
    region: 'Johor',
    crop: 'Cocoa 🍫',
    soilType: 'Peat',
    avatar: '🧑‍🌾',
    timeAgo: '1 week ago',
    title: 'Frequent harvesting eliminated Black Pod Rot',
    content: 'Used to lose 30% of pods to Phytophthora. The FarmGPT weather alerts helped me time my harvesting — picking pods every 10 days instead of monthly during wet season. Combined with better canopy pruning for airflow, I\'ve cut pod loss to under 5%.',
    tags: ['Black Pod', 'Harvest Timing', 'Cocoa'],
    likes: 19,
    comments: 6,
    yieldImpact: '-25% pod loss reduction',
  },
  {
    id: 4,
    author: 'Farmer D',
    region: 'Perak',
    crop: 'Rubber 🌿',
    soilType: 'Laterite',
    avatar: '👨‍🌾',
    timeAgo: '2 weeks ago',
    title: 'Timed fungicide spraying using weather alerts',
    content: 'Corynespora leaf fall was costing me 20% of my latex yield. Using FarmGPT\'s weather forecasts, I started spraying hexaconazole at the start of refoliation when weather was dry. Timing is everything — my trees retained leaves this season and latex yield improved.',
    tags: ['Corynespora', 'Fungicide', 'Rubber'],
    likes: 14,
    comments: 4,
    yieldImpact: '+20% latex recovery',
  },
]

const REGIONS = ['All Regions', 'Selangor', 'Kedah', 'Johor', 'Perak', 'Pahang', 'Sabah', 'Sarawak']
const SOIL_TYPES = ['All Soils', 'Laterite', 'Alluvial', 'Peat', 'Sandy Loam', 'Clay']
const CROPS = ['All Crops', 'Oil Palm 🌴', 'Paddy Rice 🌾', 'Cocoa 🍫', 'Rubber 🌿']

export default function CommunityPage() {
  const [view, setView] = useState('feed') // 'feed' | 'submit' | 'detail'
  const [selectedStory, setSelectedStory] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterRegion, setFilterRegion] = useState('All Regions')
  const [filterSoil, setFilterSoil] = useState('All Soils')
  const [filterCrop, setFilterCrop] = useState('All Crops')
  const [likedStories, setLikedStories] = useState({})
  const [newStory, setNewStory] = useState({ title: '', content: '', crop: '', region: '', soilType: '' })

  const filteredStories = STORIES.filter((s) => {
    if (filterRegion !== 'All Regions' && s.region !== filterRegion) return false
    if (filterSoil !== 'All Soils' && s.soilType !== filterSoil) return false
    if (filterCrop !== 'All Crops' && s.crop !== filterCrop) return false
    return true
  })

  const toggleLike = useCallback((storyId) => {
    setLikedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }))
  }, [])

  return (
    <div className="page-container">
      {/* ── FEED VIEW ──────────────────── */}
      {view === 'feed' && (
        <>
          <header className="page-header animate-fade-in">
            <h1>Community</h1>
            <p>Learn from farmers with similar conditions</p>
          </header>

          {/* Filter Toggle + New Story */}
          <div className="community-actions animate-fade-in-delay-1">
            <button
              className={`filter-toggle-btn glass-card ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              id="filter-toggle"
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button
              className="new-story-btn btn-primary"
              onClick={() => setView('submit')}
              id="new-story-btn"
            >
              <Plus size={16} />
              <span>Share Story</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel glass-card animate-fade-in">
              <div className="filter-group">
                <label>Region</label>
                <div className="filter-options">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      className={`filter-chip ${filterRegion === r ? 'active' : ''}`}
                      onClick={() => setFilterRegion(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Soil Type</label>
                <div className="filter-options">
                  {SOIL_TYPES.map((s) => (
                    <button
                      key={s}
                      className={`filter-chip ${filterSoil === s ? 'active' : ''}`}
                      onClick={() => setFilterSoil(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label>Crop</label>
                <div className="filter-options">
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      className={`filter-chip ${filterCrop === c ? 'active' : ''}`}
                      onClick={() => setFilterCrop(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stories Feed */}
          <div className="stories-feed">
            {filteredStories.length === 0 ? (
              <div className="empty-state glass-card">
                <MessageCircle size={36} />
                <p>No stories match your filters</p>
              </div>
            ) : (
              filteredStories.map((story, index) => (
                <div key={story.id} className={`story-card glass-card animate-fade-in-delay-${Math.min(index + 1, 4)}`}>
                  {/* Story Header */}
                  <div className="story-header">
                    <div className="story-avatar">{story.avatar}</div>
                    <div className="story-author-info">
                      <span className="story-author">{story.author}</span>
                      <span className="story-meta">
                        <MapPin size={10} />
                        {story.region} • {story.soilType} • {story.timeAgo}
                      </span>
                    </div>
                    <span className="story-crop-badge">{story.crop}</span>
                  </div>

                  {/* Story Content */}
                  <button
                    className="story-body"
                    onClick={() => { setSelectedStory(story); setView('detail') }}
                  >
                    <h3 className="story-title">{story.title}</h3>
                    <p className="story-excerpt">
                      {story.content.length > 150 ? story.content.slice(0, 150) + '...' : story.content}
                    </p>
                  </button>

                  {/* Yield Impact Badge */}
                  <div className="yield-impact">
                    <Award size={14} />
                    <span>{story.yieldImpact}</span>
                  </div>

                  {/* Tags */}
                  <div className="story-tags">
                    {story.tags.map((tag) => (
                      <span key={tag} className="story-tag">#{tag}</span>
                    ))}
                  </div>

                  {/* Story Actions */}
                  <div className="story-actions">
                    <button
                      className={`story-action-btn ${likedStories[story.id] ? 'liked' : ''}`}
                      onClick={() => toggleLike(story.id)}
                    >
                      <Heart size={16} fill={likedStories[story.id] ? 'currentColor' : 'none'} />
                      <span>{story.likes + (likedStories[story.id] ? 1 : 0)}</span>
                    </button>
                    <button className="story-action-btn" onClick={() => { setSelectedStory(story); setView('detail') }}>
                      <MessageCircle size={16} />
                      <span>{story.comments}</span>
                    </button>
                    <button className="story-action-btn">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── STORY DETAIL VIEW ──────────── */}
      {view === 'detail' && selectedStory && (
        <div className="story-detail animate-fade-in">
          <button className="back-btn" onClick={() => setView('feed')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="story-header">
            <div className="story-avatar large">{selectedStory.avatar}</div>
            <div className="story-author-info">
              <span className="story-author">{selectedStory.author}</span>
              <span className="story-meta">
                <MapPin size={10} />
                {selectedStory.region} • {selectedStory.soilType} • {selectedStory.timeAgo}
              </span>
            </div>
          </div>

          <h2 className="story-detail-title">{selectedStory.title}</h2>

          <div className="story-detail-badges">
            <span className="story-crop-badge">{selectedStory.crop}</span>
            <div className="yield-impact">
              <Award size={14} />
              <span>{selectedStory.yieldImpact}</span>
            </div>
          </div>

          <p className="story-full-content">{selectedStory.content}</p>

          <div className="story-tags">
            {selectedStory.tags.map((tag) => (
              <span key={tag} className="story-tag">#{tag}</span>
            ))}
          </div>

          <div className="story-actions detail-actions-bar">
            <button
              className={`story-action-btn ${likedStories[selectedStory.id] ? 'liked' : ''}`}
              onClick={() => toggleLike(selectedStory.id)}
            >
              <Heart size={16} fill={likedStories[selectedStory.id] ? 'currentColor' : 'none'} />
              <span>{selectedStory.likes + (likedStories[selectedStory.id] ? 1 : 0)} Likes</span>
            </button>
            <button className="story-action-btn">
              <MessageCircle size={16} />
              <span>{selectedStory.comments} Comments</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h4 className="section-title">Comments</h4>
            <div className="comment glass-card">
              <div className="comment-header">
                <span className="comment-avatar">🧑‍🌾</span>
                <span className="comment-author">Farmer E</span>
                <span className="comment-time">1 day ago</span>
              </div>
              <p className="comment-text">I tried the same approach on my plot in Pahang. Works great! The Trichoderma really helped contain the spread.</p>
            </div>
            <div className="comment glass-card">
              <div className="comment-header">
                <span className="comment-avatar">👩‍🌾</span>
                <span className="comment-author">Farmer F</span>
                <span className="comment-time">3 days ago</span>
              </div>
              <p className="comment-text">Where did you source the biocontrol agent? Is it available through MARDI?</p>
            </div>
            <div className="comment-input-wrapper glass-card">
              <input type="text" className="comment-input" placeholder="Add a comment..." />
              <button className="comment-send-btn">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT STORY VIEW ──────────── */}
      {view === 'submit' && (
        <div className="submit-view animate-fade-in">
          <button className="back-btn" onClick={() => setView('feed')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <h2 className="submit-title">Share Your Success Story</h2>
          <p className="submit-desc">Help other farmers by sharing what worked for you. Your identity will be anonymized.</p>

          <div className="form-section">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Reduced pest damage by 30%"
                value={newStory.title}
                onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Your Story</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Describe what problem you faced, what you tried, and the results..."
                value={newStory.content}
                onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">Farm Details (for matching)</h4>
            <div className="form-group">
              <label>Crop</label>
              <select
                className="form-input form-select"
                value={newStory.crop}
                onChange={(e) => setNewStory({ ...newStory, crop: e.target.value })}
              >
                <option value="">Select crop</option>
                <option value="Oil Palm 🌴">Oil Palm 🌴</option>
                <option value="Paddy Rice 🌾">Paddy Rice 🌾</option>
                <option value="Rubber 🌿">Rubber 🌿</option>
                <option value="Cocoa 🍫">Cocoa 🍫</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Region</label>
                <select
                  className="form-input form-select"
                  value={newStory.region}
                  onChange={(e) => setNewStory({ ...newStory, region: e.target.value })}
                >
                  <option value="">Select</option>
                  {REGIONS.filter(r => r !== 'All Regions').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select
                  className="form-input form-select"
                  value={newStory.soilType}
                  onChange={(e) => setNewStory({ ...newStory, soilType: e.target.value })}
                >
                  <option value="">Select</option>
                  {SOIL_TYPES.filter(s => s !== 'All Soils').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="anonymity-notice glass-card">
            <Users size={16} />
            <p>Your story will be shared anonymously as "Farmer [X]" to protect your privacy.</p>
          </div>

          <button className="btn-primary submit-story-btn" id="submit-story-btn">
            <Send size={18} />
            Share Story
          </button>
        </div>
      )}
    </div>
  )
}
