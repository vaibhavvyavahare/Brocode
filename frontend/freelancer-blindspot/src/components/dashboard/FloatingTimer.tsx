import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, X } from 'lucide-react'
import type { ProjectWithStats } from '../../types'

interface FloatingTimerProps {
  isActive: boolean
  isRunning: boolean
  elapsedSeconds: number
  currentProject: ProjectWithStats | null
  isBillable: boolean
  onStop: () => void
  onTogglePlay: () => void
  onClose: () => void
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function FloatingTimer({
  isActive,
  isRunning,
  elapsedSeconds,
  currentProject,
  isBillable,
  onStop,
  onTogglePlay,
  onClose,
}: FloatingTimerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isActive || !currentProject) return null

  const dotColor = isBillable ? '#32a852' : '#e09200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 1000,
        background: 'white',
        borderRadius: 20,
        border: '1px solid var(--border-strong)',
        padding: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        minWidth: 320,
      }}
    >
      {/* Pulsing Dot Indicator */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 12px ${dotColor}`,
        }}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingLeft: 20,
      }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 1 }}>
            {isBillable ? 'BILLABLE' : 'OVERHEAD'}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
            {currentProject.title}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-dim)',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Time Display */}
      <div style={{
        fontSize: 36,
        fontWeight: 800,
        fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--text)',
        letterSpacing: '-0.5px',
        marginBottom: 12,
        textAlign: 'center',
      }}>
        {formatTime(elapsedSeconds)}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTogglePlay}
          style={{
            background: isRunning ? '#3b82f6' : 'var(--accent)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          <Play size={16} /> {isRunning ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          style={{
            background: 'var(--danger)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          <Square size={16} /> Stop & Log
        </motion.button>
      </div>
    </motion.div>
  )
}
