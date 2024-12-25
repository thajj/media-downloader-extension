const downloadedUrls = new Set();
const VIDEO_DELAY = 1000;
const IMAGE_DELAY = 100;
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

console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "downloadVideo":
    case "downloadImage":
      if (request.downloadInfo && request.downloadInfo.url) {
        chrome.downloads.download(
          {
            url: request.downloadInfo.url,
            filename: request.downloadInfo.filename,
          },
          (downloadId) => {
            if (chrome.runtime.lastError) {
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "downloadProgress",
                url: request.downloadInfo.url,
                progress: { state: "error" },
              });
            } else {
              chrome.downloads.onChanged.addListener(function downloadListener(
                delta
              ) {
                if (delta.id === downloadId) {
                  if (delta.state) {
                    if (delta.state.current === "complete") {
                      chrome.tabs.sendMessage(sender.tab.id, {
                        action: "downloadProgress",
                        url: request.downloadInfo.url,
                        progress: { state: "complete" },
                      });
                      chrome.downloads.onChanged.removeListener(
                        downloadListener
                      );
                    } else if (delta.state.current === "interrupted") {
                      chrome.tabs.sendMessage(sender.tab.id, {
                        action: "downloadProgress",
                        url: request.downloadInfo.url,
                        progress: { state: "error" },
                      });
                      chrome.downloads.onChanged.removeListener(
                        downloadListener
                      );
                    }
                  }
                }
              });
            }
          }
        );
      }
      break;

    case "downloadAll":
      if (request.downloads) {
        const { videos, images } = request.downloads;

        videos.forEach((video) => {
          if (video.url) {
            chrome.downloads.download({
              url: video.url,
              filename: video.filename,
            });
          }
        });

        images.forEach((image) => {
          if (image.url) {
            chrome.downloads.download({
              url: image.url,
              filename: image.filename,
            });
          }
        });

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No downloads provided" });
      }
      break;
  }

  return true;
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "createSidePanel" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError);
    }
  });
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.bytesReceived || delta.totalBytes) {
    chrome.downloads.search({ id: delta.id }, (downloads) => {
      if (downloads && downloads[0]) {
        const download = downloads[0];
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, {
              action: "downloadProgress",
              url: download.url,
              progress: {
                state: "in_progress",
                bytesReceived: download.bytesReceived,
                totalBytes: download.totalBytes,
              },
            });
          });
        });
      }
    });
  }
});
