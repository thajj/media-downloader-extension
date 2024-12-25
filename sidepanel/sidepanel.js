// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.webmUrls) {
    createSidePanel(request.webmUrls);
  }
});

function createSidePanel(webmUrls) {
  const sidePanel = document.createElement("div");
  const webmList = document.createElement("ul");
  const downloadAllButton = document.createElement("button");
  downloadAllButton.textContent = "Download All";

  webmUrls.forEach((url) => {
    const listItem = document.createElement("li");
    listItem.textContent = url;

    listItem.addEventListener("click", () => {
      chrome.downloads.download({
        url: url,
        filename: "downloaded_webm.webm", // Customize filename if desired
      });
    });
    webmList.appendChild(listItem);
  });

  downloadAllButton.addEventListener("click", () => {
    webmUrls.forEach((url) => {
      chrome.downloads.download({
        url: url,
        filename: "downloaded_webm.webm",
      });
    });
  });

  sidePanel.appendChild(webmList);
  sidePanel.appendChild(downloadAllButton);
  document.body.appendChild(sidePanel);
}
