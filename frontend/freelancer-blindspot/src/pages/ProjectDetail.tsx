import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Clock, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import StatsCard from '../components/dashboard/StatsCard'
import AlertBanner from '../components/dashboard/AlertBanner'
import ProfitChart from '../components/dashboard/ProfitChart'
import TimeBreakdownChart from '../components/dashboard/TimeBreakdownChart'
import InsightPanel from '../components/dashboard/InsightPanel'
import TimeLogForm from '../components/forms/TimeLogForm'
import { getProjectWithStats } from '../api/projects'
import { getRateTimeSeries } from '../lib/calculations'
import type { ProjectWithStats } from '../types'
import SoftAurora from '../components/SoftAurora'

const clientRiskConfig = {
  good:  { color: '#32a852', label: '✅ Good Client',   bg: 'rgba(50,168,82,0.08)'  },
  risky: { color: '#e09200', label: '⚠️ Risky Client',  bg: 'rgba(224,146,0,0.08)'  },
  bad:   { color: '#d94343', label: '🚨 Bad Client',    bg: 'rgba(217,67,67,0.08)'   },
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getProjectWithStats(id)
      setProject(data)
      setAlertDismissed(false)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>SYNCING PROJECT...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (!project) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🔍</div>
        <div className="font-serif" style={{ fontWeight: 800, fontSize: 32, marginBottom: 12 }}>Project not found</div>
        <button onClick={() => navigate('/app')} className="stark-button" style={{ padding: '12px 28px' }}>← Back to Portfolio</button>
      </div>
    </div>
  )

  const { stats, insights, clientRisk, logs } = project
  const rateTimeSeries = getRateTimeSeries(project, logs)
  const crc = clientRiskConfig[clientRisk]
  const rateColor = stats.riskLevel === 'critical' ? 'var(--danger)' : stats.riskLevel === 'warning' ? 'var(--warning)' : '#32a852'
  const showAlert = stats.isBelowThreshold && !alertDismissed

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      
      {/* Premium Background Layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.1 }}>
        <SoftAurora speed={0.3} brightness={0.8} color1="#ffffff" color2="#b89865" />
      </div>

      <Navbar onNewProject={() => navigate('/app')} />

      <main style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
          <button
            onClick={() => navigate('/app')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', 
              border: 'none', color: 'var(--text-muted)', cursor: 'pointer', 
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, 
              marginBottom: 24, padding: 0, fontWeight: 600 
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 12, fontWeight: 800 }}>PROJECT INTELLIGENCE</div>
              <h1 className="font-serif" style={{ fontWeight: 800, fontSize: 48, lineHeight: 1.0, marginBottom: 12, letterSpacing: '-1px' }}>{project.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>{project.client_name}</span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>{project.project_type}</span>
                <span style={{
                  padding: '4px 12px', borderRadius: 100,
                  background: crc.bg, border: `1px solid ${crc.color}20`,
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: crc.color,
                  fontWeight: 700
                }}>{crc.label}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLogForm(true)}
              className="stark-button"
              style={{ fontSize: 15, padding: '14px 28px' }}
            >
              <Plus size={20} /> Log Time
            </motion.button>
          </div>
        </motion.div>

        {/* Alert Banner */}
        <AlertBanner
          show={showAlert}
          rate={stats.effectiveRate}
          threshold={project.threshold}
          onDismiss={() => setAlertDismissed(true)}
        />

        {/* Major Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          <StatsCard
            label="Real Effective Rate" value={`₹${Math.round(stats.effectiveRate).toLocaleString('en-IN')}`}
            sub="per hour (actual)" color={rateColor}
            risk={stats.riskLevel} delay={0}
          />
          <StatsCard
            label="Total Usage" value={`${stats.totalHours.toFixed(1)}h`}
            sub={`${stats.billableHours.toFixed(1)}h billable`}
            color="#3b82f6" delay={0.05}
          />
          <StatsCard
            label="Lost Value" value={`${(stats.nonBillableRatio * 100).toFixed(0)}%`}
            sub={`${stats.nonBillableHours.toFixed(1)}h overhead`}
            color={stats.nonBillableRatio > 0.35 ? 'var(--danger)' : 'var(--accent)'}
            delay={0.1}
          />
          <StatsCard
            label="Revision Burn" value={`${stats.revisionPercent.toFixed(0)}%`}
            sub="of total project time"
            color={stats.revisionPercent > 25 ? 'var(--danger)' : '#32a852'}
            delay={0.15}
          />
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card-premium" style={{ border: '1px solid var(--border-strong)', background: 'white', padding: '32px' }}>
            <h3 className="font-serif" style={{ fontSize: 24, marginBottom: 32, fontWeight: 700 }}>Profitability Timeline</h3>
            <div style={{ height: 320 }}>
              <ProfitChart data={rateTimeSeries} threshold={project.threshold} />
            </div>
          </div>
          <div className="card-premium" style={{ border: '1px solid var(--border-strong)', background: 'white', padding: '32px' }}>
            <h3 className="font-serif" style={{ fontSize: 24, marginBottom: 32, fontWeight: 700 }}>Time Allocation</h3>
            <div style={{ height: 320 }}>
              <TimeBreakdownChart
                data={stats.categoryBreakdown}
                billableHours={stats.billableHours}
                nonBillableHours={stats.nonBillableHours}
              />
            </div>
          </div>
        </div>

        {/* Lower Details Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <InsightPanel insights={insights} />

          {/* Time Log Historical List */}
          <div className="card-premium" style={{ background: 'white', border: '1px solid var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.5, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 700 }}>AUDIT LOG</div>
                <h3 className="font-serif" style={{ fontWeight: 700, fontSize: 20 }}>{logs.length} Entries</h3>
              </div>
              <button onClick={() => setShowLogForm(true)} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>+ Add Entry</button>
            </div>

            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14 }}>
                No records yet — start logging your time.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 440, overflowY: 'auto', paddingRight: 8 }}>
                {[...logs].reverse().map((log, i) => {
                  const catColors: Record<string, string> = { work: '#32a852', calls: '#3b82f6', revisions: '#e09200', admin: '#a855f7', scope: '#d94343' }
                  const catEmoji: Record<string, string> = { work: '💻', calls: '📞', revisions: '🔄', admin: '📋', scope: '⚠️' }
                  const c = catColors[log.category]
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px', borderRadius: 16,
                        background: 'var(--surface-alt)', border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {catEmoji[log.category]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: c, marginBottom: 2 }}>
                          {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                        </div>
                        {log.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{log.notes}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16, color: 'var(--text)', fontWeight: 800 }}>
                          {(log.duration_min / 60).toFixed(1)}h
                        </div>
                        <div style={{
                          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                          color: log.entry_type === 'billable' ? '#32a852' : 'var(--danger)',
                          fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          {log.entry_type}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>

      {showLogForm && (
        <TimeLogForm
          projectId={project.id}
          onClose={() => setShowLogForm(false)}
          onAdded={() => { setShowLogForm(false); load() }}
        />
      )}
    </div>
  )
}
