import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Target, Zap, Briefcase } from 'lucide-react'

interface Project {
  id: string
  title: string
  platform: string
  budget: string
  match: number
}

export default function FreelanceScoutWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScouting, setIsScouting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Project[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const steps = ['Connecting', 'Scanning', 'Filtering', 'Finalizing']

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
          setResults([
            { id: '1', title: 'Senior UX Architect', platform: 'Upwork', budget: '₹15,000', match: 98 },
            { id: '2', title: 'Fintech App Redesign', platform: 'Toptal', budget: '₹22,000', match: 94 },
            { id: '3', title: 'Design System Lead', platform: 'Direct', budget: '₹18,000', match: 91 },
          ])
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
    <div className="fixed bottom-8 right-8 z-[1000] select-none">
      
      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 group overflow-hidden"
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
            <div className="absolute inset-[-6px] border border-gold-primary/30 rounded-full animate-ping pointer-events-none" />
            <div className="absolute inset-[-12px] border border-gold-primary/10 rounded-full animate-ping pointer-events-none [animation-delay:0.5s]" />
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
            className="absolute bottom-20 right-0 w-[420px] max-h-[620px] bg-black rounded-[32px] border border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-white/5 to-transparent border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
                    <h3 className="text-xl font-serif font-bold text-white tracking-tight">Freelance Scout AI</h3>
                  </div>
                  <p className="text-[11px] font-mono font-black tracking-[0.2em] text-white/30 uppercase">Intelligent Job Aggregator</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                {['React', 'UI/UX', 'Figma'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-[9px] font-black tracking-widest rounded-full uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              
              {/* Run Scout Button */}
              <button
                disabled={isScouting}
                onClick={runScout}
                className="w-full py-5 bg-gold-primary text-black rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {isScouting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                {isScouting ? 'Executing Scan...' : 'Run Global Scout'}
              </button>

              {/* Progress */}
              {isScouting && (
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-mono font-black text-white/20 uppercase tracking-widest">
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
              <div className="space-y-4">
                <p className="text-[11px] font-mono font-black text-white/20 uppercase tracking-widest">
                  {results.length > 0 ? `Detected ${results.length} Strategic Matches` : isScouting ? 'Filtering high-value targets' : 'Ready to analyze market'}
                </p>

                {results.map((proj, i) => (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-gold-primary/30 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-[9px] font-black tracking-widest rounded-full uppercase">
                        {proj.platform}
                      </div>
                      <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold">
                        <Target size={12} />
                        {proj.match}% Match
                      </div>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-gold-primary transition-colors">{proj.title}</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40 font-mono">Potential</span>
                      <span className="text-white font-bold">{proj.budget}</span>
                    </div>
                  </motion.div>
                ))}

                {!isScouting && results.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-20 transition-opacity">
                    <Briefcase size={48} className="mb-4" />
                    <p className="font-serif text-lg italic">Your pipeline is currently idle.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-black/50 text-[10px] font-mono font-black text-white/10 uppercase tracking-[0.3em] text-center">
              Market Spark · Elite Scout Engine
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
