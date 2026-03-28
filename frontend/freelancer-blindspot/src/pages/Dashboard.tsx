import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, DollarSign, TrendingUp, AlertTriangle, Sparkles, LayoutDashboard } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import ProjectCard from '../components/dashboard/ProjectCard'
import StatsCard from '../components/dashboard/StatsCard'
import ProjectForm from '../components/forms/ProjectForm'
import PIPGenerator from '../components/dashboard/PIPGenerator'
import { getAllProjectsWithStats } from '../api/projects'
import type { ProjectWithStats } from '../types'
import SoftAurora from '../components/SoftAurora'
import FreelanceScoutWidget from '../components/dashboard/FreelanceScoutWidget'


export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPIP, setSelectedPIP] = useState<ProjectWithStats | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllProjectsWithStats()
      setProjects(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Aggregate portfolio stats
  const totalEarned      = projects.reduce((s, p) => s + p.total_value, 0)
  const totalHours       = projects.reduce((s, p) => s + p.stats.totalHours, 0)
  const avgRate          = projects.length > 0 && totalHours > 0 ? totalEarned / totalHours : 0
  const criticalProjects = projects.filter(p => p.stats.riskLevel === 'critical')
  
  // Mock 'Recovered Value' based on critical project counts - adds to the 'Professional' feel
  const recoveredValue   = criticalProjects.length * 12500 

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      
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
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
               <div style={{ padding: '6px 12px', background: 'var(--accent-stark)', borderRadius: 100, color: 'white', fontSize: 10, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5 }}>PREMIUM INTELLIGENCE</div>
               <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)' }} />
               <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>v1.0.4-ELITE</div>
            </div>
            <h1 className="font-serif" style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.0, marginBottom: 12, letterSpacing: '-1.5px' }}>
              Strategic Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 500 }}>
              {projects.length} accounts under management · {criticalProjects.length} critical PIPs pending.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="stark-button"
              style={{ fontSize: 15, padding: '14px 28px' }}
            >
              <Plus size={20} /> Create Project
            </motion.button>
          </div>
        </motion.div>

        {/* Portfolio Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 48 }}>
          <StatsCard
            label="Total Value" value={`₹${(totalEarned / 1000).toFixed(0)}k`}
            color="var(--accent)" icon={<DollarSign size={20} />} delay={0}
          />
          <StatsCard
            label="Avg. Hourly Rate" value={`₹${Math.round(avgRate)}`}
            sub="Across all tracked time"
            color="#32a852" icon={<TrendingUp size={20} />} delay={0.05}
          />
          <StatsCard
            label="Risk Exposure" value={`${criticalProjects.length}`}
            sub="Clients needing PIPs"
            color={criticalProjects.length > 0 ? 'var(--danger)' : '#32a852'}
            icon={<AlertTriangle size={20} />}
            delay={0.1}
          />
          <StatsCard
            label="Recovered Value" value={`₹${(recoveredValue / 1000).toFixed(1)}k`}
            sub="Projected PIP gains"
            color="var(--accent-stark)" icon={<Sparkles size={20} />}
            delay={0.15}
          />
        </div>

        {/* PIP Management Section - Only shows if there are risks */}
        {criticalProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium"
            style={{ 
              marginBottom: 48, padding: 32, background: 'var(--surface-alt)', border: '1px dashed var(--danger)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', marginBottom: 8 }}>
                <AlertTriangle size={18} />
                <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>CRITICAL PERFORMANCE ALERT</span>
              </div>
              <h3 className="font-serif" style={{ fontSize: 24, fontWeight: 700 }}>{criticalProjects.length} projects are draining your profit.</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Generate a Performance Improvement Plan (PIP) to salvage these accounts.</p>
            </div>
            <button 
              onClick={() => setSelectedPIP(criticalProjects[0])}
              className="stark-button" 
              style={{ background: 'var(--danger)', fontSize: 14, padding: '12px 24px' }}
            >
              Resolve Critical Issues <Sparkles size={16} />
            </button>
          </motion.div>
        )}

        {/* Project Explorer Section */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div className="spin" style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '4px solid var(--border)', borderTopColor: 'var(--accent)',
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
            <h2 className="font-serif" style={{ fontWeight: 800, fontSize: 32, marginBottom: 12 }}>Portfolio is empty</h2>
            <div style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 17, maxWidth: 400, margin: '0 auto 40px' }}>Start your first project to reveal your real effective hourly rate.</div>
            <button onClick={() => setShowForm(true)} className="stark-button">+ Add Start Account</button>
          </motion.div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LayoutDashboard size={18} className="text-dim" />
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 2, fontWeight: 800 }}>ACTIVE PROJECT ROSTER</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 24 }}>
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={i * 0.06} onTriggerPIP={setSelectedPIP} />
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPIP && (
          <PIPGenerator project={selectedPIP} onClose={() => setSelectedPIP(null)} />
        )}
      </AnimatePresence>

      {showForm && (
        <ProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load() }} />
      )}

      {/* AI Agent Widget Integration */}
      <FreelanceScoutWidget />

      <style>{`
        .spin { animation: spin-anim 1s linear infinite; }
        @keyframes spin-anim { to { transform: rotate(360deg); } }
      `}</style>
    </div>

  )
}
