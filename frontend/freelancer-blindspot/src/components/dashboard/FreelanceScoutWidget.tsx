import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Target, Zap, Briefcase } from 'lucide-react'
import type { ProjectWithStats } from '../../types'

interface ScoutTarget {
  id: string
  title: string
  source: string
  budget: string
  match: number
  signal: string
}

interface FreelanceScoutWidgetProps {
  projects: ProjectWithStats[]
  currency: string
  rateFloor: number
}

export default function FreelanceScoutWidget({ projects, currency, rateFloor }: FreelanceScoutWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScouting, setIsScouting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ScoutTarget[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const steps = ['Connecting', 'Scanning', 'Filtering', 'Finalizing']

  const getMatchTone = (match: number) => {
    if (match >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    if (match >= 70) return 'text-amber-300 bg-amber-500/10 border-amber-500/30'
    return 'text-sky-300 bg-sky-500/10 border-sky-500/30'
  }

  const totalProjects = projects.length
  const avgEffectiveRate = totalProjects
    ? projects.reduce((sum, p) => sum + p.stats.effectiveRate, 0) / totalProjects
    : 0
  const riskProjects = projects.filter((p) => p.stats.riskLevel !== 'safe')
  const avgNonBillableRatio = totalProjects
    ? projects.reduce((sum, p) => sum + p.stats.nonBillableRatio, 0) / totalProjects
    : 0

  const buildScoutTargets = (): ScoutTarget[] => {
    if (projects.length === 0) return []

    const scored = [...projects]
      .map((p) => {
        const leakage = Math.round(p.stats.nonBillableHours * Math.max(rateFloor, p.threshold))
        const ratePressure = p.stats.effectiveRate < rateFloor ? 16 : 0
        const pressure = Math.min(99, Math.round((p.stats.nonBillableRatio * 100) + (p.stats.revisionPercent * 0.7) + ratePressure))
        return {
          id: p.id,
          title: p.title,
          source: p.client_name,
          budget: `${currency}${Math.max(leakage, 2000).toLocaleString('en-IN')}`,
          match: Math.max(60, pressure),
          signal: p.stats.riskLevel === 'critical' ? 'Critical leakage' : p.stats.riskLevel === 'warning' ? 'Warning trend' : 'Stable profile',
        }
      })
      .sort((a, b) => b.match - a.match)

    return scored.slice(0, 4)
  }

  const runScout = () => {
    if (isScouting) return
    setIsScouting(true)
    setProgress(0)
    setResults([])
    setCurrentStep(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScouting(false)
          setResults(buildScoutTargets())
          return 100
        }
        const next = prev + 1
        if (next === 25) setCurrentStep(1)
        if (next === 50) setCurrentStep(2)
        if (next === 75) setCurrentStep(3)
        return next
      })
    }, 40)
  }

  return (
    <div className="fixed bottom-6 right-5 z-1000 select-none sm:bottom-8 sm:right-8">
      
      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 group overflow-hidden sm:h-16 sm:w-16"
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gold-primary opacity-50 blur-sm" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="scout" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}>
              <Search size={28} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse Rings */}
        {!isOpen && (
          <>
            <div className="absolute -inset-1.5 border border-gold-primary/30 rounded-full animate-ping pointer-events-none" />
            <div className="absolute -inset-3 border border-gold-primary/10 rounded-full animate-ping pointer-events-none [animation-delay:0.5s]" />
          </>
        )}

        {results.length > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-warm-bg shadow-lg">
            {results.length}
          </div>
        )}
      </button>

      {/* ── PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-18 right-0 w-[min(92vw,440px)] max-h-[72vh] bg-[#080808] rounded-[28px] border border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 sm:px-7 sm:pt-7 bg-linear-to-br from-white/10 via-white/4 to-transparent border-b border-white/10">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#22c55e]" />
                    <h3 className="text-[1.55rem] leading-none font-serif font-bold text-white tracking-tight">Freelance Scout AI</h3>
                  </div>
                  <p className="text-[10px] font-mono font-black tracking-[0.22em] text-white/45 uppercase">Intelligent Job Aggregator</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['React', 'UI/UX', 'Figma'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-[9px] font-black tracking-widest rounded-full uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 sm:px-6">

              {/* AI Overview */}
              <div className="rounded-3xl border border-white/10 bg-linear-to-b from-white/6 to-white/2 p-4 sm:p-5">
                <p className="text-[10px] font-mono font-black text-white/70 uppercase tracking-[0.24em] mb-3">AI Overview</p>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-2.5 sm:p-3">
                    <p className="text-[10px] text-white/55 font-mono uppercase tracking-wider">Projects</p>
                    <p className="text-xl font-black text-white mt-0.5">{totalProjects}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-2.5 sm:p-3">
                    <p className="text-[10px] text-white/55 font-mono uppercase tracking-wider">Avg Rate</p>
                    <p className="text-xl font-black text-gold-primary mt-0.5">{currency}{Math.round(avgEffectiveRate || 0)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-2.5 sm:p-3">
                    <p className="text-[10px] text-white/55 font-mono uppercase tracking-wider">At Risk</p>
                    <p className="text-xl font-black text-rose-400 mt-0.5">{riskProjects.length}</p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] font-medium text-white/70 leading-relaxed">
                  Non-billable load is currently <span className="text-white font-semibold">{(avgNonBillableRatio * 100).toFixed(0)}%</span> across tracked projects.
                </p>
                <p className="mt-1 text-[11px] font-medium text-white/50 leading-relaxed">
                  Global floor baseline: <span className="text-gold-primary font-semibold">{currency}{Math.round(rateFloor || 0)}/hr</span>
                </p>
              </div>
              
              {/* Run Scout Button */}
              <button
                disabled={isScouting}
                onClick={runScout}
                className="w-full py-4 bg-gold-primary text-black rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_rgba(184,152,101,0.35)] hover:bg-[#d2b179] transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {isScouting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                {isScouting ? 'Executing Scan...' : 'Run Global Scout'}
              </button>

              {/* Progress */}
              {isScouting && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono font-black text-white/55 uppercase tracking-[0.16em]">
                    <span>{steps[currentStep]}...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold-primary" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {steps.map((s, i) => (
                      <div 
                        key={s} 
                        className={`flex-1 h-1 rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-gold-primary' : 'bg-white/5'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-mono font-black text-white/55 uppercase tracking-[0.2em]">
                  {results.length > 0 ? `Detected ${results.length} Strategic Matches` : isScouting ? 'Filtering high-value targets' : 'Run scout to prioritize high-risk accounts'}
                </p>

                {results.map((proj, i) => (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 sm:p-5 bg-white/5.5 border border-white/10 rounded-2xl hover:border-gold-primary/35 hover:bg-white/9 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="px-2.5 py-1 bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-[9px] font-black tracking-widest rounded-full uppercase max-w-[58%] truncate">
                        {proj.source}
                      </div>
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold border rounded-full px-2 py-1 ${getMatchTone(proj.match)}`}>
                        <Target size={12} />
                        {proj.match}% Match
                      </div>
                    </div>
                    <h4 className="text-[1.05rem] leading-tight font-serif font-bold text-white mb-2 group-hover:text-gold-primary transition-colors">{proj.title}</h4>
                    <p className="text-xs text-white/65 mb-3">{proj.signal}</p>
                    <div className="flex justify-between items-center text-sm bg-black/35 border border-white/10 rounded-xl px-3 py-2">
                      <span className="text-white/60 font-mono text-[12px]">Potential Recovery</span>
                      <span className="text-white font-bold text-[1.05rem] leading-none">{proj.budget}</span>
                    </div>
                  </motion.div>
                ))}

                {!isScouting && results.length === 0 && (
                  <div className="py-10 flex flex-col items-center justify-center text-center text-white/60 transition-opacity border border-white/10 rounded-2xl bg-white/3">
                    <Briefcase size={42} className="mb-3" />
                    <p className="font-serif text-lg italic">No scout output yet.</p>
                    <p className="text-xs font-mono uppercase tracking-wider mt-2 text-white/45">
                      {projects.length === 0 ? 'Add projects to unlock AI scouting signals' : 'Click Run Global Scout to generate portfolio insights'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-black/60 text-[10px] font-mono font-black text-white/35 uppercase tracking-[0.26em] text-center">
              Market Spark · Elite Scout Engine
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

