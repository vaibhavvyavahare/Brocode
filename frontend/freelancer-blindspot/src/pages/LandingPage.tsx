import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SoftAurora from '../components/SoftAurora'
import { ArrowRight, ChevronDown, Zap, Eye, Bell, Brain, Puzzle, BarChart3 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ── 2D Component: Dashboard Mockup (Light Mode Premium) ──────────────────────
function DashboardMockup({ rate, risk }: { rate: number; risk: 'safe' | 'warning' | 'critical' }) {
  const colors = { safe: '#32a852', warning: '#e09200', critical: '#d94343' }
  const c = colors[risk]
  
  return (
    <div className="card-premium" style={{ 
      padding: 0, overflow: 'hidden', border: '1px solid var(--border-strong)',
      background: 'white', boxSizing: 'border-box'
    }}>
      {/* Titlebar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: '#fcfcfc' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#eee' }} />)}
        </div>
        <span style={{ marginLeft: 12, fontSize: 11, color: '#999', fontFamily: 'JetBrains Mono, monospace' }}>blindspot.app/dashboard</span>
      </div>

      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>REAL-TIME EFFECTIVE RATE</div>
          <div className="font-serif" style={{ fontSize: 52, fontWeight: 800, color: c, lineHeight: 1 }}>
            ₹{rate.toLocaleString('en-IN')}
            <span style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 4 }}>/hr</span>
          </div>
          <div style={{ fontSize: 12, color: c, marginTop: 8, fontWeight: 600 }}>
            {risk === 'critical' ? '🔴 CRITICAL: Below your floor rate' : '🟢 Healthy earnings'}
          </div>
        </div>

        {/* Mini chart visual */}
        <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 32 }}>
          {[40, 60, 45, 80, 50, 20, 15].map((h, i) => (
            <div key={i} style={{ 
              flex: 1, height: `${h}%`, borderRadius: 4, 
              background: i >= 5 ? c : '#f2f2f2' 
            }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface-alt)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>BILLABLE HRS</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>6.5h</div>
          </div>
          <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface-alt)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>NON-BILLABLE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>12.0h</div>
          </div>
        </div>

        {risk === 'critical' && (
          <div style={{ 
            marginTop: 24, padding: '16px', borderRadius: 16, 
            background: 'rgba(217,67,67,0.05)', border: '1px solid rgba(217,67,67,0.1)',
            fontSize: 13, color: 'var(--danger)', fontWeight: 500,
            display: 'flex', gap: 10
          }}>
            <span>⚠️</span> AI Insight: This client is becoming unprofitable due to excessive revisions.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const container = useRef(null)
  
  useGSAP(() => {
    // 1. Hero Entrance
    gsap.from('.hero-title', { 
      y: 100, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.2 
    })
    
    // 2. Mockup Scrub Animation (The GSAP Moment)
    gsap.to('.dashboard-mockup-scroller', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      scale: 0.9,
      y: -50,
      opacity: 0.8
    })

    // 3. Stagger Reveals
    ScrollTrigger.batch('.gsap-reveal', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' }),
      start: 'top 85%',
    })

    // 4. Background color shift
    gsap.to('.landing-container', {
      scrollTrigger: {
        trigger: '.demo-section',
        start: 'top center',
        end: 'bottom center',
        scrub: true,
      },
      backgroundColor: 'rgb(235, 232, 222)'
    })
  }, { scope: container })

  return (
    <div ref={container} className="landing-container noise-vignette" style={{ minHeight: '100vh', transition: 'background-color 0.5s ease' }}>
      
      {/* Dynamic Aurora Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.2 }}>
        <SoftAurora 
          speed={0.4} 
          brightness={0.8}
          color1="#ffffff" 
          color2="#b89865" 
          noiseAmplitude={0.5}
        />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 72, borderBottom: '1px solid var(--border)',
        background: 'rgba(243, 239, 230, 0.8)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="container-premium" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-stark)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 800 }}>B</div>
            <span className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>BlindSpot</span>
          </div>

          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>Features</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>Demo</span>
            <button 
              onClick={() => navigate('/app')}
              className="stark-button" 
              style={{ padding: '10px 24px', fontSize: 13 }}
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 120, position: 'relative', zIndex: 1 }}>
        <div className="container-premium">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            
            <div>
              <div className="hero-title" style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 3, marginBottom: 24, textTransform: 'uppercase' }}>
                Senior UI/UX Strategy
              </div>
              <h1 className="hero-title font-serif" style={{ fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 0.95, letterSpacing: '-2px', marginBottom: 32 }}>
                The cost of <br />
                <span style={{ color: 'var(--accent)' }}>Revision Hell.</span>
              </h1>
              <p className="hero-title" style={{ fontSize: 19, color: 'var(--text-muted)', maxWidth: 480, marginBottom: 44, lineHeight: 1.6 }}>
                Every "quick feedback" call is a micro-transaction from your bank account. BlindSpot reveals the number you're too scared to calculate.
              </p>
              
              <div className="hero-title" style={{ display: 'flex', gap: 16 }}>
                <button 
                  onClick={() => navigate('/app')}
                  className="stark-button"
                  style={{ fontSize: 16, padding: '18px 40px' }}
                >
                  Unveil the Truth <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="dashboard-mockup-scroller" style={{ perspective: '1000px' }}>
              <div style={{ transform: 'rotateY(-5deg) rotateX(2deg)', filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.1))' }}>
                <DashboardMockup rate={320} risk="critical" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features / Social Proof ─────────────────────────────────────────── */}
      <section className="demo-section" style={{ padding: '160px 0', position: 'relative', zIndex: 1 }}>
        <div className="container-premium">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 className="gsap-reveal font-serif" style={{ fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, marginBottom: 24 }}>
              Freelance logic is broken. <br />
              <span className="font-sans" style={{ fontSize: 0.6 + 'em', color: 'var(--text-dim)', fontWeight: 500 }}>Let's fix it for good.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: Zap, label: 'Real-time Calculations', desc: 'Watch your rate drop after every email, call, and revision.' },
              { icon: Brain, label: 'Risk Intelligence', desc: 'AI-driven detection of "Scope Creep" and unprofitable habits.' },
              { icon: Puzzle, label: 'Ecosystem Integration', desc: 'A floating Chrome extension that lives where you work.' },
            ].map((item, i) => (
              <div key={i} className="card-premium gsap-reveal" style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'var(--surface-alt)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)' }}>
                  <item.icon size={28} />
                </div>
                <h3 className="font-serif" style={{ fontSize: 20, marginBottom: 12 }}>{item.label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Footer ────────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container-premium">
          <div className="gsap-reveal" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 className="font-serif" style={{ fontSize: 52, marginBottom: 32 }}>Stop giving away your time.</h2>
            <button 
              onClick={() => navigate('/app')}
              className="stark-button" 
              style={{ padding: '20px 52px', fontSize: 18 }}
            >
              Start Tracking Now
            </button>
            
            <div style={{ marginTop: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', pt: 40, color: 'var(--text-dim)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
              <div>© 2025 BLINDSPOT APP · THEVINIT</div>
              <div>BUILT FOR THE CHASE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div style={{ 
        position: 'fixed', bottom: 40, left: 40, zIndex: 10,
        fontSize: 10, fontWeight: 800, color: 'var(--accent)', letterSpacing: 2,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ width: 1, height: 40, background: 'var(--border-strong)', position: 'relative' }}>
          <motion.div 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: 'var(--accent)' }}
            animate={{ height: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </div>
        SCROLL TO EXPLORE
      </div>

    </div>
  )
}
