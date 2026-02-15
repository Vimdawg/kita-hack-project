import { Users, MessageCircle, ThumbsUp, Filter } from 'lucide-react'

export default function CommunityPage() {
  return (
    <div className="page-container">
      <header className="page-header animate-fade-in">
        <h1>Community</h1>
        <p>Learn from farmers with similar conditions</p>
      </header>

      <div className="glass-card animate-fade-in-delay-1" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(224, 122, 95, 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', color: '#E07A5F'
        }}>
          <Users size={36} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
          Coming Soon
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          Anonymized success stories from farmers with similar soil types and regional micro-climates.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          {[
            { icon: MessageCircle, label: 'Stories' },
            { icon: Filter, label: 'By Region' },
            { icon: ThumbsUp, label: 'Peer Tips' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 8px', borderRadius: 12,
              background: 'var(--color-surface-glass)', flex: 1
            }}>
              <Icon size={20} style={{ color: 'var(--color-primary-light)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
