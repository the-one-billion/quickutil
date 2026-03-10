const frame       = document.getElementById("frame");
const offlineMsg  = document.getElementById("offline-msg");
const btnHome     = document.getElementById("btn-home");
const btnTools    = document.getElementById("btn-tools");
const btnOpenTab  = document.getElementById("btn-open-tab");
const btnRetry    = document.getElementById("btn-retry");

const BASE = "https://quickutil.io";

function navigate(url) {
  frame.hidden = false;
  offlineMsg.hidden = true;
  frame.src = url;
}

// Handle iframe load errors
frame.addEventListener("error", () => {
  frame.hidden = true;
  offlineMsg.hidden = false;
});

// Toolbar buttons
btnHome.addEventListener("click",    () => navigate(BASE));
btnTools.addEventListener("click",   () => navigate(`${BASE}/tools`));
btnOpenTab.addEventListener("click", () => {
  chrome.tabs.create({ url: frame.src || BASE });
});
btnRetry.addEventListener("click",   () => navigate(frame.src || BASE));

// Check if background sent a pending tool to open (via context menu)
chrome.storage.session.get("pendingTool", ({ pendingTool }) => {
  if (pendingTool) {
    navigate(`${BASE}/tools/${pendingTool}`);
    chrome.storage.session.remove("pendingTool");
  }
});

// Listen for future pending tool updates (user might use context menu after panel is open)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "session" && changes.pendingTool?.newValue) {
    navigate(`${BASE}/tools/${changes.pendingTool.newValue}`);
    chrome.storage.session.remove("pendingTool");
  }
});
