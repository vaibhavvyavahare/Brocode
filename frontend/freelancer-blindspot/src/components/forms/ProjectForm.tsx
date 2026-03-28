import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Project, PricingType, ProjectType } from '../../types'
import { createProject } from '../../api/projects'

interface ProjectFormProps {
  onClose: () => void
  onCreated: (p: Project) => void
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

export default function ProjectForm({ onClose, onCreated }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', client_name: '', project_type: 'Design' as ProjectType,
    pricing_type: 'fixed' as PricingType, total_value: 15000,
    hourly_rate: 0, est_hours: 20, threshold: 500,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const p = await createProject(form)
      onCreated(p)
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
          style={{ borderRadius: 24, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 4 }}>NEW PROJECT</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24 }}>Add Project</div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, color: 'var(--text2)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Project Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="Website Redesign" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
            </div>

            {/* Client */}
            <div>
              <label style={labelStyle}>Client Name *</label>
              <input required value={form.client_name} onChange={e => set('client_name', e.target.value)}
                placeholder="Sharma Enterprises" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
            </div>

            {/* Project type */}
            <div>
              <label style={labelStyle}>Project Type</label>
              <select value={form.project_type} onChange={e => set('project_type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['Design', 'Dev', 'Writing', 'Marketing', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Pricing type toggle */}
            <div>
              <label style={labelStyle}>Pricing Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['fixed', 'hourly'].map(pt => (
                  <button key={pt} type="button" onClick={() => set('pricing_type', pt)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                      background: form.pricing_type === pt ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.pricing_type === pt ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                      color: form.pricing_type === pt ? '#f59e0b' : 'var(--text2)',
                      fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                    }}>
                    {pt === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional fields */}
            {form.pricing_type === 'fixed' ? (
              <div>
                <label style={labelStyle}>Project Value (₹) *</label>
                <input type="number" min={0} required value={form.total_value} onChange={e => set('total_value', +e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Hourly Rate (₹/hr) *</label>
                <input type="number" min={0} required value={form.hourly_rate} onChange={e => set('hourly_rate', +e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Estimated Hours</label>
                <input type="number" min={0} value={form.est_hours} onChange={e => set('est_hours', +e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
              </div>
              <div>
                <label style={labelStyle}>Min Rate (₹/hr)</label>
                <input type="number" min={0} value={form.threshold} onChange={e => set('threshold', +e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
              </div>
            </div>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', marginTop: 28, padding: '14px 0',
              background: loading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
              border: 'none', borderRadius: 14, color: '#000',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Project →'}
          </motion.button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}
