import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import { ArrowRight, Target, Sparkles, Layout, MousePointer2, Quote, Zap, Shield, TrendingUp } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT TEXT — word-by-word stagger (spec §9)
// ─────────────────────────────────────────────────────────────────────────────
function SplitHeadline({ text, style }: { text: string; style?: React.CSSProperties }) {
  const words = text.split(' ')
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0 } },
  }
  const child = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 12, stiffness: 100 } },
  }
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      style={style}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={child} style={{ display: 'inline-block', marginRight: '0.22em' }}>
          {w}
        </motion.span>
      ))}
    </motion.h1>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  // Lenis smooth scroll (spec §11: lerp 0.1)
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  // Parallax blob transforms (spec §10)
  const { scrollYProgress } = useScroll()
  const y1      = useTransform(scrollYProgress, [0, 1], [0,   200])
  const y2      = useTransform(scrollYProgress, [0, 1], [0,  -150])
  const rot1    = useTransform(scrollYProgress, [0, 1], [0,    45])
  const rot2    = useTransform(scrollYProgress, [0, 1], [0,   -30])

  // Hero content fade-out as user scrolls
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale   = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  return (
    <div className="relative w-full font-sans overflow-x-hidden" style={{ background: '#f5f3ef' }}>

      {/* ── BACKGROUND PARALLAX BLOBS (spec §10) ───────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: y1, rotate: rot1 }} className="absolute -top-40 -left-40 w-175 h-175 rounded-full opacity-[0.07]"
        >
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'radial-gradient(circle, #c5a059 0%, transparent 70%)' }} />
        </motion.div>
        <motion.div style={{ y: y2, rotate: rot2 }} className="absolute top-1/3 -right-60 w-150 h-150 rounded-full opacity-[0.05]">
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'radial-gradient(circle, #8a6b1f 0%, transparent 70%)' }} />
        </motion.div>
        <motion.div style={{ y: y1 }} className="absolute -bottom-20 left-1/3 w-125 h-125 rounded-full opacity-[0.04]">
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'radial-gradient(circle, #d4af37 0%, transparent 70%)' }} />
        </motion.div>
      </div>

      {/* ── CINEMATIC VIGNETTE ─────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(90,110,160,0.14) 100%)' }} />

      {/* ── NOISE ──────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-1 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          FIXED PILL NAVBAR
      ══════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-100 flex justify-center px-6 pt-5">
        <nav style={{
          width:'100%', maxWidth:960,
          padding:'14px 28px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(255,255,255,0.92)',
          backdropFilter:'blur(24px)',
          borderRadius:999,
          border:'1px solid rgba(0,0,0,0.06)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.09)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#111', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:16, fontFamily:'serif' }}>B</div>
            <span style={{ fontFamily:'"Fraunces",serif', fontSize:20, fontWeight:700, color:'#111', letterSpacing:'-0.02em' }}>BlindSpot</span>
          </div>
          <div style={{ display:'flex', gap:32, alignItems:'center' }}>
            {['Strategy','The PIP','Intelligence'].map(l => (
              <span key={l} style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:800, letterSpacing:'0.22em', color:'rgba(0,0,0,0.3)', cursor:'pointer', textTransform:'uppercase', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#111')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(0,0,0,0.3)')}
              >{l}</span>
            ))}
            <button onClick={() => navigate('/app')} style={{ padding:'10px 22px', background:'#111', color:'white', borderRadius:999, border:'none', fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', transition:'all 0.2s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='scale(1.04)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='scale(1)' }}
            >Start Your Analysis</button>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Minimal, professional, no 3D orb
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', minHeight:'92vh', overflowX:'hidden', padding:'140px 24px 90px' }}>
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, maxWidth: 1100, margin: '0 auto' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            borderRadius: 36,
            border: '1px solid rgba(17,17,17,0.08)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(247,243,236,0.92) 100%)',
            boxShadow: '0 16px 60px rgba(17,17,17,0.08)',
            padding: '56px clamp(26px, 4vw, 64px)'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#c5a059' }} />
              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:800, letterSpacing:'0.28em', color:'rgba(17,17,17,0.5)', textTransform:'uppercase' }}>
                Freelance Margin Intelligence
              </span>
            </div>

            <SplitHeadline
              text="Protect your time. Raise your profit."
              style={{
                fontFamily:'"Fraunces",serif',
                fontSize:'clamp(2.4rem, 6vw, 5.8rem)',
                fontWeight:800,
                lineHeight:0.95,
                letterSpacing:'-0.03em',
                color:'#111',
              }}
            />

            <p style={{
              marginTop: 22,
              maxWidth: 720,
              fontFamily:'"Plus Jakarta Sans",sans-serif',
              fontSize:'clamp(1rem, 1.8vw, 1.15rem)',
              color:'rgba(17,17,17,0.62)',
              lineHeight:1.75
            }}>
              BlindSpot helps independent professionals detect hidden non-billable leakage,
              measure effective hourly rate, and generate strategic client plans with clear, data-backed actions.
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:32 }}>
              <button
                onClick={() => navigate('/app')}
                style={{ padding:'14px 30px', background:'#111', border:'none', borderRadius:999, color:'white', fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{ const b=e.currentTarget as HTMLButtonElement; b.style.transform='translateY(-1px)' }}
                onMouseLeave={e=>{ const b=e.currentTarget as HTMLButtonElement; b.style.transform='translateY(0)' }}
              >Open Dashboard</button>
              <a
                href="#pip-engine"
                style={{ padding:'13px 28px', border:'1px solid rgba(17,17,17,0.18)', borderRadius:999, color:'#111', fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', display:'inline-flex', alignItems:'center', justifyContent:'center' }}
              >View Features</a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ALL CONTENT SECTIONS — z-index above canvas, sit naturally in flow
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ position:'relative', zIndex:20, background:'#f5f3ef' }}>

        {/* ── INTRO BLOCK ────────────────────────────────────────────── */}
        <section style={{ padding:'120px 24px 80px', display:'flex', justifyContent:'center' }}>
          <div style={{ maxWidth:820, textAlign:'center' }}>
            <motion.p
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.7 }} viewport={{ once:true }}
              style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(2rem,4.5vw,3.5rem)', fontWeight:600, lineHeight:1.2, color:'#111', letterSpacing:'-0.03em', marginBottom:28 }}
            >
              We don't just track hours. We{' '}
              <em style={{ color:'#c5a059', fontStyle:'italic' }}>architect</em>{' '}
              demand through invisible margin recovery.
            </motion.p>
            <motion.p
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.15 }} viewport={{ once:true }}
              style={{ fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:'clamp(1rem,1.8vw,1.2rem)', color:'rgba(17,17,17,0.45)', lineHeight:1.75, marginBottom:40, maxWidth:600, margin:'0 auto 40px' }}
            >
              Every "quick feedback" call is an invisible micro-transaction. We reveal the real cost
              of your revision hell with high-contrast Performance Improvement Plans.
            </motion.p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, opacity:0.3 }}>
              <div style={{ width:40, height:1, background:'#111' }} />
              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, fontWeight:800, letterSpacing:'0.4em', color:'#111', textTransform:'uppercase' }}>Strategic Partner for UI/UX Specialists</span>
              <div style={{ width:40, height:1, background:'#111' }} />
            </div>
          </div>
        </section>

        {/* ── PROOF / STATS ─────────────────────────────────────────── */}
        <section style={{ padding:'80px 24px', maxWidth:1280, margin:'0 auto' }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.5 }} viewport={{ once:true }} style={{ marginBottom:56 }}>
            <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:11, fontWeight:800, letterSpacing:'0.3em', color:'#c5a059', textTransform:'uppercase' }}>PROOF OF EXECUTION</span>
            <h2 style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:900, color:'#111', lineHeight:0.95, letterSpacing:'-0.04em', marginTop:16 }}>
              Measurable Impact<br />
              Over Empty<br />
              <span style={{ color:'rgba(17,17,17,0.1)', fontStyle:'italic' }}>Promises.</span>
            </h2>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[
              { stat:'+₹95k', label:'Annual Recovery',   sub:'Average margin reclaimed per freelancer'        },
              { stat:'3.2×',  label:'Rate Leverage',      sub:'Effective hourly rate improvement'              },
              { stat:'94%',   label:'Accuracy',            sub:'PIP strategy hit rate on revenue recovery'     },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.1, duration:0.6 }} viewport={{ once:true }}
                whileHover={{ y:-6, boxShadow:'0 24px 64px rgba(0,0,0,0.09)' }}
                style={{ padding:'48px 40px', borderRadius:40, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.05)', transition:'all 0.35s' }}
              >
                <div style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(2.8rem,5vw,4rem)', fontWeight:900, color:'#c5a059', lineHeight:1, marginBottom:8 }}>{item.stat}</div>
                <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:800, letterSpacing:'0.3em', color:'rgba(17,17,17,0.3)', textTransform:'uppercase', marginBottom:10 }}>{item.label}</div>
                <div style={{ fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:15, color:'rgba(17,17,17,0.45)', lineHeight:1.6 }}>{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PIP ENGINE ────────────────────────────────────────────── */}
        <section id="pip-engine" style={{ padding:'100px 24px', background:'white', borderRadius:60, margin:'40px 0' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginBottom:48, color:'rgba(0,0,0,0.15)' }}>
              <Sparkles size={20} />
              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:11, fontWeight:800, letterSpacing:'0.4em', textTransform:'uppercase' }}>THE PIP ENGINE</span>
              <Sparkles size={20} />
            </div>
            <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.7 }} viewport={{ once:true }}
              style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(3rem,8vw,7rem)', fontWeight:900, color:'#111', lineHeight:0.9, letterSpacing:'-0.04em', textAlign:'center', marginBottom:72 }}
            >
              Every Service,{' '}
              <span style={{ color:'rgba(17,17,17,0.07)', fontStyle:'italic' }}>Engineered</span>
              <br />to Win.
            </motion.h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
              {[
                { title:'Data Diagnosis', icon:Target,       text:'Identify which clients are leaking your time. Build strategy around real hourly value.' },
                { title:'Actionable PIPs', icon:Layout,      text:'AI-generated strategies for rate hikes, revision caps, and automated buffer tracking.' },
                { title:'Strategy Bubble', icon:MousePointer2, text:'Floating overlay that lives where you work — tracking unseen costs in real time.' },
              ].map((card, i) => (
                <motion.div key={i} whileHover={{ y:-10, boxShadow:'0 40px 80px rgba(0,0,0,0.1)' }} transition={{ duration:0.4 }}
                  style={{ padding:'48px 40px', borderRadius:48, background:'#f8f6f1', border:'1px solid rgba(0,0,0,0.04)', cursor:'default' }}
                  className="group"
                >
                  <div className="group-hover:bg-black group-hover:text-white transition-all"
                    style={{ width:56, height:56, borderRadius:16, background:'white', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:32, boxShadow:'0 4px 16px rgba(0,0,0,0.07)', transition:'all 0.4s' }}
                  >
                    <card.icon size={22} />
                  </div>
                  <h3 style={{ fontFamily:'"Fraunces",serif', fontSize:'1.7rem', fontWeight:800, color:'#111', marginBottom:16, letterSpacing:'-0.02em' }}>{card.title}</h3>
                  <p style={{ fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:15, color:'rgba(17,17,17,0.4)', lineHeight:1.75 }}>{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ───────────────────────────────────────────── */}
        <section style={{ padding:'100px 24px', background:'#111', color:'white', borderRadius:64, margin:'40px 24px', position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'#c5a059', opacity:0.06, filter:'blur(140px)', pointerEvents:'none' }} />
          <div style={{ maxWidth:780, margin:'0 auto', position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
            <Quote size={64} style={{ color:'rgba(196,168,89,0.1)', marginBottom:32 }} />
            <h2 style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(2rem,5vw,4rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.03em', fontStyle:'italic', marginBottom:48 }}>
              "The only app that told me<br />to fire my biggest client."
            </h2>
            <div style={{ padding:'36px 48px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:48, backdropFilter:'blur(20px)', marginBottom:48 }}>
              <div style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(3rem,7vw,5rem)', fontWeight:900, color:'#c5a059', lineHeight:1, letterSpacing:'-0.04em' }}>+₹95k</div>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:800, letterSpacing:'0.35em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginTop:8 }}>Annual Recovery</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Fraunces",serif', fontSize:'1.4rem', fontWeight:700, color:'#c5a059' }}>MT</div>
              <div style={{ fontFamily:'"Fraunces",serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em' }}>Marcus Thorne</div>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, fontWeight:800, letterSpacing:'0.4em', color:'#c5a059', textTransform:'uppercase' }}>Senior Product Architect</div>
            </div>
          </div>
        </section>

        {/* ── SERVICES GRID ─────────────────────────────────────────── */}
        <section style={{ padding:'100px 24px', maxWidth:1280, margin:'0 auto' }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.5 }} viewport={{ once:true }} style={{ marginBottom:56 }}>
            <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:11, fontWeight:800, letterSpacing:'0.3em', color:'#c5a059', textTransform:'uppercase' }}>ARSENAL</span>
            <h2 style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(2.2rem,5vw,4rem)', fontWeight:900, color:'#111', lineHeight:0.95, letterSpacing:'-0.04em', marginTop:16 }}>
              The full suite of<br />
              <em style={{ color:'rgba(17,17,17,0.15)' }}>intelligence tools.</em>
            </h2>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
            {[
              { icon:Zap,         title:'Revenue Auditor',      badge:'CORE',       desc:'Deep-scan every project for hidden margin loss across revisions, scope creep, and underpricing.' },
              { icon:Shield,      title:'Client Shield Rating', badge:'PROTECTION', desc:'Score each client on payment risk, feedback friction, and revision-to-delivery ratio.' },
              { icon:TrendingUp,  title:'Rate Calculator',      badge:'GROWTH',     desc:'Dynamic market-adjusted rate recommendations based on skill tier, speed, and NDA value.' },
              { icon:Target,      title:'Scope Firewall',       badge:'BOUNDARY',   desc:'Automated scope-creep detection with negotiation templates powered by PIP intelligence.' },
              { icon:Layout,      title:'PIP Generator',        badge:'AI',         desc:'Generate Performance Improvement Plans for every client relationship in under 30 seconds.' },
              { icon:MousePointer2, title:'Strategy Bubble',    badge:'EXTENSION',  desc:'Floating browser widget that tracks invisible costs across Figma, Slack, and email in real time.' },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y:-6, boxShadow:'0 24px 56px rgba(0,0,0,0.08)' }} transition={{ duration:0.3 }}
                style={{ padding:'36px 32px', borderRadius:36, background:'rgba(255,255,255,0.55)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.06)', cursor:'default' }}
                className="group"
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                  <div className="group-hover:bg-black group-hover:text-white transition-all"
                    style={{ width:48, height:48, borderRadius:14, background:'#f3efe6', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', transition:'all 0.3s' }}
                  >
                    <s.icon size={18} />
                  </div>
                  <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, fontWeight:800, letterSpacing:'0.1em', padding:'4px 10px', borderRadius:999, background:'rgba(196,168,89,0.1)', color:'#c5a059', border:'1px solid rgba(196,168,89,0.2)', textTransform:'uppercase' }}>{s.badge}</span>
                </div>
                <h3 style={{ fontFamily:'"Fraunces",serif', fontSize:'1.3rem', fontWeight:800, color:'#111', marginBottom:10, letterSpacing:'-0.02em' }}>{s.title}</h3>
                <p style={{ fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:14, color:'rgba(17,17,17,0.4)', lineHeight:1.7 }}>{s.desc}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:20, fontFamily:'"JetBrains Mono",monospace', fontSize:9, fontWeight:800, letterSpacing:'0.15em', color:'rgba(17,17,17,0.2)', textTransform:'uppercase' }}>
                  LEARN MORE <ArrowRight size={11} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        <footer style={{ padding:'120px 24px 60px', textAlign:'center' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <h2 style={{ fontFamily:'"Fraunces",serif', fontSize:'clamp(5rem,18vw,16rem)', fontWeight:900, color:'#111', lineHeight:0.82, letterSpacing:'-0.05em', marginBottom:60 }}>
              Kill the<br />bleed.
            </h2>
            <button onClick={() => navigate('/app')}
              style={{ padding:'20px 56px', background:'#111', color:'white', borderRadius:999, border:'none', fontFamily:'"Plus Jakarta Sans",sans-serif', fontSize:'1.1rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', marginBottom:80, transition:'all 0.3s' }}
              onMouseEnter={e=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='#c5a059'; b.style.transform='scale(1.04)' }}
              onMouseLeave={e=>{ const b=e.currentTarget as HTMLButtonElement; b.style.background='#111'; b.style.transform='scale(1)' }}
            >Start Free Audit</button>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:16, borderTop:'1px solid rgba(0,0,0,0.06)', paddingTop:32, fontFamily:'"JetBrains Mono",monospace', fontSize:10, fontWeight:800, letterSpacing:'0.4em', color:'rgba(17,17,17,0.2)', textTransform:'uppercase' }}>
              <div>© 2026 BLINDSPOT · THE STRATEGIC OVERHAUL</div>
              <div style={{ display:'flex', gap:32 }}>
                {['Manifesto','Revenue Lab','Security'].map(l => (
                  <span key={l} style={{ cursor:'pointer', transition:'color 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='#111')}
                    onMouseLeave={e=>(e.currentTarget.style.color='rgba(17,17,17,0.2)')}
                  >{l.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
