import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, DollarSign, TrendingUp, AlertTriangle, Sparkles, LayoutDashboard, SlidersHorizontal } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import ProjectCard from '../components/dashboard/ProjectCard'
import StatsCard from '../components/dashboard/StatsCard'
import ProjectForm from '../components/forms/ProjectForm'
import PIPGenerator from '../components/dashboard/PIPGenerator'
import { getAllProjectsWithStats } from '../api/projects'
import type { ProjectWithStats, CategoryBreakdown } from '../types'
import SoftAurora from '../components/SoftAurora'
import FreelanceScoutWidget from '../components/dashboard/FreelanceScoutWidget'
import { useGlobalSettings } from '../lib/globalSettings'
import BillablePieChart from '../components/dashboard/BillablePieChart'
import TimeBreakdownChart from '../components/dashboard/TimeBreakdownChart'
import FloatingTimer from '../components/dashboard/FloatingTimer'


export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPIP, setSelectedPIP] = useState<ProjectWithStats | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerElapsed, setTimerElapsed] = useState(0)
  const [timerProject, setTimerProject] = useState<ProjectWithStats | null>(null)
  const [timerIsBillable, setTimerIsBillable] = useState(true)
  
  const { settings, setCurrency, setRateFloor } = useGlobalSettings()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllProjectsWithStats()
      setProjects(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Timer tick effect
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setTimerElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  // Aggregate portfolio stats
  const totalEarned      = projects.reduce((s, p) => s + p.total_value, 0)
  const totalHours       = projects.reduce((s, p) => s + p.stats.totalHours, 0)
  const avgRate          = projects.length > 0 && totalHours > 0 ? totalEarned / totalHours : 0
  const billableHours    = projects.reduce((s, p) => s + p.stats.billableHours, 0)
  const nonBillableHours = projects.reduce((s, p) => s + p.stats.nonBillableHours, 0)
  const criticalProjects = projects.filter(p => p.stats.riskLevel === 'critical')
  
  // Aggregate category breakdown
  const categoryBreakdown = Array.from(
    projects.reduce((acc, p) => {
      p.stats.categoryBreakdown.forEach(cb => {
        const existing = acc.get(cb.category) || { category: cb.category, hours: 0 }
        existing.hours += cb.hours
        acc.set(cb.category, existing)
      })
      return acc
    }, new Map<string, CategoryBreakdown>()).values()
  )
  
  // Mock 'Recovered Value' based on critical project counts
  const recoveredValue   = criticalProjects.length * 12500
  
  // Timer handlers
  const handleStartTimer = (project: ProjectWithStats, isBillable: boolean) => {
    setTimerProject(project)
    setTimerIsBillable(isBillable)
    setTimerActive(true)
    setTimerRunning(true)
    setTimerElapsed(0)
  }

  const handleStopTimer = () => {
    setTimerRunning(false)
    setTimerActive(false)
    setTimerElapsed(0)
  }

  const handleTogglePlayTimer = () => {
    setTimerRunning(!timerRunning)
  }

  const handleCloseTimer = () => {
    setTimerRunning(false)
    setTimerActive(false)
  } 

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
              onClick={() => setShowSettings(true)}
              style={{
                fontSize: 13,
                padding: '12px 18px',
                borderRadius: 999,
                border: '1px solid var(--border-strong)',
                background: 'white',
                color: 'var(--text)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={16} /> Global Settings
            </motion.button>
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
            label="Total Value" value={`${settings.currency}${(totalEarned / 1000).toFixed(0)}k`}
            color="var(--accent)" icon={<DollarSign size={20} />} delay={0}
          />
          <StatsCard
            label="Avg. Hourly Rate" value={`${settings.currency}${Math.round(avgRate)}`}
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
            label="Recovered Value" value={`${settings.currency}${(recoveredValue / 1000).toFixed(1)}k`}
            sub="Projected PIP gains"
            color="var(--accent-stark)" icon={<Sparkles size={20} />}
            delay={0.15}
          />
        </div>

        {/* Time Analytics Section - Shows billable vs non-billable breakdown */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ marginBottom: 48 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <LayoutDashboard size={18} className="text-dim" />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 2, fontWeight: 800 }}>TIME ANALYTICS</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {/* Billable vs Non-Billable Pie Chart */}
              <div 
                className="card-premium"
                style={{ padding: 28, background: 'white', border: '1px solid var(--border-strong)' }}
              >
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 800 }}>BILLABLE SPLIT</div>
                <BillablePieChart 
                  billableHours={billableHours}
                  nonBillableHours={nonBillableHours}
                />
              </div>

              {/* Category Breakdown */}
              <div 
                className="card-premium"
                style={{ padding: 28, background: 'white', border: '1px solid var(--border-strong)' }}
              >
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: 'var(--text-dim)', marginBottom: 16, fontWeight: 800 }}>OVERHEAD BREAKDOWN</div>
                <TimeBreakdownChart 
                  data={categoryBreakdown}
                  billableHours={billableHours}
                  nonBillableHours={nonBillableHours}
                />
              </div>
            </div>
          </motion.div>
        )}

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
                <ProjectCard key={p.id} project={p} delay={i * 0.06} onTriggerPIP={setSelectedPIP} onStartTimer={handleStartTimer} />
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

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2500,
              padding: 20,
            }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(92vw, 460px)',
                borderRadius: 24,
                background: 'white',
                border: '1px solid var(--border-strong)',
                boxShadow: '0 30px 90px rgba(0,0,0,0.2)',
                padding: 24,
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1.6, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800 }}>GLOBAL SETTINGS</div>
              <h3 className="font-serif" style={{ fontSize: 30, marginBottom: 20, fontWeight: 800 }}>Portfolio Defaults</h3>

              <label style={{ display: 'block', marginBottom: 14 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800 }}>CURRENCY SYMBOL</div>
                <input
                  value={settings.currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="₹"
                  style={{ width: '100%', borderRadius: 14, border: '1px solid var(--border-strong)', padding: '12px 14px', fontSize: 16, fontWeight: 700 }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 800 }}>RATE FLOOR (PER HOUR)</div>
                <input
                  type="number"
                  value={settings.rateFloor}
                  onChange={(e) => setRateFloor(Number(e.target.value))}
                  min={0}
                  step={10}
                  style={{ width: '100%', borderRadius: 14, border: '1px solid var(--border-strong)', padding: '12px 14px', fontSize: 16, fontWeight: 700 }}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{ borderRadius: 12, border: '1px solid var(--border)', background: 'white', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showForm && (
        <ProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load() }} />
      )}

      {/* Floating Timer */}
      <FloatingTimer
        isActive={timerActive}
        isRunning={timerRunning}
        elapsedSeconds={timerElapsed}
        currentProject={timerProject}
        isBillable={timerIsBillable}
        onStop={handleStopTimer}
        onTogglePlay={handleTogglePlayTimer}
        onClose={handleCloseTimer}
      />

      {/* AI Agent Widget Integration */}
      <FreelanceScoutWidget projects={projects} currency={settings.currency} rateFloor={settings.rateFloor} />

      <style>{`
        .spin { animation: spin-anim 1s linear infinite; }
        @keyframes spin-anim { to { transform: rotate(360deg); } }
      `}</style>
    </div>

  )
}
