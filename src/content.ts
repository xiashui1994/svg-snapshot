import delay from "delay"
import { documentToSVG, inlineResources } from "dom2svg"
import { saveAs } from "file-saver"
import type { PlasmoCSConfig } from "plasmo"
import prettyBytes from "pretty-bytes"
import formatXML from "xml-formatter"

import { minifySvg } from "./lib/minify"
import { applyDefaults, SETTINGS_KEYS } from "./lib/shared"
import type { CaptureArea, Settings } from "./lib/shared"
import { getStorage } from "./lib/storage"
import { AbortError, insertCrossOrigin, svgNamespace } from "./lib/util"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle",
  all_frames: false
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.method === "capture") {
    capture(message.payload.area)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ error: err.message }))
    return true
  }
})

async function capture(area: CaptureArea): Promise<void> {
  insertCrossOrigin()
  await chrome.runtime.sendMessage({ method: "started" })

  try {
    const captureRect =
      area === "captureArea" ? await selectCaptureArea() : undefined

    document.documentElement.style.cursor = "wait"
    await delay(0)

    const stored = {} as any
    for (const key of SETTINGS_KEYS) {
      stored[key] = await getStorage(key)
    }
    const settings = applyDefaults(stored as Settings)

    let svgDocument = documentToSVG(document, {
      captureArea: captureRect,
      keepLinks: settings.keepLinks
    })

    if (settings.inlineResources) {
      await inlineResources(svgDocument as unknown as SVGSVGElement)
    }

    let svgString = new XMLSerializer().serializeToString(svgDocument)

    if (settings.minifySvg) {
      svgString = await minifySvg(svgString)
    } else if (settings.prettyPrintSvg) {
      svgString = formatXML(svgString)
    }

    const blob = new Blob([svgString], { type: "image/svg+xml" })
    console.log("SVG size:", prettyBytes(blob.size))

    switch (settings.target) {
      case "download":
        saveAs(blob, `${sanitizeFilename(document.title)}.svg`)
        break
      case "clipboard":
        await showCopyConfirmation(svgString)
        break
      case "tab":
        window.open(URL.createObjectURL(blob), "_blank", "noopener")
        break
      default:
        throw new Error(`Unexpected target: ${settings.target}`)
    }
  } finally {
    document.documentElement.style.cursor = ""
    await chrome.runtime.sendMessage({ method: "finished" })
  }
}

async function selectCaptureArea(): Promise<DOMRect> {
  const { clientWidth, clientHeight } = document.documentElement
  const svg = document.createElementNS(svgNamespace, "svg")
  svg.style.cssText = `
    position:fixed; top:0; left:0; width:${clientWidth}px; height:${clientHeight}px;
    cursor:crosshair; z-index:99999999;
  `
  svg.setAttribute("viewBox", `0 0 ${clientWidth} ${clientHeight}`)

  const mask = document.createElementNS(svgNamespace, "mask")
  mask.id = "svg-screenshot-cutout"
  const bg = document.createElementNS(svgNamespace, "rect")
  bg.setAttribute("fill", "white")
  bg.setAttribute("width", clientWidth.toString())
  bg.setAttribute("height", clientHeight.toString())
  mask.append(bg)

  const cutout = document.createElementNS(svgNamespace, "rect")
  cutout.setAttribute("fill", "black")
  mask.append(cutout)

  svg.appendChild(mask)

  const backdrop = document.createElementNS(svgNamespace, "rect")
  backdrop.setAttribute("fill", "rgba(0,0,0,0.5)")
  backdrop.setAttribute("width", clientWidth.toString())
  backdrop.setAttribute("height", clientHeight.toString())
  backdrop.setAttribute("mask", `url(#${mask.id})`)
  svg.appendChild(backdrop)

  document.body.appendChild(svg)

  return new Promise<DOMRect>((resolve, reject) => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && reject(new AbortError("Aborted"))
    window.addEventListener("keyup", onKey, { once: true })

    const onMouseDown = (start: MouseEvent) => {
      start.preventDefault()

      const onMove = (e: MouseEvent) => {
        const x = Math.min(start.clientX, e.clientX)
        const y = Math.min(start.clientY, e.clientY)
        const w = Math.abs(e.clientX - start.clientX)
        const h = Math.abs(e.clientY - start.clientY)
        cutout.setAttribute("x", x.toString())
        cutout.setAttribute("y", y.toString())
        cutout.setAttribute("width", w.toString())
        cutout.setAttribute("height", h.toString())
      }

      const onMouseUp = () => {
        svg.removeEventListener("mousemove", onMove)
        svg.removeEventListener("mouseup", onMouseUp)
        const rect = new DOMRect(
          cutout.x.baseVal.value,
          cutout.y.baseVal.value,
          cutout.width.baseVal.value,
          cutout.height.baseVal.value
        )
        svg.remove()
        resolve(rect)
      }

      svg.addEventListener("mousemove", onMove)
      svg.addEventListener("mouseup", onMouseUp, { once: true })
    }

    svg.addEventListener("mousedown", onMouseDown, { once: true })
  })
}

function sanitizeFilename(name: string): string {
  return name.replace(/["'/\\:?<>|]/g, "")
}

async function showCopyConfirmation(svgString: string): Promise<void> {
  const notification = document.createElement("div")
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    color: #1a1a1a;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 99999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
  `

  const text = document.createElement("span")
  text.textContent = "SVG 生成成功"

  const button = document.createElement("button")
  button.textContent = "复制"
  button.style.cssText = `
    padding: 8px 16px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  `
  
  button.onclick = async () => {
    await navigator.clipboard.writeText(svgString)
    text.textContent = "已复制到剪贴板"
    button.remove()
    setTimeout(() => notification.remove(), 1500)
  }

  notification.append(text, button)
  document.body.appendChild(notification)
}
