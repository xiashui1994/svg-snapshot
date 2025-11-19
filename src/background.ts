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
  }
})
