// BlindSpot Chrome Extension — content.js
// Injected into every tab. Floating strategy overlay & timer.

const APP_URL = 'http://localhost:5173'

;(function () {
  if (document.getElementById('blindspot-widget')) return

  // ── State ────────────────────────────────────────────────────────────
  let state = {
    open: false,
    timerRunning: false,
    timerStart: null,
    elapsedSecs: 0,
    timerInterval: null,
    projects: [],
    selectedProjectId: null,
    effectiveRate: null,
    riskLevel: 'safe',
    activePIP: null, // Strategy data
  }

  // ── Load persisted state ─────────────────────────────────────────────
  chrome.storage.local.get(['bs_projects', 'bs_active_project', 'bs_timer', 'bs_active_pip'], (data) => {
    if (data.bs_projects)       state.projects = data.bs_projects
    if (data.bs_active_project) state.selectedProjectId = data.bs_active_project
    if (data.bs_active_pip)     state.activePIP = data.bs_active_pip
    
    if (data.bs_timer?.running) {
      state.timerRunning = true
      state.timerStart   = data.bs_timer.start
      state.elapsedSecs  = Math.floor((Date.now() - data.bs_timer.start) / 1000)
      startTimerInterval()
    }
    renderWidget()
    renderPIPBubble()
  })

  // Listen for storage changes (e.g. from the web app or other tabs)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.bs_active_pip) {
      state.activePIP = changes.bs_active_pip.newValue
      renderPIPBubble()
    }
    if (changes.bs_active_project) {
       state.selectedProjectId = changes.bs_active_project.newValue
       renderWidget()
    }
  })

  // ── PIP STRATEGY BUBBLE (The 'Tab-Change' Proactive UI) ─────────────
  function renderPIPBubble() {
    let bubble = document.getElementById('bs-pip-bubble')
    if (!state.activePIP) {
      if (bubble) bubble.remove()
      return
    }

    if (!bubble) {
      bubble = document.createElement('div')
      bubble.id = 'bs-pip-bubble'
      document.body.appendChild(bubble)
    }

    bubble.innerHTML = `
      <div class="bs-pip-content">
        <div class="bs-pip-header">
          <span class="bs-pip-tag">ACTIVE PIP STRATEGY</span>
          <button class="bs-pip-close" id="bs-pip-close-btn">✕</button>
        </div>
        <div class="bs-pip-body">
           <div class="bs-pip-title">${state.activePIP.title || 'Performance Plan'}</div>
           <div class="bs-pip-advice">“${state.activePIP.advice || 'Monitor revision leakage carefully.'}”</div>
        </div>
        <div class="bs-pip-footer">
           <div class="bs-pip-stat">RATE LEAK: <span class="leak">₹${state.activePIP.leakage || 0}/hr</span></div>
        </div>
      </div>
    `

    document.getElementById('bs-pip-close-btn')?.addEventListener('click', () => {
      bubble.remove()
    })
  }

  // ── Widget HTML ──────────────────────────────────────────────────────
  function buildWidget() {
    const agentSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="9" r="4" stroke="currentColor" stroke-width="1.5"/>
        <path d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 3V1M9 4L7.5 2.5M15 4l1.5-1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    `
    const toggleSVG = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="10" r="5" stroke="white" stroke-width="1.8"/>
        <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M12 2v1.5M8.5 3.5L9.5 4.8M15.5 3.5L14.5 4.8" stroke="#b89865" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="12" cy="10" r="2" fill="white" opacity="0.9"/>
      </svg>
    `
    return `
      <div id="blindspot-panel">
        <div class="bs-header">
          <div class="bs-logo">
            <div class="bs-logo-dot"></div>
            <span class="bs-logo-text">BlindSpot Elite</span>
          </div>
          <button class="bs-close" id="bs-close-btn">✕</button>
        </div>

        <div class="bs-rate-block">
          <div class="bs-rate-label">REAL-TIME MARGIN</div>
          <div class="bs-rate-value ${state.riskLevel}" id="bs-rate-value">
            ${state.effectiveRate !== null ? `₹${Math.round(state.effectiveRate)}` : '—'}
          </div>
          <div class="bs-rate-sub" id="bs-rate-sub">${state.effectiveRate !== null ? '/hr · effective' : 'No Project Active'}</div>
        </div>

        <div class="bs-timer-block">
          <div class="bs-timer-display ${state.timerRunning ? 'running' : ''}" id="bs-timer-display">
            ${formatTime(state.elapsedSecs)}
          </div>
          <button class="bs-timer-btn ${state.timerRunning ? 'stop' : 'start'}" id="bs-timer-btn">
            ${state.timerRunning ? '⏹ STOP' : '▶ START'}
          </button>
        </div>

        <div class="bs-footer">
          <div class="bs-agent-info">
            <div class="bs-agent-status ${state.timerRunning ? 'active' : ''}"></div>
            <span class="bs-agent-label">${state.selectedProjectId ? state.projects.find(p => p.id === state.selectedProjectId)?.title || 'Agent Ready' : 'Agent Ready'}</span>
          </div>
          <button class="bs-open-app" id="bs-open-app">
            ${agentSVG}
            Open Agent
          </button>
        </div>
      </div>

      <button id="blindspot-toggle" class="${state.timerRunning ? 'pip-pulse' : ''}" title="BlindSpot Agent">
        ${toggleSVG}
        ${state.timerRunning ? '<span class="bs-toggle-pulse"></span>' : ''}
      </button>
    `
  }

  function formatTime(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  // ── Render ───────────────────────────────────────────────────────────
  function renderWidget() {
    const host = document.getElementById('blindspot-widget')
    if (!host) return
    host.innerHTML = buildWidget()
    attachEvents()
    if (state.timerRunning) updateTimerDisplay()
  }

  function attachEvents() {
    document.getElementById('blindspot-toggle')?.addEventListener('click', () => {
      state.open = !state.open
      const panel = document.getElementById('blindspot-panel')
      if (panel) panel.classList.toggle('open', state.open)
    })
    document.getElementById('bs-close-btn')?.addEventListener('click', () => {
      state.open = false
      document.getElementById('blindspot-panel')?.classList.remove('open')
    })

    document.getElementById('bs-timer-btn')?.addEventListener('click', toggleTimer)

    document.getElementById('bs-open-app')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_APP' })
    })
  }

  // ── Timer Logic ──────────────────────────────────────────────────────
  function toggleTimer() {
    if (!state.timerRunning) {
      state.timerStart    = Date.now()
      state.elapsedSecs   = 0
      state.timerRunning  = true
      chrome.storage.local.set({ bs_timer: { running: true, start: state.timerStart } })
      startTimerInterval()
    } else {
      state.timerRunning = false
      if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null }
      chrome.storage.local.set({ bs_timer: { running: false, start: null } })
    }
    renderWidget()
    if (state.open) document.getElementById('blindspot-panel')?.classList.add('open')
  }

  function startTimerInterval() {
    if (state.timerInterval) clearInterval(state.timerInterval)
    state.timerInterval = setInterval(() => {
      state.elapsedSecs = Math.floor((Date.now() - state.timerStart) / 1000)
      updateTimerDisplay()
    }, 1000)
  }

  function updateTimerDisplay() {
    const el = document.getElementById('bs-timer-display')
    if (el) el.textContent = formatTime(state.elapsedSecs)
  }

  // ── Styles (Elite Injection) ─────────────────────────────────────────
  const style = document.createElement('style')
  style.textContent = `
    #blindspot-widget {
      all: initial; font-family: 'Plus Jakarta Sans', sans-serif;
    }
    #blindspot-toggle {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #111; color: white; border: none;
      cursor: pointer; z-index: 999999;
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
      display: flex; alignItems: center; justifyContent: center;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .bs-dot { width: 10px; height: 10px; border-radius: 50%; background: #666; transition: background 0.3s; }
    .bs-dot.active { background: #b89865; box-shadow: 0 0 10px #b89865; }

    #blindspot-panel {
      position: fixed; bottom: 92px; right: 24px;
      width: 320px; background: rgba(255,255,255,0.95);
      backdrop-filter: blur(24px); border: 1px solid rgba(0,0,0,0.08);
      border-radius: 24px; z-index: 999999;
      opacity: 0; transform: translateY(20px) scale(0.95);
      pointer-events: none; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
      padding: 24px; box-shadow: 0 40px 100px rgba(0,0,0,0.1);
    }
    #blindspot-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

    .bs-logo-text { font-family: 'Fraunces', serif; font-weight: 800; font-size: 18px; }
    .bs-rate-value { font-size: 32px; font-weight: 800; margin: 8px 0; }
    .bs-rate-value.critical { color: #d94343; }
    .bs-rate-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #999; }

    /* PIP BUBBLE STYLES */
    #bs-pip-bubble {
      position: fixed; top: 24px; right: 24px;
      width: 300px; z-index: 999999;
      background: #111; color: white;
      border-radius: 20px; padding: 20px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.3);
      border: 1px solid rgba(184, 152, 101, 0.4);
      animation: bs-slide-in 0.6s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes bs-slide-in { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .bs-pip-tag { font-size: 9px; font-weight: 900; color: #b89865; letter-spacing: 2px; }
    .bs-pip-title { font-family: 'Fraunces', serif; font-size: 18px; margin: 8px 0 4px; }
    .bs-pip-advice { font-size: 13px; color: #aaa; font-style: italic; line-height: 1.4; }
    .bs-pip-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
    .bs-pip-stat { font-size: 11px; font-weight: 700; color: #888; }
    .bs-pip-stat .leak { color: #fe5f55; }
    .bs-pip-close { float: right; background: none; border: none; color: #444; cursor: pointer; }
  `
  document.head.appendChild(style)

  // ── Mount ─────────────────────────────────────────────────────────────
  const host = document.createElement('div')
  host.id = 'blindspot-widget'
  document.body.appendChild(host)
  renderWidget()
})()
