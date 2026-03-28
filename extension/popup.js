const APP_URL = 'http://localhost:5173'
const API_URL = 'http://10.10.227.15:8000/scout'

document.getElementById('api-host').textContent = API_URL.replace('http://', '').replace('/scout', '')

let progressTimer = null
let gameRunning = false
let animId = null
let canvas, ctx
let basket, items, lives, income, expense, taxDodged, frameCount, speed
const floatingTexts = []
let flashAlpha = 0
const keys = {}

const ITEMS = [
  { emoji: '💰', type: 'income', value: 500, label: '+₹500', catch: true, color: '#4ade80' },
  { emoji: '💻', type: 'expense', value: 300, label: '+₹300', catch: true, color: '#60a5fa' },
  { emoji: '🪙', type: 'income', value: 200, label: '+₹200', catch: true, color: '#fbbf24' },
  { emoji: '🧾', type: 'tax', value: 1000, label: '-₹1000', catch: false, color: '#f87171' },
  { emoji: '🏦', type: 'gst', value: 1500, label: '-₹1500', catch: false, color: '#f87171' },
  { emoji: '📄', type: 'tax', value: 800, label: '-₹800', catch: false, color: '#fb923c' },
]
const PUNCHLINES = [
  'Your CA would be proud. Or worried.',
  'Section 80C has entered the chat.',
  'You optimized risk like a pro.',
  'You just dodged digital tax chaos.'
]

function switchTab(tab) {
  document.getElementById('tab-scout').classList.toggle('active', tab === 'scout')
  document.getElementById('tab-game').classList.toggle('active', tab === 'game')
  document.getElementById('scout-tab').classList.toggle('active', tab === 'scout')
  document.getElementById('game-tab').classList.toggle('active', tab === 'game')
  if (tab === 'game') resizeCanvas()
}

function setProgress(pct, text, activeStep) {
  document.getElementById('progress-fill').style.width = pct + '%'
  document.getElementById('progress-pct').textContent = pct + '%'
  document.getElementById('progress-text').textContent = text
  ;['scraper', 'extractor', 'matcher'].forEach((s, i) => {
    const el = document.getElementById('step-' + s)
    el.classList.remove('active', 'done')
    if (i < activeStep) el.classList.add('done')
    else if (i === activeStep) el.classList.add('active')
  })
}

function startProgressAnimation() {
  let phaseIdx = 0
  let pct = 0
  const phases = [
    [0, 10, 'Launching agents...', 0],
    [10, 35, 'Scraper hunting jobs...', 0],
    [35, 65, 'Extractor parsing details...', 1],
    [65, 90, 'Matcher filtering skill fit...', 2],
    [90, 97, 'Formatting results...', 2],
  ]
  progressTimer = setInterval(() => {
    if (phaseIdx >= phases.length) return
    const [, end, text, s] = phases[phaseIdx]
    pct = Math.min(pct + 0.8, end)
    setProgress(Math.round(pct), text, s)
    if (pct >= end) phaseIdx++
  }, 350)
}

function stopProgressAnimation(success) {
  if (progressTimer) clearInterval(progressTimer)
  if (success) {
    setProgress(100, 'Done! Gigs found', 3)
    setTimeout(() => { document.getElementById('progress-wrap').style.display = 'none' }, 1000)
  }
}

function escHtml(str) {
  const d = document.createElement('div')
  d.textContent = String(str || '')
  return d.innerHTML
}

function renderProjects(projects) {
  const container = document.getElementById('results-container')
  if (!projects.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔎</div><div class="empty-title">No Matches Found</div><div class="empty-sub">Try again in a few minutes.</div></div>'
    return
  }
  const icons = { upwork: '🟢', fiverr: '🟣', freelancer: '🔵', toptal: '🔴', guru: '🟠' }
  container.innerHTML = '<div class="results-header">🎯 ' + projects.length + ' Matching Projects</div>' +
    projects.map((p) => {
      const icon = icons[(p.platform || '').toLowerCase()] || '⚪'
      return '<div class="project-card">' +
        '<div class="card-top"><span>' + icon + ' ' + escHtml(p.platform || 'Unknown') + '</span><span>' + escHtml(p.bid || 'N/A') + '</span></div>' +
        '<div class="card-name">' + escHtml(p.name || 'Untitled project') + '</div>' +
        '<div class="card-footer"><span>#' + escHtml(p.project_id || 'n/a') + '</span>' +
        '<a class="card-link" href="' + escHtml(p.project_url || APP_URL) + '" target="_blank" rel="noopener">Apply ↗</a></div>' +
      '</div>'
    }).join('')
}

