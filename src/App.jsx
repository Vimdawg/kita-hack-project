import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import ScanPage from './pages/ScanPage'
import FarmPage from './pages/FarmPage'
import SubsidyPage from './pages/SubsidyPage'
import CommunityPage from './pages/CommunityPage'
import GeminiPage from './pages/GeminiPage'

function App() {
  return (
    <div id="app-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/farm" element={<FarmPage />} />
          <Route path="/subsidies" element={<SubsidyPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/ai" element={<GeminiPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
