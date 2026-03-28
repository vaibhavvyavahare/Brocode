import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Square } from 'lucide-react'
import type { EntryType, Category } from '../../types'
import { addTimeLog } from '../../api/timelogs'

interface TimeLogFormProps {
  projectId: string
  onClose: () => void
  onAdded: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2)',
  borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14,
  fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
  color: 'var(--text2)', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' as const,
}

const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'work',      label: 'Direct Work',  emoji: '💻', color: '#10b981' },
  { value: 'calls',     label: 'Calls',        emoji: '📞', color: '#3b82f6' },
  { value: 'revisions', label: 'Revisions',    emoji: '🔄', color: '#f59e0b' },
  { value: 'admin',     label: 'Admin',        emoji: '📋', color: '#a855f7' },
  { value: 'scope',     label: 'Scope Creep',  emoji: '⚠️', color: '#ef4444' },
]

export default function TimeLogForm({ projectId, onClose, onAdded }: TimeLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [timerStart, setTimerStart] = useState<number | null>(null)
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
      setTimerStart(start)
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
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(7,7,16,0.85)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.form
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="glass-strong"
          style={{ borderRadius: 24, padding: 32, width: '100%', maxWidth: 480 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3b82f6', letterSpacing: 2, marginBottom: 4 }}>LOG TIME</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24 }}>Add Time Entry</div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, color: 'var(--text2)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Timer */}
          <div className="glass" style={{ borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 700, color: timerOn ? '#f59e0b' : 'var(--text)', marginBottom: 12, transition: 'color 0.3s' }}>
              {formatElapsed(elapsed)}
            </div>
            <button type="button" onClick={toggleTimer}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 100,
                background: timerOn ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                border: `1px solid ${timerOn ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                color: timerOn ? '#ef4444' : '#10b981',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>
              {timerOn ? <><Square size={14} /> Stop Timer</> : <><Play size={14} /> Start Timer</>}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Duration */}
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input type="number" min={1} required value={form.duration_min}
                onChange={e => set('duration_min', +e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
            </div>

            {/* Billable toggle */}
            <div>
              <label style={labelStyle}>Entry Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { v: 'billable', label: '✅ Billable', c: '#10b981' },
                  { v: 'non-billable', label: '⚠️ Non-Billable', c: '#ef4444' },
                ].map(({ v, label, c }) => (
                  <button key={v} type="button" onClick={() => set('entry_type', v)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                      background: form.entry_type === v ? `${c}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.entry_type === v ? `${c}40` : 'var(--border)'}`,
                      color: form.entry_type === v ? c : 'var(--text2)',
                      fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => set('category', cat.value)}
                    style={{
                      padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                      background: form.category === cat.value ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.category === cat.value ? `${cat.color}40` : 'var(--border)'}`,
                      color: form.category === cat.value ? cat.color : 'var(--text2)',
                      fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, transition: 'all 0.2s',
                    }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="e.g. Round 2 client revisions"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
            </div>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', marginTop: 24, padding: '14px 0',
              background: loading ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
              border: 'none', borderRadius: 14, color: '#fff',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging...' : 'Log Time →'}
          </motion.button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}
