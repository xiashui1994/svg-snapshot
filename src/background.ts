import { fetchBase64 } from "./lib/util"

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.method) {
    case "started":
      chrome.action.disable(sender.tab!.id!)
      sendResponse({ status: "ok" })
      return true
    case "finished":
      chrome.action.enable(sender.tab!.id!)
      sendResponse({ status: "ok" })
      return true
    case "fetch":
      fetch(msg.url, msg.options)
        .then(async (res) => {
          const base64 = await fetchBase64(res)
          sendResponse({
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            base64,
            type: res.headers.get("content-type") || ""
          })
        })
        .catch((err) => sendResponse({ error: err.message }))
      return true
  }
})
