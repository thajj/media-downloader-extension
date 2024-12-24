const downloadedUrls = new Set();
const VIDEO_DELAY = 1000; // 1 second delay for videos
const IMAGE_DELAY = 100; // 100ms delay for images
const MAX_RETRIES = 3;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadFile(url, filename, retryCount = 0, isVideo = false) {
  console.log(`Attempting to download: ${url}, attempt ${retryCount + 1}`);
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: url,
        filename: filename,
        conflictAction: "uniquify",
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download failed:", chrome.runtime.lastError);
          if (retryCount < MAX_RETRIES) {
            setTimeout(
              () => {
                downloadFile(url, filename, retryCount + 1, isVideo)
                  .then(resolve)
                  .catch(reject);
              },
              isVideo ? VIDEO_DELAY : IMAGE_DELAY
            );
          } else {
            reject(chrome.runtime.lastError);
          }
        } else {
          console.log(`Download started with ID: ${downloadId}`);
          downloadedUrls.add(url);
          resolve(downloadId);
        }
      }
    );
  });
}

// Log when the background script loads
console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  console.log("From sender:", sender);

  if (
    !request.action &&
    ((request.videoUrls && request.videoUrls.length > 0) ||
      (request.imageUrls && request.imageUrls.length > 0))
  ) {
    console.log("Creating side panel");
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "createSidePanel",
      videoUrls: request.videoUrls,
      imageUrls: request.imageUrls,
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "downloadAll") {
    console.log("Starting downloadAll");
    console.log("Videos to download:", request.videoUrls);
    console.log("Images to download:", request.imageUrls);

    (async () => {
      try {
        if (request.videoUrls) {
          console.log(`Processing ${request.videoUrls.length} videos`);
          for (const videoUrl of request.videoUrls) {
            if (!downloadedUrls.has(videoUrl.url)) {
              console.log(`Downloading video: ${videoUrl.url}`);
              await downloadFile(videoUrl.url, videoUrl.filename, 0, true);
              await delay(VIDEO_DELAY);
            } else {
              console.log(`Skipping already downloaded video: ${videoUrl.url}`);
            }
          }
        }

        if (request.imageUrls) {
          console.log(`Processing ${request.imageUrls.length} images`);
          for (const imageUrl of request.imageUrls) {
            if (!downloadedUrls.has(imageUrl.url)) {
              console.log(`Downloading image: ${imageUrl.url}`);
              await downloadFile(imageUrl.url, imageUrl.filename, 0, false);
              await delay(IMAGE_DELAY);
            } else {
              console.log(`Skipping already downloaded image: ${imageUrl.url}`);
            }
          }
        }
        console.log("All downloads completed successfully");
        sendResponse({ success: true });
      } catch (error) {
        console.error("Download error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.action === "downloadVideo") {
    downloadFile(request.videoUrl, request.filename, 0, true)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error("Error downloading video:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "downloadImage") {
    downloadFile(request.imageUrl, request.filename, 0, false)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error("Error downloading image:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});
