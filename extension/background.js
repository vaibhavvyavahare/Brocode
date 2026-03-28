// BlindSpot Chrome Extension — background.js (service worker)
// Manages timer state, storage sync, and app communication

const APP_URL = 'http://localhost:5173' // Change to Vercel URL after deploy

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'OPEN_APP') {
    chrome.tabs.create({ url: APP_URL + '/app' })
  }

  if (msg.type === 'TIMER_STATE') {
    chrome.storage.local.set({ bs_timer: msg.payload })
  }

  if (msg.type === 'GET_TIMER') {
    chrome.storage.local.get(['bs_timer'], data => reply(data.bs_timer || { running: false }))
    return true
  }

  if (msg.type === 'SAVE_PROJECTS') {
    chrome.storage.local.set({ bs_projects: msg.payload })
  }

  if (msg.type === 'SAVE_STATS') {
    chrome.storage.local.set({ bs_project_stats: msg.payload })
  }
})

// Keep service worker alive during active timer
chrome.storage.local.get(['bs_timer'], data => {
  if (data.bs_timer?.running) {
    console.log('[BlindSpot] Timer is running since', new Date(data.bs_timer.start).toLocaleTimeString())
  }
})
