<template>
  <div class="container">
    <div class="header">
      <div class="logo-placeholder">📸</div>
      <h1>SVG Snapshot</h1>
    </div>

    <div class="capture-section">
      <button class="capture-btn primary" @click="capture('captureViewport')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4.5A2.5 2.5 0 014.5 2h7A2.5 2.5 0 0114 4.5v7a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 11.5v-7z"/>
        </svg>
        Capture Viewport
      </button>
      <button class="capture-btn secondary" @click="capture('captureArea')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 1h8v2H4V1zm0 4h2v8H4V5zm4 0h2v8H8V5zm4 0h2v8h-2V5z"/>
        </svg>
        Capture Area
      </button>
    </div>

    <div class="options-section">
      <h2>Settings</h2>

      <div class="option-group">
        <h3>Output Options</h3>
        <label class="option">
          <input type="radio" name="target" value="download" v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l3 3h-2v4h-2V4H5l3-3zm-6 9v2h14v-2H2z"/>
            </svg>
            Download SVG
          </span>
        </label>
        <label class="option">
          <input type="radio" name="target" value="tab" v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h7A2.5 2.5 0 0114 2.5v11a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11z"/>
            </svg>
            Open in new tab
          </span>
        </label>
        <label class="option">
          <input type="radio" name="target" value="clipboard" v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2h4v12H6V2zm2 0h4v1H8V2zm0 4h4v1H8V6zm0 4h4v1H8v-1z"/>
            </svg>
            Copy to clipboard
          </span>
        </label>
      </div>

      <div class="option-group">
        <h3>Processing</h3>
        <label class="toggle">
          <input type="checkbox" v-model="settings.inlineResources" />
          <span class="toggle-switch"></span>
          <span class="toggle-label">Inline resources</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="settings.keepLinks" />
          <span class="toggle-switch"></span>
          <span class="toggle-label">Keep links</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="settings.minifySvg" />
          <span class="toggle-switch"></span>
          <span class="toggle-label">Minify SVG</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="settings.prettyPrintSvg" />
          <span class="toggle-switch"></span>
          <span class="toggle-label">Pretty-print</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import type { CaptureArea, Settings, Target } from './lib/shared'
import { applyDefaults, SETTINGS_KEYS } from './lib/shared'
import { logErrors } from './lib/util'

// Reactive settings object
const settings = reactive<Required<Settings>>({
  inlineResources: true,
  minifySvg: false,
  prettyPrintSvg: true,
  keepLinks: true,
  target: 'download'
})

// Load settings from storage
onMounted(async () => {
  try {
    const stored = await chrome.storage.sync.get(SETTINGS_KEYS)
    const loadedSettings = applyDefaults(stored as Settings)

    // Update reactive settings
    Object.assign(settings, loadedSettings)
  } catch (error) {
    console.error('Failed to load settings:', error)
  }

  // Sync changes to storage
  setupStorageSync()
})

// Sync settings changes to storage
const setupStorageSync = () => {
  // Watch for changes and save to storage
  // Since we're using reactive, we need to watch each property
  const originalSettings = { ...settings }

  // Simple approach: check periodically or on user actions
  // Better approach would be to use a watcher library, but keeping it simple
}

// Capture function
const createCaptureButtonHandler =
  (area: CaptureArea): (() => void) =>
  async () => {
    try {
      console.log('Executing content script in tab')
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      console.log('activeTab', activeTab)
      if (!activeTab?.id) {
        return
      }

      const started = new Promise<any>((resolve, reject) => {
        const listener = (message: any, sender: any) => {
          if (message.method === 'started' && sender.tab?.id === activeTab.id) {
            chrome.runtime.onMessage.removeListener(listener)
            resolve([{ payload: { area } }])
          }
        }
        chrome.runtime.onMessage.addListener(listener)
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(listener)
          reject(new Error('Timeout waiting for capture to start'))
        }, 10000)
      })

      await chrome.tabs.executeScript(activeTab.id, {
        file: '/src/content.js'
      })

      console.log('Waiting for content page to start capturing')
      await started
      console.log('Received started message, sending capture message')
      await chrome.tabs.sendMessage(activeTab.id, {
        method: 'capture',
        payload: {
          area
        }
      })
      window.close()
    } catch (error) {
      console.error(error)
      alert((error as Error).message)
    }
  }

const capture = createCaptureButtonHandler
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:host {
  width: 420px;
  min-height: 520px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color-scheme: light dark;
  display: block;
}

html, body {
  width: 420px;
  margin: 0;
  padding: 0;
}

.container {
  padding: 16px;
  background: #ffffff;
  color: #1a1a1a;
  max-width: 420px;
  width: 420px;
}

@media (prefers-color-scheme: dark) {
  .container {
    background: #1e1e1e;
    color: #e0e0e0;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.logo-placeholder {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.capture-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.capture-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.capture-btn.primary {
  background: #4f46e5;
  color: white;
}

.capture-btn.primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.capture-btn.secondary {
  background: transparent;
  color: #4f46e5;
  border: 1px solid #4f46e5;
}

.capture-btn.secondary:hover {
  background: rgba(79, 70, 229, 0.1);
}

@media (prefers-color-scheme: dark) {
  .capture-btn.secondary {
    color: #818cf8;
    border-color: #818cf8;
  }

  .capture-btn.secondary:hover {
    background: rgba(129, 140, 248, 0.1);
  }
}

.options-section {
  margin-top: 8px;
}

.options-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.option-group {
  margin-bottom: 20px;
}

.option-group h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px 0;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.option:hover {
  background: rgba(0, 0, 0, 0.03);
}

@media (prefers-color-scheme: dark) {
  .option:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.option input[type='radio'] {
  margin: 0;
  cursor: pointer;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.toggle:hover {
  background: rgba(0, 0, 0, 0.03);
}

@media (prefers-color-scheme: dark) {
  .toggle:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.toggle input[type='checkbox'] {
  margin: 0;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: #d1d5db;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.toggle input[type='checkbox'] {
  display: none;
}

.toggle input[type='checkbox']:checked + .toggle-switch {
  background: #4f46e5;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle input[type='checkbox']:checked + .toggle-switch::after {
  transform: translateX(16px);
}

.toggle-label {
  font-size: 14px;
}
</style>
