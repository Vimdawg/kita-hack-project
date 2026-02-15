import { FileText, ScanLine, FileCheck, Bell } from 'lucide-react'

export default function SubsidyPage() {
  return (
    <div className="page-container">
      <header className="page-header animate-fade-in">
        <h1>Subsidies</h1>
        <p>Navigate B40 grants & auto-fill forms</p>
      </header>

      <div className="glass-card animate-fade-in-delay-1" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(233, 196, 106, 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', color: '#E9C46A'
        }}>
          <FileText size={36} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
          Coming Soon
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          Simplify your B40 grant applications with OCR scanning, auto-fill forms, and deadline reminders.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          {[
            { icon: ScanLine, label: 'OCR Scan' },
            { icon: FileCheck, label: 'Auto-Fill' },
            { icon: Bell, label: 'Reminders' },
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
