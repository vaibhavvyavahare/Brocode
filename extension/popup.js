// popup.js
const APP_URL = 'http://localhost:5173'

document.getElementById('open-app-btn').href = APP_URL + '/app'
document.getElementById('open-app-btn').addEventListener('click', (e) => {
  e.preventDefault()
  chrome.tabs.create({ url: APP_URL + '/app' })
})

chrome.storage.local.get(['bs_active_project', 'bs_project_stats'], (data) => {
  if (!data.bs_active_project || !data.bs_project_stats) return
  const stats = data.bs_project_stats[data.bs_active_project]
  if (!stats) return
  document.getElementById('rate-display').textContent = `₹${Math.round(stats.effectiveRate)}`
  document.getElementById('rate-sub').textContent = `/hr · ${
    stats.riskLevel === 'critical' ? '🔴 Critical'
    : stats.riskLevel === 'warning' ? '🟡 At Risk'
    : '🟢 Healthy'
  }`
  document.getElementById('rate-display').style.color =
    stats.riskLevel === 'critical' ? '#ef4444'
    : stats.riskLevel === 'warning' ? '#f59e0b'
    : '#10b981'
})
