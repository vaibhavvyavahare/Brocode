import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/project/:id" element={<ProjectDetail />} />
        <Route path="*" element={
          <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 64 }}>404</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--text)' }}>Page not found</div>
            <a href="/" style={{ color: '#f59e0b', fontFamily: 'Inter, sans-serif' }}>← Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
