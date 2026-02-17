import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ScanLine, Map, FileText, Users, Bot } from 'lucide-react'
import './BottomNav.css'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/scan', label: 'Scan', icon: ScanLine },
  { path: '/ai', label: 'AI', icon: Bot },
  { path: '/farm', label: 'My Farm', icon: Map },
  { path: '/subsidies', label: 'Subsidies', icon: FileText },
  { path: '/community', label: 'Community', icon: Users },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        const Icon = item.icon
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <div className="nav-icon-wrapper">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <div className="nav-active-dot" />}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
