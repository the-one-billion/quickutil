// Background service worker — MV3

// Open side panel when the toolbar icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// Context menu: right-click on any selection → open QuickUtil
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quickutil-open",
    title: "Open QuickUtil Tools",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "quickutil-wordcount",
    title: "Word count selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "quickutil-caseconvert",
    title: "Convert case",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.windowId) return;

  // Open side panel first
  await chrome.sidePanel.open({ windowId: tab.windowId });

  const slug = {
    "quickutil-wordcount":   "word-counter",
    "quickutil-caseconvert": "case-converter",
    "quickutil-open":        null,
  }[info.menuItemId];

  if (slug) {
    // Store the requested tool slug so sidepanel.html can pick it up
    await chrome.storage.session.set({ pendingTool: slug });
  }
});
