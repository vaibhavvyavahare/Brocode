import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Puzzle, ExternalLink, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Puzzle, label: 'Extension', path: '/extension', external: false },
]

interface NavbarProps {
  onNewProject?: () => void
}

export default function Navbar({ onNewProject }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: 'rgba(11,11,22,0.9)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', position: 'sticky', top: 0,
        flexShrink: 0, zIndex: 50,
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#f59e0b,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#000',
              marginBottom: 8,
            }}>B</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>BlindSpot</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>ASTIVA 2025</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, color: 'var(--text2)', cursor: 'pointer', flexShrink: 0 }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: collapsed ? 0 : 4 }}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px' : '11px 14px',
                borderRadius: 12, cursor: 'pointer', border: 'none',
                background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: active ? '#f59e0b' : 'var(--text2)',
                fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14,
                transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
                borderLeft: active ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </motion.button>
          )
        })}
      </div>

      {/* New project CTA */}
      {onNewProject && (
        <div style={{ padding: '0 12px 20px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewProject}
            style={{
              width: '100%', padding: collapsed ? '11px' : '12px',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              border: 'none', borderRadius: 12, color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>+</span>
            {!collapsed && 'New Project'}
          </motion.button>
        </div>
      )}

      {/* Back to landing */}
      <div style={{ padding: '0 12px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
            background: 'transparent', border: 'none',
            color: 'var(--muted)', fontFamily: 'Inter, sans-serif', fontSize: 13,
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <ExternalLink size={14} />
          {!collapsed && 'Landing Page'}
        </button>
      </div>
    </motion.aside>
  )
}
