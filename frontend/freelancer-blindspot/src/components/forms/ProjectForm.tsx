import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import type { Project, PricingType, ProjectType } from '../../types'
import { createProject } from '../../api/projects'

interface ProjectFormProps {
  onClose: () => void
  onCreated: (p: Project) => void
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
            borderRadius: 32, padding: 48, width: '100%', maxWidth: 640, 
            maxHeight: '90vh', overflowY: 'auto', background: 'white',
            boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-strong)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: 3, marginBottom: 12, fontWeight: 900 }}>CREATE ACCOUNT</div>
              <h2 className="font-serif" style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.1 }}>New Project Analysis</h2>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Project Subject *</label>
                <input required value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="Website Redesign" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--text)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')} />
              </div>
              <div>
                <label style={labelStyle}>Client Entity *</label>
                <input required value={form.client_name} onChange={e => set('client_name', e.target.value)}
                  placeholder="ACME Corp" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--text)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Categorization</label>
                <select value={form.project_type} onChange={e => set('project_type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {['Design', 'Dev', 'Writing', 'Marketing', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Strategic Pricing</label>
                <div style={{ display: 'flex', gap: 8, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
                  {['fixed', 'hourly'].map(pt => (
                    <button key={pt} type="button" onClick={() => set('pricing_type', pt)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                        background: form.pricing_type === pt ? 'white' : 'transparent',
                        border: 'none',
                        boxShadow: form.pricing_type === pt ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        color: form.pricing_type === pt ? 'var(--text)' : 'var(--text-dim)',
                        fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      }}>
                      {pt === 'fixed' ? 'Fixed Fee' : 'Hourly Rate'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              {form.pricing_type === 'fixed' ? (
                <div>
                  <label style={labelStyle}>Contract Value (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: 800 }}>₹</div>
                    <input type="number" min={0} required value={form.total_value} onChange={e => set('total_value', +e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 36 }} />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Hourly Rate (₹/hr) *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: 800 }}>₹</div>
                    <input type="number" min={0} required value={form.hourly_rate} onChange={e => set('hourly_rate', +e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 36 }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Estimated Scope (Hours)</label>
                <input type="number" min={0} value={form.est_hours} onChange={e => set('est_hours', +e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Survival Threshold (₹/hr)</label>
                <input type="number" min={0} value={form.threshold} onChange={e => set('threshold', +e.target.value)}
                  style={inputStyle} />
              </div>
            </div>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            className="stark-button"
            style={{
              width: '100%', marginTop: 40, padding: '20px 0',
              justifyContent: 'center', fontSize: 16, borderRadius: 16,
              background: loading ? 'var(--text-dim)' : 'var(--accent-stark)'
            }}
          >
            {loading ? 'Initializing...' : 'Commit Project Analysis'} <ArrowRight size={20} />
          </motion.button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}
