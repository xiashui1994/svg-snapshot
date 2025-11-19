<template>
  <div class="container">
    <div class="capture-section">
      <button
        class="capture-btn primary"
        @click="createCapture('captureViewport')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM3.5 3a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z" />
          <path d="M5 5h6v6H5V5z" opacity="0.4" />
        </svg>
        Capture Viewport
      </button>
      <button
        class="capture-btn secondary"
        @click="createCapture('captureArea')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M2 1h2v2H2V1zm10 0h2v2h-2V1zM2 13h2v2H2v-2zm10 0h2v2h-2v-2z" />
          <path
            d="M1 4h2v8H1V4zm12 0h2v8h-2V4zM4 1h8v2H4V1zm0 12h8v2H4v-2z"
            opacity="0.6" />
          <path d="M5 5h6v6H5V5z" opacity="0.25" />
        </svg>
        Capture Area
      </button>
    </div>

    <div class="options-section">
      <h2>Settings</h2>

      <div class="option-group">
        <h3>Output Options</h3>
        <label class="option">
          <input
            type="radio"
            name="target"
            value="download"
            v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 1a.5.5 0 01.5.5v7.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L7.5 9.293V1.5A.5.5 0 018 1z" />
              <path
                d="M2 13.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
            </svg>
            Download SVG
          </span>
        </label>
        <label class="option">
          <input
            type="radio"
            name="target"
            value="tab"
            v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M2 2.5A1.5 1.5 0 013.5 1h4a.5.5 0 010 1h-4a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-4a.5.5 0 011 0v4A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-9z" />
              <path
                d="M10.5 1a.5.5 0 000 1h2.793l-4.147 4.146a.5.5 0 00.708.708L14 2.707V5.5a.5.5 0 001 0v-4a.5.5 0 00-.5-.5h-4z" />
            </svg>
            Open in new tab
          </span>
        </label>
        <label class="option">
          <input
            type="radio"
            name="target"
            value="clipboard"
            v-model="settings.target" />
          <span class="option-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M4 2a2 2 0 012-2h4a2 2 0 012 2h1a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h1zm2-1a1 1 0 00-1 1h6a1 1 0 00-1-1H6zM3 3v10h10V3H3z" />
              <path
                d="M5 6h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z"
                opacity="0.6" />
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
import { onMounted, reactive, watch } from "vue"

import type { CaptureArea, Settings } from "./lib/shared"
import { applyDefaults, SETTINGS_KEYS } from "./lib/shared"
import { getStorage, setStorage } from "./lib/storage"

// Reactive settings object
const settings = reactive<Required<Settings>>({
  inlineResources: true,
  minifySvg: false,
  prettyPrintSvg: true,
  keepLinks: true,
  target: "download"
})

// Load settings from storage
onMounted(async () => {
  try {
    // Get all settings - Storage supports array of keys
    const stored = {} as any
    for (const key of SETTINGS_KEYS) {
      stored[key] = await getStorage(key)
    }
    const loadedSettings = applyDefaults(stored as Settings)

    // Update reactive settings
    Object.assign(settings, loadedSettings)
  } catch (error) {
    console.error("Failed to load settings:", error)
  }
})

// Sync settings changes to storage
watch(
  settings,
  async (newSettings) => {
    try {
      // Save each setting individually for better granularity
      for (const [key, value] of Object.entries(newSettings)) {
        await setStorage(key, value)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  },
  { deep: true }
)

const createCapture = async (area: CaptureArea): Promise<void> => {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    if (!activeTab?.id) return

    chrome.tabs.sendMessage(activeTab.id, {
      method: "capture",
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
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:host {
  width: 320px;
  min-height: 480px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  color-scheme: light dark;
  display: block;
}

html,
body {
  width: 320px;
  margin: 0;
  padding: 0;
}

.container {
  padding: 14px;
  background: #ffffff;
  color: #1a1a1a;
  max-width: 320px;
  width: 320px;
}

@media (prefers-color-scheme: dark) {
  .container {
    background: #1e1e1e;
    color: #e0e0e0;
  }
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

.option input[type="radio"] {
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

.toggle input[type="checkbox"] {
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

.toggle input[type="checkbox"] {
  display: none;
}

.toggle input[type="checkbox"]:checked + .toggle-switch {
  background: #4f46e5;
}

.toggle-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle input[type="checkbox"]:checked + .toggle-switch::after {
  transform: translateX(16px);
}

.toggle-label {
  font-size: 14px;
}
</style>
