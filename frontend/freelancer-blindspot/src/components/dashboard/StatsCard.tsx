import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { RiskLevel } from '../../types'

interface StatsCardProps {
  label: string
  value: string
  sub?: string
  risk?: RiskLevel
  color?: string
  icon?: React.ReactNode
  delay?: number
}

const riskConfig = {
  safe:     { color: '#32a852', bg: 'rgba(50,168,82,0.08)',  label: 'Healthy',  Icon: TrendingUp },
  warning:  { color: '#e09200', bg: 'rgba(224,146,0,0.08)', label: 'At Risk',   Icon: Minus },
  critical: { color: '#d94343', bg: 'rgba(217,67,67,0.08)',  label: 'Critical',  Icon: TrendingDown },
}

export default function StatsCard({ label, value, sub, risk, color = 'var(--accent)', icon, delay = 0 }: StatsCardProps) {
  const rc = risk ? riskConfig[risk] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card-premium"
      style={{
        borderRadius: 24, padding: 28,
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        background: 'var(--surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <span style={{ 
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, 
          color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 
        }}>
          {label}
        </span>
        {icon && (
          <div style={{ 
            width: 40, height: 40, borderRadius: 12, 
            background: 'var(--surface-alt)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            border: `1px solid var(--border)`, color 
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ 
        fontFamily: 'Outfit, sans-serif', fontWeight: 800, 
        fontSize: 38, color: 'var(--text)', lineHeight: 1, 
        marginBottom: 8 
      }}>
        {value}
      </div>

      {sub && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }}>
          {sub}
        </div>
      )}

      {rc && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 18, padding: '6px 14px', borderRadius: 100,
          background: rc.bg, border: `1px solid ${rc.color}20`,
        }}>
          <rc.Icon size={14} color={rc.color} />
          <span style={{ 
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, 
            color: rc.color, fontWeight: 700 
          }}>
            {rc.label}
          </span>
        </div>
      )}
    </motion.div>
  )
}
