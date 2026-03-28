import { motion, AnimatePresence } from 'framer-motion'
import type { Insight } from '../../types'

interface InsightPanelProps {
  insights: Insight[]
}

const severityConfig = {
  critical: { border: 'rgba(239,68,68,0.3)',  bg: 'rgba(239,68,68,0.06)',  text: '#fca5a5', dot: '#ef4444' },
  warning:  { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)', text: '#fde68a', dot: '#f59e0b' },
  info:     { border: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.04)', text: '#93c5fd', dot: '#3b82f6' },
}

export default function InsightPanel({ insights }: InsightPanelProps) {
  return (
    <div className="glass" style={{ borderRadius: 20, padding: 24 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, color: 'var(--text2)', marginBottom: 4 }}>AI INSIGHTS</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>What BlindSpot Sees</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {insights.map((insight, i) => {
            const cfg = severityConfig[insight.severity]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 12,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{insight.icon}</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: cfg.text }}>
                  {insight.message}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {insights.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          No insights yet — add time logs to see analysis
        </div>
      )}
    </div>
  )
}
