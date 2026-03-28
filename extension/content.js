// BlindSpot Chrome Extension — content.js
// Injected into every tab. Floating widget overlay.

const APP_URL = 'http://localhost:5173' // Change to Vercel URL after deploy

;(function () {
  if (document.getElementById('blindspot-widget')) return

  // ── State ────────────────────────────────────────────────────────────
  let state = {
    open: false,
    timerRunning: false,
    timerStart: null,
    elapsedSecs: 0,
    timerInterval: null,
    selectedCategory: 'work',
    selectedType: 'billable',
    projects: [],
    selectedProjectId: null,
    effectiveRate: null,
    riskLevel: 'safe',
  }

  // ── Load persisted state ─────────────────────────────────────────────
  chrome.storage.local.get(['bs_projects', 'bs_active_project', 'bs_timer'], (data) => {
    if (data.bs_projects)       state.projects = data.bs_projects
    if (data.bs_active_project) state.selectedProjectId = data.bs_active_project
    if (data.bs_timer?.running) {
      state.timerRunning = true
      state.timerStart   = data.bs_timer.start
      state.elapsedSecs  = Math.floor((Date.now() - data.bs_timer.start) / 1000)
      startTimerInterval()
    }
    renderWidget()
  })

  // ── Widget HTML ──────────────────────────────────────────────────────
  function buildWidget() {
    return `
      <div id="blindspot-panel">
        <div class="bs-header">
          <div class="bs-logo">
            <div class="bs-logo-dot"></div>
            <span class="bs-logo-text">BlindSpot</span>
          </div>
          <button class="bs-close" id="bs-close-btn">✕</button>
        </div>

        <div class="bs-rate-block">
          <div class="bs-rate-label">EFFECTIVE RATE</div>
          <div class="bs-rate-value ${state.riskLevel}" id="bs-rate-value">
            ${state.effectiveRate !== null ? `₹${Math.round(state.effectiveRate)}` : '—'}
          </div>
          <div class="bs-rate-sub" id="bs-rate-sub">${state.effectiveRate !== null ? '/hr · real rate' : 'Select a project'}</div>
        </div>

        <div class="bs-timer-block">
          <div class="bs-timer-display ${state.timerRunning ? 'running' : ''}" id="bs-timer-display">
            ${formatTime(state.elapsedSecs)}
          </div>
          <button class="bs-timer-btn ${state.timerRunning ? 'stop' : 'start'}" id="bs-timer-btn">
            ${state.timerRunning ? '⏹ Stop' : '▶ Start'}
          </button>
        </div>

        <div class="bs-log-block">
          <div class="bs-log-label">CATEGORY</div>
          <div class="bs-categories">
            ${[
              { v:'work',      e:'💻', l:'Work'      },
              { v:'calls',     e:'📞', l:'Calls'     },
              { v:'revisions', e:'🔄', l:'Revisions' },
              { v:'admin',     e:'📋', l:'Admin'     },
              { v:'scope',     e:'⚠️', l:'Scope'     },
            ].map(c => `
              <button class="bs-cat-btn ${state.selectedCategory === c.v ? 'selected' : ''}" data-cat="${c.v}">
                ${c.e}<br>${c.l}
              </button>
            `).join('')}
          </div>

          <div class="bs-type-toggle">
            <button class="bs-type-btn billable ${state.selectedType === 'billable' ? 'selected' : ''}" data-type="billable">✅ Billable</button>
            <button class="bs-type-btn nonbillable ${state.selectedType === 'non-billable' ? 'selected' : ''}" data-type="non-billable">⚠️ Non-Bill.</button>
          </div>

          <button class="bs-log-btn" id="bs-log-btn">
            Log ${Math.max(1, Math.round(state.elapsedSecs / 60))} min →
          </button>
        </div>

        <div class="bs-footer">
          <select class="bs-project-select" id="bs-project-select">
            <option value="">Select project...</option>
            ${state.projects.map(p => `<option value="${p.id}" ${p.id === state.selectedProjectId ? 'selected' : ''}>${p.title}</option>`).join('')}
          </select>
          <button class="bs-open-app" id="bs-open-app">Open App ↗</button>
        </div>
      </div>

      <button id="blindspot-toggle" title="BlindSpot Time Tracker">
        ${state.timerRunning ? '⏱' : '⏱'}
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

    document.querySelectorAll('.bs-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedCategory = btn.dataset.cat
        document.querySelectorAll('.bs-cat-btn').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
    })

    document.querySelectorAll('.bs-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedType = btn.dataset.type
        document.querySelectorAll('.bs-type-btn').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
    })

    document.getElementById('bs-log-btn')?.addEventListener('click', logTime)

    document.getElementById('bs-project-select')?.addEventListener('change', (e) => {
      state.selectedProjectId = e.target.value || null
      chrome.storage.local.set({ bs_active_project: state.selectedProjectId })
      if (state.selectedProjectId) loadProjectRate()
    })

    document.getElementById('bs-open-app')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_APP' })
    })
  }

  // ── Timer ────────────────────────────────────────────────────────────
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
    const logBtn = document.getElementById('bs-log-btn')
    if (el) el.textContent = formatTime(state.elapsedSecs)
    if (logBtn) logBtn.textContent = `Log ${Math.max(1, Math.round(state.elapsedSecs / 60))} min →`
  }

  // ── Log time via chrome.storage (main app reads this) ────────────────
  function logTime() {
    if (!state.selectedProjectId) {
      showToast('⚠ Select a project first!', false)
      return
    }
    const mins = Math.max(1, Math.round(state.elapsedSecs / 60))
    const entry = {
      id: crypto.randomUUID(),
      project_id: state.selectedProjectId,
      duration_min: mins || 60,
      entry_type: state.selectedType,
      category: state.selectedCategory,
      notes: 'Logged via Chrome Extension',
      created_at: new Date().toISOString(),
    }
    chrome.storage.local.get(['bs_timelogs'], (data) => {
      const logs = data.bs_timelogs || []
      logs.push(entry)
      chrome.storage.local.set({ bs_timelogs: logs }, () => {
        showToast(`✅ Logged ${mins} min as ${state.selectedCategory}`)
        state.elapsedSecs = 0
        if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null }
        state.timerRunning = false
        state.timerStart   = null
        chrome.storage.local.set({ bs_timer: { running: false, start: null } })
        renderWidget()
        if (state.open) document.getElementById('blindspot-panel')?.classList.add('open')
      })
    })
  }

  // ── Load project rate from storage ───────────────────────────────────
  function loadProjectRate() {
    chrome.storage.local.get(['bs_project_stats'], (data) => {
      if (!data.bs_project_stats || !state.selectedProjectId) return
      const s = data.bs_project_stats[state.selectedProjectId]
      if (!s) return
      state.effectiveRate = s.effectiveRate
      state.riskLevel     = s.riskLevel
      const rateEl = document.getElementById('bs-rate-value')
      const subEl  = document.getElementById('bs-rate-sub')
      if (rateEl) {
        rateEl.textContent  = `₹${Math.round(s.effectiveRate)}`
        rateEl.className    = `bs-rate-value ${s.riskLevel}`
      }
      if (subEl)  subEl.textContent  = `/hr · ${s.riskLevel === 'critical' ? '🔴 Critical' : s.riskLevel === 'warning' ? '🟡 At Risk' : '🟢 Healthy'}`
    })
  }

  // ── Toast notification ────────────────────────────────────────────────
  function showToast(msg, ok = true) {
    const t = document.createElement('div')
    t.className = 'bs-toast'
    t.style.background = ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
    t.style.borderColor = ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'
    t.style.color = ok ? '#10b981' : '#ef4444'
    t.textContent  = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 3000)
  }

  // ── Mount ─────────────────────────────────────────────────────────────
  const host = document.createElement('div')
  host.id = 'blindspot-widget'
  document.body.appendChild(host)
  renderWidget()
})()
