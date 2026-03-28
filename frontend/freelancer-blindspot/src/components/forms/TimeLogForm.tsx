import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Square, Timer, CheckCircle, AlertCircle } from 'lucide-react'
import type { EntryType, Category } from '../../types'
import { addTimeLog } from '../../api/timelogs'

interface TimeLogFormProps {
  projectId: string
  onClose: () => void
  onAdded: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'white', border: '1px solid var(--border-strong)',
  borderRadius: 16, padding: '14px 18px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none', transition: 'all 0.3s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontWeight: 500
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' as const,
  fontWeight: 800
}

const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'work',      label: 'Direct Work',  emoji: '💻', color: 'var(--accent)' },
  { value: 'calls',     label: 'Calls',        emoji: '📞', color: '#3b82f6' },
  { value: 'revisions', label: 'Revisions',    emoji: '🔄', color: '#f59e0b' },
  { value: 'admin',     label: 'Admin',        emoji: '📋', color: '#a855f7' },
  { value: 'scope',     label: 'Scope Creep',  emoji: '⚠️', color: 'var(--danger)' },
]

export default function TimeLogForm({ projectId, onClose, onAdded }: TimeLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null)
  const [form, setForm] = useState({
    duration_min: 60,
    entry_type: 'billable' as EntryType,
    category: 'work' as Category,
    notes: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleTimer = () => {
    if (!timerOn) {
      const start = Date.now() - elapsed * 1000
      setTimerOn(true)
      const id = setInterval(() => {
        const secs = Math.floor((Date.now() - start) / 1000)
        setElapsed(secs)
        set('duration_min', Math.max(1, Math.round(secs / 60)))
      }, 1000)
      setTimerRef(id)
    } else {
      if (timerRef) clearInterval(timerRef)
      setTimerOn(false)
    }
  }

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (timerRef) clearInterval(timerRef)
    setLoading(true)
    try {
      await addTimeLog({ ...form, project_id: projectId })
      onAdded()
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(243, 239, 230, 0.85)', backdropFilter: 'blur(32px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.form
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="card-premium"
          style={{ 
            borderRadius: 32, padding: 48, width: '100%', maxWidth: 540, 
            background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-strong)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: 3, marginBottom: 12, fontWeight: 900 }}>CHRONO LOG</div>
              <h2 className="font-serif" style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.1 }}>Record Activity</h2>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Timer Section */}
          <div style={{ 
            background: 'var(--surface-alt)', borderRadius: 24, padding: '32px 24px', 
            marginBottom: 32, textAlign: 'center', border: '1px solid var(--border)' 
          }}>
            <div style={{ 
              fontFamily: 'Outfit, sans-serif', fontSize: 64, fontWeight: 800, 
              color: timerOn ? 'var(--accent)' : 'var(--text)', 
              marginBottom: 16, transition: 'color 0.4s', letterSpacing: '-2px' 
            }}>
              {formatElapsed(elapsed)}
            </div>
            <button type="button" onClick={toggleTimer}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 100,
                background: timerOn ? 'rgba(217, 67, 67, 0.1)' : 'var(--accent-stark)',
                border: timerOn ? '1px solid var(--danger)' : 'none',
                color: timerOn ? 'var(--danger)' : 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14, 
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: timerOn ? 'none' : '0 10px 24px rgba(0,0,0,0.2)'
              }}>
              {timerOn ? <><Square size={16} fill="currentColor" /> Stop Counter</> : <><Play size={16} fill="currentColor" /> Start Session</>}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Duration & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Measured Weight (Min)</label>
                <input type="number" min={1} required value={form.duration_min}
                  onChange={e => set('duration_min', +e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Revenue Impact</label>
                <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 4, borderRadius: 12 }}>
                  {[
                    { v: 'billable', label: 'Billed', icon: CheckCircle, color: 'var(--success)' },
                    { v: 'non-billable', label: 'Leak', icon: AlertCircle, color: 'var(--danger)' },
                  ].map(({ v, label, icon: Icon, color }) => (
                    <button key={v} type="button" onClick={() => set('entry_type', v)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                        background: form.entry_type === v ? 'white' : 'transparent',
                        border: 'none',
                        boxShadow: form.entry_type === v ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        color: form.entry_type === v ? color : 'var(--text-dim)',
                        fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 13, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <label style={labelStyle}>Action Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => set('category', cat.value)}
                    style={{
                      padding: '14px 8px', borderRadius: 16, cursor: 'pointer',
                      background: form.category === cat.value ? 'var(--surface-alt)' : 'white',
                      border: `1px solid ${form.category === cat.value ? 'var(--text)' : 'var(--border-strong)'}`,
                      color: form.category === cat.value ? 'var(--text)' : 'var(--text-muted)',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Qualitative Notes (Optional)</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Briefly describe the context..."
                style={inputStyle} />
            </div>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            className="stark-button"
            style={{
              width: '100%', marginTop: 32, padding: '20px 0',
              justifyContent: 'center', fontSize: 16, borderRadius: 16,
              background: loading ? 'var(--text-dim)' : 'var(--accent-stark)'
            }}
          >
            {loading ? 'Recording...' : 'Commit Time Log'} <Timer size={20} />
          </motion.button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}
