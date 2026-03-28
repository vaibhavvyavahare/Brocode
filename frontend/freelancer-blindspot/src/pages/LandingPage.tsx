import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from '@studio-freight/lenis'
import SoftAurora from '../components/SoftAurora'
import { ArrowRight, Zap, Target, Sparkles, Layout, MousePointer2, ShieldAlert, BarChart3, Quote } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ── Sub-Component: The 'Slow Bleed' HUD ──────────────────────────────────────
function RateHUD({ rate }: { rate: number }) {
  const isCritical = rate < 800
  return (
    <div className="glass-premium" style={{ 
      padding: '24px 32px', borderRadius: 24, minWidth: 280,
      border: `1px solid ${isCritical ? 'rgba(217,67,67,0.3)' : 'rgba(184, 152, 101, 0.2)'}`
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>LIVE EFFECTIVE RATE</div>
      <div className="font-serif" style={{ fontSize: 48, fontWeight: 800, color: isCritical ? 'var(--danger)' : 'var(--text)', lineHeight: 1 }}>
        ₹{rate}
        <span style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 4 }}>/hr</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: isCritical ? 'var(--danger)' : 'var(--success)' }}>
        {isCritical ? <ShieldAlert size={14} /> : <Zap size={14} />}
        {isCritical ? 'UNPROFITABLE REGION' : 'HEALTHY MARGIN'}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const container = useRef(null)
  
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  useGSAP(() => {
    // 1. Hero Reveal
    gsap.from('.hero-reveal', { y: 60, opacity: 0, duration: 1.4, stagger: 0.2, ease: 'expo.out' })

    // 2. The Slow Bleed Section (Pin & HUD)
    const bleedTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.bleed-trigger',
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
      }
    })

    bleedTl.from('.bubble-1', { scale: 0, opacity: 0, x: -100 })
           .to('.rate-val', { textContent: 1450, snap: { textContent: 1 }, duration: 1 }, "<")
           .from('.bubble-2', { scale: 0, opacity: 0, x: 100 }, "+=0.2")
           .to('.rate-val', { textContent: 820, snap: { textContent: 1 }, duration: 1 }, "<")
           .from('.bubble-3', { scale: 0, opacity: 0, y: 100 }, "+=0.2")
           .to('.rate-val', { textContent: 410, snap: { textContent: 1 }, duration: 1 }, "<")

    // 3. PIP Solution Reveal
    gsap.from('.pip-card', {
      scrollTrigger: {
        trigger: '.pip-section',
        start: 'top 60%',
        end: 'bottom 80%',
        toggleActions: 'play none none reverse'
      },
      y: 100, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out'
    })

    // 4. Background color transitions
    ScrollTrigger.create({
      trigger: '.pip-section',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => gsap.to('body', { backgroundColor: '#ffffff', duration: 0.8 }),
      onLeaveBack: () => gsap.to('body', { backgroundColor: 'rgb(243, 239, 230)', duration: 0.8 })
    })

  }, { scope: container })

  return (
    <div ref={container} className="noise-vignette" style={{ overflowX: 'hidden' }}>
      
      {/* Dynamic Aurora */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.15 }}>
        <SoftAurora speed={0.2} brightness={0.8} color1="#ffffff" color2="#b89865" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 80, display: 'flex', alignItems: 'center', transition: 'all 0.4s'
      }}>
        <div className="container-premium" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-stark)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>B</div>
            <span className="font-serif" style={{ fontSize: 22, fontWeight: 800 }}>BlindSpot</span>
          </div>

          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
            {['Strategy', 'The PIP', 'Intelligence'].map(l => (
              <span key={l} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>{l.toUpperCase()}</span>
            ))}
            <button onClick={() => navigate('/app')} className="stark-button" style={{ fontSize: 14 }}>Open Dashboard</button>
          </div>
        </div>
      </nav>

      {/* ── HERO: The Hook ─────────────────────────────────────────────────── */}
      <section className="narrative-section" style={{ pt: 160 }}>
        <div className="container-premium" style={{ textAlign: 'center' }}>
          <div className="hero-reveal" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: 100, background: 'var(--surface-alt)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 2, marginBottom: 32, fontFamily: 'JetBrains Mono, monospace' }}>
            ELITE FREELANCE INTELLIGENCE
          </div>
          <h1 className="hero-reveal font-serif" style={{ fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.9, letterSpacing: '-3px', marginBottom: 40 }}>
            Stop working <br/> <span className="text-gradient">for free.</span>
          </h1>
          <p className="hero-reveal" style={{ fontSize: 21, color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.5, fontWeight: 500 }}>
            Every "quick feedback" call and "small tweak" is an invisible micro-transaction. We reveal the real cost of your baseline revision hell.
          </p>
          <div className="hero-reveal" style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <button onClick={() => navigate('/app')} className="stark-button" style={{ padding: '20px 48px', fontSize: 17 }}>Unveil Your Blindspots <ArrowRight size={20} /></button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: The Slow Bleed (GSAP Pinning) ────────────────────────── */}
      <section className="bleed-trigger narrative-section" style={{ background: 'var(--bg-alt)' }}>
        <div className="container-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 24, letterSpacing: 3 }}>SCENARIO ANALYSIS</div>
            <h2 className="font-serif" style={{ fontSize: 56, lineHeight: 1.1, marginBottom: 32 }}>The anatomy of <br/>a broken margin.</h2>
            <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
              Watch how quickly a ₹2,500/hr contract decomposes into minimum wage when you don't track the "small stuff."
            </p>
          </div>

          <div style={{ position: 'relative', height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="hud-wrapper" style={{ zIndex: 10 }}>
               <div className="glass-premium" style={{ padding: '32px 48px', borderRadius: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>EFFECTIVE HOURLY EARNINGS</div>
                  <div className="font-serif" style={{ fontSize: 84, fontWeight: 900, lineHeight: 1 }}>
                    ₹<span className="rate-val">2500</span>
                  </div>
               </div>
            </div>

            {/* Bubble Pops */}
            <div className="bubble-1 glass-premium" style={{ position: 'absolute', top: '10%', right: '-10%', padding: '16px 24px', borderRadius: 20, background: 'white', color: 'var(--danger)', fontWeight: 800, fontSize: 14 }}>
              "Quick sync call" (45min) 📞
            </div>
            <div className="bubble-2 glass-premium" style={{ position: 'absolute', bottom: '15%', left: '-15%', padding: '16px 24px', borderRadius: 20, background: 'white', color: 'var(--danger)', fontWeight: 800, fontSize: 14 }}>
              Revision #3: "Small CSS tweak" 🎨
            </div>
            <div className="bubble-3 glass-premium" style={{ position: 'absolute', top: '60%', right: '5%', padding: '16px 24px', borderRadius: 20, background: 'white', color: 'var(--danger)', fontWeight: 800, fontSize: 14 }}>
              Scope Creep: "New Page Sidebar" 🧩
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: The PIP Solution ────────────────────────────────────── */}
      <section className="pip-section narrative-section" style={{ padding: '160px 0' }}>
        <div className="container-premium">
          <div style={{ textAlign: 'center', marginBottom: 96 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                <Sparkles className="text-accent" size={24} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 800, color: 'var(--accent)', letterSpacing: 3 }}>THE PIP METHOD</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 72, lineHeight: 1, letterSpacing: '-2px' }}>Personal Improvement Plans <br/> <span style={{ color: 'var(--text-dim)' }}>for your business.</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { title: 'Data Diagnosis', icon: Target, text: 'Identify which clients are leaking your time and why. No more gut-feeling decisions.' },
              { title: 'The Actionable PIP', icon: Layout, text: 'AI-generated strategies to fix bad contracts: Rate hikes, revision caps, and retainers.' },
              { title: 'Picture-in-Picture', icon: MousePointer2, text: 'A floating extension that lives on top of your work tools, keeping you accountable.' }
            ].map((card, i) => (
              <div key={i} className="pip-card card-premium" style={{ padding: 48, background: 'white', border: '1px solid var(--border-strong)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, color: 'var(--accent)' }}>
                  <card.icon size={32} />
                </div>
                <h3 className="font-serif" style={{ fontSize: 24, marginBottom: 16 }}>{card.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Professional Proof ──────────────────────────────────── */}
      <section className="narrative-section" style={{ background: '#000', color: '#fff', py: 160 }}>
        <div className="container-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }}>
           <div>
              <Quote size={64} className="text-accent" style={{ opacity: 0.3, marginBottom: 40 }} />
              <h2 className="font-serif" style={{ fontSize: 52, lineHeight: 1.1, marginBottom: 40 }}>"The only app that told me to fire my biggest client."</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                 <div style={{ width: 64, height: 64, background: '#333', borderRadius: '50%' }} />
                 <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>Marcus Thorne</div>
                    <div style={{ color: '#888', fontSize: 14 }}>Senior Product Designer, ex-Meta</div>
                 </div>
              </div>
           </div>
           <div className="glass-premium" style={{ background: 'rgba(255,255,255,0.05)', padding: 56, borderRadius: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--accent)', marginBottom: 16, fontFamily: 'Outfit' }}>+₹85k</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#ccc', lineHeight: 1.4 }}>Recovered revenue in the first quarter of using PIP strategies.</div>
           </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ padding: '120px 0', textAlign: 'center', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="container-premium">
            <h2 className="font-serif" style={{ fontSize: 64, marginBottom: 40 }}>Build a better business.</h2>
            <button onClick={() => navigate('/app')} className="stark-button" style={{ padding: '24px 64px', fontSize: 20 }}>Get Access Now</button>
            <div style={{ marginTop: 120, display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                <div>© 2025 BLINDSPOT APP · DEVELOPED BY THEVINIT</div>
                <div style={{ display: 'flex', gap: 32 }}>
                   <span>TWITTER</span>
                   <span>GITHUB</span>
                   <span>LICENSE</span>
                </div>
            </div>
        </div>
      </footer>

      <style>{`
        .text-gradient {
          background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}
