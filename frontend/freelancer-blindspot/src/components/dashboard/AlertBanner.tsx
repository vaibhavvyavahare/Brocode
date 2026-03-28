import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface AlertBannerProps {
  show: boolean
  rate: number
  threshold: number
  onDismiss?: () => void
}

export default function AlertBanner({ show, rate, threshold, onDismiss }: AlertBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="shake"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 16, padding: '16px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 0 40px rgba(239,68,68,0.15), inset 0 1px 0 rgba(239,68,68,0.15)',
            marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Animated bg stripe */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(-45deg, rgba(239,68,68,0.03) 0px, rgba(239,68,68,0.03) 10px, transparent 10px, transparent 20px)',
          }} />

          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative',
            boxShadow: '0 0 20px rgba(239,68,68,0.3)',
          }}>
            <AlertTriangle size={20} color="#ef4444" />
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#fca5a5', marginBottom: 2 }}>
              ⚠️ Rate Below Threshold — Red Alert
            </div>
            <div style={{ fontSize: 13, color: 'rgba(252,165,165,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>
              Effective rate dropped to <strong style={{ color: '#ef4444' }}>₹{rate.toFixed(0)}/hr</strong> · Your threshold: ₹{threshold}/hr
            </div>
          </div>

          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28,
            color: '#ef4444', flexShrink: 0, position: 'relative',
          }}>
            ₹{rate.toFixed(0)}<span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(239,68,68,0.7)' }}>/hr</span>
          </div>

          {onDismiss && (
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', padding: 4, position: 'relative' }}>
              <X size={18} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
