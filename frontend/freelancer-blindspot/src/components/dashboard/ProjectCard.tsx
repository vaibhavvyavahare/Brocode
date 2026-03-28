import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react'
import type { ProjectWithStats } from '../../types'

interface ProjectCardProps {
  project: ProjectWithStats
  delay?: number
  onTriggerPIP?: (p: ProjectWithStats) => void
}

const riskColors = {
  safe:     { color: '#32a852', bg: 'rgba(50,168,82,0.08)',  label: 'Healthy' },
  warning:  { color: '#e09200', bg: 'rgba(224,146,0,0.08)', label: 'At Risk' },
  critical: { color: '#d94343', bg: 'rgba(217,67,67,0.08)',  label: 'Critical' },
}

const clientRiskColors = {
  good:  { color: '#32a852', label: '✅ Good Client'  },
  risky: { color: '#e09200', label: '⚠️ Risky Client' },
  bad:   { color: '#d94343', label: '🚨 Bad Client'   },
}

export default function ProjectCard({ project, delay = 0, onTriggerPIP }: ProjectCardProps) {
  const navigate = useNavigate()
  const rc  = riskColors[project.stats.riskLevel]
  const crc = clientRiskColors[project.clientRisk]
  const rateColor = rc.color

  const handlePIP = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTriggerPIP?.(project)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/app/project/${project.id}`)}
      className="card-premium"
      style={{
        borderRadius: 24, padding: 28, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        background: 'white', border: '1px solid var(--border-strong)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 4, letterSpacing: '-0.3px' }}>
            {project.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {project.client_name} · {project.project_type}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={{ 
            padding: '4px 12px', borderRadius: 100, background: rc.bg, 
            border: `1px solid ${rc.color}20`, fontFamily: 'Plus Jakarta Sans, sans-serif', 
            fontSize: 11, color: rc.color, fontWeight: 700, whiteSpace: 'nowrap' 
          }}>
            {rc.label}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: crc.color, fontWeight: 800 }}>
            {crc.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5, marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>REAL RATE</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 26, color: rateColor, lineHeight: 1 }}>
            ₹{Math.round(project.stats.effectiveRate).toLocaleString('en-IN')}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)', marginLeft: 2 }}>/hr</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5, marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>TOTAL TIME</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
            {project.stats.totalHours.toFixed(1)}h
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5, marginBottom: 6, fontWeight: 800, textTransform: 'uppercase' }}>EARNED</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
            ₹{(project.total_value / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Project usage</span>
            <span>{project.stats.totalHours.toFixed(1)} / {project.est_hours}h</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-alt)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((project.stats.totalHours / project.est_hours) * 100, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', borderRadius: 3, background: rateColor }}
            />
          </div>
        </div>

        {project.stats.riskLevel !== 'safe' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePIP}
            style={{ 
              background: 'var(--accent-stark)', color: 'white', border: 'none', 
              borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          >
            <Sparkles size={14} /> PIP
          </motion.button>
        )}
      </div>

      <div style={{
        position: 'absolute', top: 28, right: 0,
        width: 4, height: 40, background: rateColor, borderRadius: '4px 0 0 4px', opacity: 0.8
      }} />
    </motion.div>
  )
}
