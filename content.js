// content.js
let sidePanelCreated = false;
let videoUrls = []; // Start with an empty array
let imageUrls = []; // Add array for images

function findMediaUrls() {
  // Find videos
  const videoLinks = document.querySelectorAll(
    'a[href$=".webm"], a[href$=".mp4"]'
  );

  // Find images
  const imageLinks = document.querySelectorAll(
    'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"]'
  );

  // Process videos
  for (const link of videoLinks) {
    const newVideoUrl = {
      url: link.href,
      filename: link.href.substring(link.href.lastIndexOf("/") + 1),
    };

    if (!videoUrls.some((existingUrl) => existingUrl.url === newVideoUrl.url)) {
      videoUrls.push(newVideoUrl);
    }
  }

  // Process images
  for (const link of imageLinks) {
    const newImageUrl = {
      url: link.href,
      filename: link.href.substring(link.href.lastIndexOf("/") + 1),
    };

    if (!imageUrls.some((existingUrl) => existingUrl.url === newImageUrl.url)) {
      imageUrls.push(newImageUrl);
    }
  }

  if ((videoUrls.length > 0 || imageUrls.length > 0) && !sidePanelCreated) {
    console.log("Sending media URLs to background script:", {
      videoUrls,
      imageUrls,
    });
    chrome.runtime.sendMessage({ videoUrls, imageUrls }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
      }
    });
    sidePanelCreated = true;
  }
}

function createSidePanel() {
  const sidePanel = document.createElement("div");
  sidePanel.id = "video-downloader-side-panel";
  sidePanel.style.cssText = `
    position: fixed;
    top: 25px;
    right: 25px;
    width: 250px;
    height: 300px;
    background-color: white;
    padding: 10px;
    z-index: 9999;
    box-shadow: -2px 0 5px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
  `;

  // Media count display
  const countContainer = document.createElement("div");
  countContainer.style.margin = "10px";

  const videoCount = document.createElement("p");
  videoCount.textContent = `Videos found: ${videoUrls.length}`;
  videoCount.style.margin = "0 0 5px 0";

  const imageCount = document.createElement("p");
  imageCount.textContent = `Images found: ${imageUrls.length}`;
  imageCount.style.margin = "0";

  countContainer.appendChild(videoCount);
  countContainer.appendChild(imageCount);
  sidePanel.appendChild(countContainer);

  // Download all button
  const downloadAllButton = document.createElement("button");
  downloadAllButton.textContent = "Download All";
  downloadAllButton.style.marginBottom = "10px";
  downloadAllButton.style.padding = "5px";
  sidePanel.appendChild(downloadAllButton);

  // Create tabs container
  const tabsContainer = document.createElement("div");
  tabsContainer.style.cssText = `
    display: flex;
    margin-bottom: 10px;
  `;

  const videoTab = document.createElement("button");
  const imageTab = document.createElement("button");

  videoTab.textContent = "Videos";
  imageTab.textContent = "Images";

  const tabStyle = `
    flex: 1;
    padding: 5px;
    border: none;
    cursor: pointer;
  `;

  videoTab.style.cssText = tabStyle;
  imageTab.style.cssText = tabStyle;

  tabsContainer.appendChild(videoTab);
  tabsContainer.appendChild(imageTab);
  sidePanel.appendChild(tabsContainer);

  // Create media list container
  const mediaListContainer = document.createElement("div");
  mediaListContainer.style.cssText = `
    flex-grow: 1;
    overflow-y: auto;
  `;

  // Create video and image lists
  const videoList = createMediaList(videoUrls, "video");
  const imageList = createMediaList(imageUrls, "image");
  imageList.style.display = "none"; // Hide image list initially

  mediaListContainer.appendChild(videoList);
  mediaListContainer.appendChild(imageList);
  sidePanel.appendChild(mediaListContainer);

  // Tab switching logic
  videoTab.addEventListener("click", () => {
    videoTab.style.backgroundColor = "#e0e0e0";
    imageTab.style.backgroundColor = "";
    videoList.style.display = "block";
    imageList.style.display = "none";
  });

  imageTab.addEventListener("click", () => {
    imageTab.style.backgroundColor = "#e0e0e0";
    videoTab.style.backgroundColor = "";
    imageList.style.display = "block";
    videoList.style.display = "none";
  });

  // Initial tab state
  videoTab.style.backgroundColor = "#e0e0e0";

  // Download all functionality
  downloadAllButton.addEventListener("click", () => {
    console.log("Download All button clicked");
    downloadAllButton.textContent = "Downloading...";
    downloadAllButton.disabled = true;

    chrome.runtime.sendMessage(
      {
        action: "downloadAll",
        videoUrls: videoUrls,
        imageUrls: imageUrls,
      },
      (response) => {
        console.log("Got response from background:", response);
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
        }
        downloadAllButton.textContent = "Download All";
        downloadAllButton.disabled = false;
      }
    );
  });

  document.body.appendChild(sidePanel);
}

function createMediaList(mediaUrls, type) {
  const list = document.createElement("ul");
  list.style.cssText = `
    list-style: none;
    padding: 0;
    margin: 0;
  `;

  mediaUrls.forEach((mediaUrl) => {
    const listItem = document.createElement("li");
    listItem.style.cssText = `
      cursor: pointer;
      padding: 5px;
      border-bottom: 1px solid #eee;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    listItem.textContent = mediaUrl.filename;
    listItem.addEventListener("click", () => {
      listItem.style.backgroundColor = "#f0f0f0";
      chrome.runtime.sendMessage(
        {
          action: type === "video" ? "downloadVideo" : "downloadImage",
          [`${type}Url`]: mediaUrl.url,
          filename: mediaUrl.filename,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
            listItem.style.backgroundColor = "#ffebee"; // Error state
          } else if (response.success) {
            listItem.style.backgroundColor = "#e8f5e9"; // Success state
          }
        }
      );
    });
    list.appendChild(listItem);
  });

  return list;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "createSidePanel") {
    createSidePanel();
  }
});

findMediaUrls();
const observer = new MutationObserver(findMediaUrls);
observer.observe(document.body, { childList: true, subtree: true });
