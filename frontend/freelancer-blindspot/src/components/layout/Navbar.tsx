import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Puzzle, ExternalLink, Menu, X, Plus } from 'lucide-react'

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
        width: collapsed ? 88 : 260,
        minHeight: '100vh',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(32px)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 0', position: 'sticky', top: 0,
        flexShrink: 0, zIndex: 100,
        transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Logo Section */}
      <div style={{ padding: '0 24px 32px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
               <div style={{ 
                 width: 32, height: 32, borderRadius: 8, 
                 background: 'var(--accent-stark)', color: 'white',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: 18, fontWeight: 900
               }}>B</div>
               <span className="font-serif" style={{ fontSize: 20, fontWeight: 800 }}>BlindSpot</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1.5, fontWeight: 700 }}>ASTIVA 2025</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ 
            background: 'var(--surface-alt)', border: '1px solid var(--border)', 
            borderRadius: 12, width: 32, height: 32, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!collapsed && (
          <div style={{ padding: '0 12px 12px', fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', letterSpacing: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            PRINCIPAL NAVIGATION
          </div>
        )}
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: collapsed ? 0 : 4, background: 'rgba(0,0,0,0.03)' }}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderRadius: 14, cursor: 'pointer', border: 'none',
                background: active ? 'rgba(0,0,0,0.05)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: active ? 700 : 600, fontSize: 14,
                transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative'
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <motion.div layoutId="nav-pill" style={{ position: 'absolute', left: 0, width: 4, height: 20, background: 'var(--accent)', borderRadius: '0 4px 4px 0' }} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* New Project CTA */}
      {onNewProject && (
        <div style={{ padding: '0 16px 24px' }}>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewProject}
            className="stark-button"
            style={{
              width: '100%', padding: collapsed ? '14px' : '14px',
              justifyContent: 'center', fontSize: 14, borderRadius: 16
            }}
          >
            <Plus size={18} strokeWidth={3} />
            {!collapsed && 'New Project'}
          </motion.button>
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ padding: '24px 16px 0', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
            background: 'transparent', border: 'none',
            color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', 
            fontWeight: 600, fontSize: 13,
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <ExternalLink size={16} />
          {!collapsed && 'Landing Page'}
        </button>
      </div>
    </motion.aside>
  )
}
