import { MediaDetector } from "./mediaDetector";
import { SidePanel } from "./sidePanel";
import { debounce } from "./utils";

(function () {
  let sidePanelCreated = false;
  let sidePanel = null;
  const mediaDetector = new MediaDetector();

  function initialize() {
    const debouncedFindMedia = debounce(() => {
      const mediaUrls = mediaDetector.findMediaUrls();
      if (
        !sidePanelCreated &&
        (mediaUrls.videoUrls.length > 0 || mediaUrls.imageUrls.length > 0)
      ) {
        console.log("Media found:", mediaUrls);
        createSidePanel(mediaUrls);
        sidePanelCreated = true;
      }
    }, 250);

    const observer = new MutationObserver(debouncedFindMedia);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "data-src", "data-srcset"],
    });

    debouncedFindMedia();
  }

  function createSidePanel(mediaUrls) {
    if (!sidePanel) {
      console.log("Creating side panel with media:", mediaUrls);
      sidePanel = new SidePanel(mediaUrls);
      sidePanel.create();
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === "createSidePanel") {
      const mediaUrls = mediaDetector.findMediaUrls();
      createSidePanel(mediaUrls);
      sendResponse({ success: true });
    } else if (request.action === "downloadProgress" && sidePanel) {
      sidePanel.updateDownloadProgress(request.url, request.progress);
    } else if (request.action === "settingsUpdated" && sidePanel) {
      sidePanel.handleSettingsUpdate(request.settings);
      sendResponse({ success: true });
    }
    return true;
  });

  console.log("Content script initialized");
  initialize();
})();
