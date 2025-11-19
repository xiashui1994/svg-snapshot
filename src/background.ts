import { inlineResources } from 'dom-to-svg'

chrome.runtime.onMessage.addListener(async (message: any, sender: any) => {
	const { method, payload } = message
	switch (method) {
		// Disable action while a page is capturing
		case 'started': {
			await chrome.action.disable(sender.tab!.id!)
			return
		}
		case 'finished': {
			await chrome.action.enable(sender.tab!.id!)
			return
		}
		case 'postProcessSVG': {
			return postProcessSVG(payload)
		}
	}
})

async function postProcessSVG(svg: string): Promise<string> {
	const svgDocument = new DOMParser().parseFromString(svg, 'image/svg+xml')
	const svgRootElement = svgDocument.documentElement as Element as SVGSVGElement
	// Append to DOM so SVG elements are attached to a window/have defaultView, so window.getComputedStyle() works
	// This is safe, the generated SVG contains no JavaScript and even if it did, the background page CSP disallows any external or inline scripts.
	document.body.prepend(svgRootElement)
	try {
		await inlineResources(svgRootElement)
	} finally {
		svgRootElement.remove()
	}
	return new XMLSerializer().serializeToString(svgRootElement)
}
