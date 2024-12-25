// Default settings
const DEFAULT_SETTINGS = {
  autoDetect: true,
  panelPosition: "right",
  downloadPath: "",
  groupByType: true,
  showNotifications: true,
};

async function initializePopup() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById("version").textContent = manifest.version;

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  document.getElementById("autoDetect").checked = settings.autoDetect;
  document.getElementById("panelPosition").value = settings.panelPosition;
  document.getElementById("downloadPath").value = settings.downloadPath;
  document.getElementById("groupByType").checked = settings.groupByType;
  document.getElementById("showNotifications").checked =
    settings.showNotifications;
}

document.addEventListener("DOMContentLoaded", initializePopup);

async function saveSettings() {
  const settings = {
    autoDetect: document.getElementById("autoDetect").checked,
    panelPosition: document.getElementById("panelPosition").value,
    downloadPath: document.getElementById("downloadPath").value,
    groupByType: document.getElementById("groupByType").checked,
    showNotifications: document.getElementById("showNotifications").checked,
  };

  try {
    await chrome.storage.sync.set(settings);

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "settingsUpdated",
        settings: settings,
      });
    }

    const button = document.getElementById("saveSettings");
    const originalText = button.textContent;
    button.textContent = "Saved!";
    button.style.backgroundColor = "#45a049";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = "#4CAF50";
    }, 1500);
  } catch (error) {
    console.error("Error saving settings:", error);
    // Show error feedback
    const button = document.getElementById("saveSettings");
    button.textContent = "Error!";
    button.style.backgroundColor = "#f44336";

    setTimeout(() => {
      button.textContent = "Save Settings";
      button.style.backgroundColor = "#4CAF50";
    }, 1500);
  }
}
