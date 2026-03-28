import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import ProjectCard from '../components/dashboard/ProjectCard'
import StatsCard from '../components/dashboard/StatsCard'
import ProjectForm from '../components/forms/ProjectForm'
import { getAllProjectsWithStats } from '../api/projects'
import type { ProjectWithStats } from '../types'
import SoftAurora from '../components/SoftAurora'

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllProjectsWithStats()
      setProjects(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Aggregate portfolio stats
  const totalEarned   = projects.reduce((s, p) => s + p.total_value, 0)
  const totalHours    = projects.reduce((s, p) => s + p.stats.totalHours, 0)
  const avgRate       = projects.length > 0 && totalHours > 0 ? totalEarned / totalHours : 0
  const criticalCount = projects.filter(p => p.stats.riskLevel === 'critical').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      
      {/* Premium Background Layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.1 }}>
        <SoftAurora speed={0.3} brightness={0.8} color1="#ffffff" color2="#b89865" />
      </div>

      <Navbar onNewProject={() => setShowForm(true)} />

      <main style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}
        >
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 12, fontWeight: 800 }}>DASHBOARD OVERVIEW</div>
            <h1 className="font-serif" style={{ fontWeight: 800, fontSize: 48, lineHeight: 1.0, marginBottom: 12, letterSpacing: '-1px' }}>
              Your Portfolio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} tracked · Real-time profitability
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="stark-button"
            style={{ fontSize: 15, padding: '14px 28px' }}
          >
            <Plus size={20} /> New Project
          </motion.button>
        </motion.div>

        {/* Portfolio Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 48 }}>
          <StatsCard
            label="Total Value" value={`₹${(totalEarned / 1000).toFixed(0)}k`}
            color="var(--accent)" icon={<DollarSign size={20} />} delay={0}
          />
          <StatsCard
            label="Total Hours" value={`${totalHours.toFixed(1)}h`}
            color="#3b82f6" icon={<Clock size={20} />} delay={0.05}
          />
          <StatsCard
            label="Avg. Effective Rate" value={`₹${Math.round(avgRate)}`}
            sub="across all projects"
            color="#32a852" icon={<TrendingUp size={20} />} delay={0.1}
          />
          <StatsCard
            label="At Risk" value={`${criticalCount}`}
            sub={criticalCount > 0 ? 'Urgent attention needed' : 'All targets healthy'}
            color={criticalCount > 0 ? 'var(--danger)' : '#32a852'}
            icon={<AlertTriangle size={20} />}
            delay={0.15}
          />
        </div>

        {/* Project Explorer Section */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '4px solid var(--border)', borderTopColor: 'var(--accent)',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>SYNCING PORTFOLIO...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card-premium"
            style={{ padding: '96px 40px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 56, marginBottom: 24 }}>📈</div>
            <h2 className="font-serif" style={{ fontWeight: 800, fontSize: 32, marginBottom: 12 }}>No projects tracked</h2>
            <div style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 17, maxWidth: 400, margin: '0 auto 40px' }}>Start your first project to reveal your real effective hourly rate.</div>
            <button onClick={() => setShowForm(true)} className="stark-button">+ Add First Project</button>
          </motion.div>
        ) : (
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 24, fontWeight: 800 }}>
              YOUR PROJECTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={i * 0.06} />
              ))}
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <ProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load() }} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
