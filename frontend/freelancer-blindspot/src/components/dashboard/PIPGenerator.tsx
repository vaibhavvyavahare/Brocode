import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, ArrowRight, Copy, Share2, Sparkles, TrendingUp } from 'lucide-react'

interface PIPGeneratorProps {
  project: {
    id: string
    title: string
    client_name: string
    stats: {
      effectiveRate: number
      totalHours: number
      revisionPercent: number
    }
    threshold: number
  }
  onClose: () => void
}

export default function PIPGenerator({ project, onClose }: PIPGeneratorProps) {
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState(false)

  const diagnosis = [
    { label: 'Analyzing Revision Density', value: `${project.stats.revisionPercent}%`, status: project.stats.revisionPercent > 20 ? 'warning' : 'good' },
    { label: 'Calculating Rate Leakage', value: `₹${Math.round(project.threshold - project.stats.effectiveRate)}/hr`, status: 'critical' },
    { label: 'Client Communication Patterns', value: 'High Latency', status: 'warning' },
  ]

  const recommendations = [
    { title: 'Immediate Rate Correction', desc: 'Renegotiate a 15% rate hike or shift to value-based milestones to stop the hourly bleed.', icon: TrendingUp },
    { title: 'Revision Hard-Cap', desc: 'Implement a strict 2-revision limit per deliverable. Any extra is billed at a 1.5x premium rate.', icon: CheckCircle2 },
    { title: 'The "Ghosting" Buffer', desc: 'Add a 10% "Admin Overhead" to all future invoices for this client to account for sync calls.', icon: Sparkles },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) setStep(s => s + 1)
    }, 1200)
    return () => clearTimeout(timer)
  }, [step])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendations.map(r => `${r.title}: ${r.desc}`).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          width: '100%', maxWidth: 720, background: 'white', borderRadius: 32,
          overflow: 'hidden', border: '1px solid var(--border-strong)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)', position: 'relative'
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, background: 'var(--surface-alt)', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>

        {/* Sidebar Decor */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'var(--danger)' }} />

        <div style={{ padding: '48px 56px' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--danger)', fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>PERFORMANCE IMPROVEMENT PLAN (PIP)</div>
            <h2 className="font-serif" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>Recovering value from <br/><span style={{ color: 'var(--text-muted)' }}>{project.title}</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 48 }}>
            {/* Left: Diagnosis */}
            <div>
              <h4 style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24, fontWeight: 700, textTransform: 'uppercase' }}>Intelligence Scan</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {diagnosis.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: step > i ? 1 : 0.2, x: 0 }}
                    style={{ padding: '16px', borderRadius: 16, background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>{item.value}</span>
                      {step > i && (
                        <span style={{ color: item.status === 'good' ? '#32a852' : item.status === 'warning' ? '#e09200' : '#d94343' }}>
                          {item.status === 'good' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Recommendations */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24, fontWeight: 700, textTransform: 'uppercase' }}>Actionable Fixes</h4>
              
              <AnimatePresence mode="wait">
                {step < 3 ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                  >
                    <div className="pulse" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Sparkles size={32} className="text-accent" />
                    </div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, color: 'var(--text-muted)' }}>Generating Premium Strategy...</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                  >
                    {recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ display: 'flex', gap: 16 }}
                      >
                        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <rec.icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{rec.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 500 }}>{rec.desc}</div>
                        </div>
                      </motion.div>
                    ))}

                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <button 
                        onClick={copyToClipboard}
                        className="stark-button" 
                        style={{ flex: 1, fontSize: 13, padding: '12px 16px', background: copied ? '#32a852' : 'var(--accent-stark)' }}
                      >
                        {copied ? '✓ Copied Plan' : 'Copy Strategy'}
                      </button>
                      <button className="stark-button" style={{ width: 44, padding: 0, background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)' }}><Share2 size={18} /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <style>{`
          .pulse { 
            animation: pulse-ring 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(184, 152, 101, 0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(184, 152, 101, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(184, 152, 101, 0); }
          }
        `}</style>
      </motion.div>
    </div>
  )
}