async function runScout() {
  const btn = document.getElementById('run-scout')
  const wrap = document.getElementById('progress-wrap')
  const container = document.getElementById('results-container')

  btn.disabled = true
  btn.textContent = 'Agents Scouting...'
  container.innerHTML = ''
  wrap.style.display = 'block'
  startProgressAnimation()

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Freelance projects Web Development React Python AI Automation Upwork Fiverr Freelancer',
        skills: 'Software/Web development (React, Python), AI automation, FastAPI'
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || ('Server error ' + response.status))

    stopProgressAnimation(true)
    renderProjects(data.projects || [])
  } catch (err) {
    stopProgressAnimation(false)
    container.innerHTML = '<div class="error-card"><div class="error-title">⚠️ Agent Error</div><div class="error-body">' + escHtml(err.message) + '<br><br>Check API server and CORS configuration.</div></div>'
  } finally {
    btn.disabled = false
    btn.textContent = '🔄 Refresh Gigs'
  }
}

function resizeCanvas() {
  canvas = document.getElementById('game-canvas')
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  canvas.width = Math.max(280, Math.floor(rect.width))
  canvas.height = 280
  if (!gameRunning) drawIdle()
}

function initGame() {
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')
  resizeCanvas()
  basket = { x: canvas.width / 2 - 36, y: canvas.height - 50, w: 72, h: 28, speed: 7 }
  items = []
  lives = 5
  income = 0
  expense = 0
  taxDodged = 0
  frameCount = 0
  speed = 2
  floatingTexts.length = 0
  updateHUD()
}

function drawIdle() {
  if (!ctx || !canvas) return
  ctx.fillStyle = '#020817'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.font = '28px serif'
  ctx.fillText('🎮', canvas.width / 2, canvas.height / 2 - 18)
  ctx.font = 'bold 13px Segoe UI'
  ctx.fillStyle = '#64748b'
  ctx.fillText('Click Start to play Tax Dodge', canvas.width / 2, canvas.height / 2 + 12)
}

function updateHUD() {
  document.getElementById('g-income').textContent = '₹' + income.toLocaleString('en-IN')
  document.getElementById('g-expense').textContent = '₹' + expense.toLocaleString('en-IN')
  document.getElementById('g-taxdodged').textContent = '₹' + taxDodged.toLocaleString('en-IN')
  document.getElementById('g-lives').textContent = lives > 0 ? '❤️'.repeat(lives) : '💀'
}

function spawnItem() {
  const tmpl = ITEMS[Math.floor(Math.random() * ITEMS.length)]
  const x = Math.random() * (canvas.width - 36) + 18
  items.push({ ...tmpl, x, y: -24, size: 26 + Math.random() * 8, vy: speed + Math.random() * 1.5 })
}

function addFloatText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, alpha: 1, vy: -1.5 })
}

function drawBackground() {
  ctx.fillStyle = '#020817'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawBasket() {
  const b = basket
  const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(1, '#4338ca')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(b.x, b.y, b.w, b.h, 8)
  ctx.fill()
  ctx.font = '14px serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.fillText('🧺', b.x + b.w / 2, b.y + b.h / 2 + 5)
}

function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]
    it.y += it.vy

    ctx.font = it.size + 'px serif'
    ctx.textAlign = 'center'
    ctx.fillText(it.emoji, it.x, it.y)

    const hw = it.size / 2
    if (it.y + hw / 2 >= basket.y && it.y - hw / 2 <= basket.y + basket.h && it.x + hw >= basket.x && it.x - hw <= basket.x + basket.w) {
      if (it.catch) {
        if (it.type === 'income') income += it.value
        else expense += it.value
        addFloatText(it.x, it.y, it.label, it.color)
      } else {
        lives--
        taxDodged += it.value
        addFloatText(it.x, it.y, '💀 TAX!', '#f87171')
        flashAlpha = 0.35
      }
      updateHUD()
      items.splice(i, 1)
      continue
    }

    if (it.y > canvas.height + 20) items.splice(i, 1)
  }
}

function updateFloatTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i]
    ft.y += ft.vy
    ft.alpha -= 0.025
    ctx.globalAlpha = Math.max(ft.alpha, 0)
    ctx.font = 'bold 13px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillStyle = ft.color
    ctx.fillText(ft.text, ft.x, ft.y)
    ctx.globalAlpha = 1
    if (ft.alpha <= 0) floatingTexts.splice(i, 1)
  }
}

function endGame() {
  gameRunning = false
  cancelAnimationFrame(animId)
  document.getElementById('start-btn').textContent = '▶ Start Game'
  document.getElementById('start-btn').disabled = false

  const saved = income + expense
  document.getElementById('go-emoji').textContent = saved > 5000 ? '🤑' : (saved > 2000 ? '😎' : '😅')
  document.getElementById('go-amount').textContent = '₹' + saved.toLocaleString('en-IN')
  document.getElementById('go-subtitle').textContent = 'AI reviewed your gameplay. Estimated optimization complete.'
  document.getElementById('go-punchline').textContent = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)]
  document.getElementById('game-over-overlay').classList.add('show')
}

function loop() {
  if (!gameRunning) return
  animId = requestAnimationFrame(loop)
  frameCount++
  drawBackground()

  if (frameCount % 360 === 0) speed = Math.min(speed + 0.25, 6)
  if (frameCount % Math.max(45 - Math.floor(speed * 4), 18) === 0) spawnItem()

  if ((keys.ArrowLeft || keys.a) && basket.x > 0) basket.x -= basket.speed
  if ((keys.ArrowRight || keys.d) && basket.x < canvas.width - basket.w) basket.x += basket.speed

  drawBasket()
  updateItems()
  updateFloatTexts()

  if (flashAlpha > 0) {
    ctx.fillStyle = 'rgba(239, 68, 68, ' + flashAlpha + ')'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    flashAlpha = Math.max(flashAlpha - 0.04, 0)
  }

  if (lives <= 0) endGame()
}

function startGame() {
  if (gameRunning) return
  document.getElementById('game-over-overlay').classList.remove('show')
  initGame()
  gameRunning = true
  const btn = document.getElementById('start-btn')
  btn.textContent = '⏸ Playing...'
  btn.disabled = true
  loop()
}

function resetGame() {
  cancelAnimationFrame(animId)
  gameRunning = false
  document.getElementById('game-over-overlay').classList.remove('show')
  const btn = document.getElementById('start-btn')
  btn.textContent = '▶ Start Game'
  btn.disabled = false
  initGame()
}

function onMouseMove(e) {
  if (!gameRunning || !basket || !canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const cx = ((e.clientX ?? 0) - rect.left) * scaleX
  basket.x = Math.max(0, Math.min(canvas.width - basket.w, cx - basket.w / 2))
}

document.getElementById('tab-scout').addEventListener('click', () => switchTab('scout'))
document.getElementById('tab-game').addEventListener('click', () => switchTab('game'))
document.getElementById('run-scout').addEventListener('click', runScout)
document.getElementById('start-btn').addEventListener('click', startGame)
document.getElementById('reset-btn').addEventListener('click', resetGame)
document.getElementById('go-close-btn').addEventListener('click', () => {
  document.getElementById('game-over-overlay').classList.remove('show')
  resetGame()
})

document.addEventListener('keydown', (e) => { keys[e.key] = true })
document.addEventListener('keyup', (e) => { keys[e.key] = false })
document.addEventListener('mousemove', onMouseMove)
window.addEventListener('resize', resizeCanvas)

initGame()

// Keep previous quick open behavior available from popup context.
chrome.storage.local.get(['bs_active_project', 'bs_project_stats'], (data) => {
  if (!data.bs_active_project || !data.bs_project_stats) return
  const stats = data.bs_project_stats[data.bs_active_project]
  if (!stats) return
})

