export class SidePanel {
  constructor(mediaUrls) {
    this.videoUrls = mediaUrls.videoUrls;
    this.imageUrls = mediaUrls.imageUrls;
    this.panel = null;
    this.downloadStates = new Map();
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      panelPosition: "right",
      groupByType: true,
      showNotifications: true,
    });

    if (settings.panelPosition === "left") {
      this.panel.style.left = "25px";
      this.panel.style.right = "auto";
    }

    this.groupByType = settings.groupByType;
    this.showNotifications = settings.showNotifications;
  }

  async create() {
    this.panel = document.createElement("div");
    this.panel.id = "video-downloader-side-panel";
    this.setupStyles();

    this.createHeader();
    this.createTabsContainer();
    this.createMediaListContainer();

    document.body.appendChild(this.panel);

    await this.loadSettings();
  }

  setupStyles() {
    this.panel.style.cssText = `
      position: fixed;
      top: 25px;
      right: 25px;
      width: 300px;
      height: 400px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      padding: 10px;
    `;
  }

  createHeader() {
    const header = document.createElement("div");
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;
    `;

    const title = document.createElement("h2");
    title.textContent = "Media Downloader";
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      color: #333;
    `;

    const counters = document.createElement("div");
    counters.style.cssText = `
      font-size: 12px;
      color: #666;
    `;
    counters.innerHTML = `
      Videos: ${this.videoUrls.length}<br>
      Images: ${this.imageUrls.length}
    `;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
      color: #666;
    `;
    closeButton.onclick = () => this.panel.remove();

    header.appendChild(title);
    header.appendChild(counters);
    header.appendChild(closeButton);
    this.panel.appendChild(header);

    const downloadAllButton = document.createElement("button");
    downloadAllButton.textContent = "Download All";
    downloadAllButton.style.cssText = `
      margin: 10px;
      padding: 8px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    downloadAllButton.onclick = () => this.downloadAll();
    this.panel.appendChild(downloadAllButton);
  }

  createTabsContainer() {
    const tabsContainer = document.createElement("div");
    tabsContainer.style.cssText = `
      display: flex;
      margin: 10px;
      border-radius: 4px;
      overflow: hidden;
    `;

    const videoTab = this.createTab("Videos", true);
    const imageTab = this.createTab("Images", false);

    tabsContainer.appendChild(videoTab);
    tabsContainer.appendChild(imageTab);
    this.panel.appendChild(tabsContainer);
  }

  createTab(text, isActive) {
    const tab = document.createElement("button");
    tab.textContent = text;
    tab.style.cssText = `
      flex: 1;
      padding: 8px;
      border: none;
      background-color: ${isActive ? "#f0f0f0" : "#fff"};
      cursor: pointer;
      font-size: 14px;
    `;

    tab.onclick = () => this.switchTab(text.toLowerCase());
    return tab;
  }

  createMediaListContainer() {
    const container = document.createElement("div");
    container.style.cssText = `
      flex: 1;
      overflow-y: auto;
      margin: 10px;
    `;

    const videoList = this.createMediaList(this.videoUrls, "video");
    const imageList = this.createMediaList(this.imageUrls, "image");

    imageList.style.display = "none";

    container.appendChild(videoList);
    container.appendChild(imageList);
    this.panel.appendChild(container);
  }

  createMediaList(items, type) {
    const list = document.createElement("div");
    list.id = `${type}-list`;
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 5px;
    `;

    items.forEach((item) => {
      const itemContainer = document.createElement("div");
      itemContainer.style.cssText = `
        padding: 8px;
        background-color: #f8f8f8;
        border-radius: 4px;
        font-size: 12px;
      `;

      // Conteneur pour le nom du fichier et la progression
      const contentWrapper = document.createElement("div");
      contentWrapper.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      `;

      const nameElement = document.createElement("div");
      nameElement.style.cssText = `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        margin-right: 10px;
      `;
      nameElement.textContent = item.filename;
      nameElement.title = item.url;

      const statusElement = document.createElement("span");
      statusElement.style.cssText = `
        font-size: 11px;
        color: #666;
      `;

      contentWrapper.appendChild(nameElement);
      contentWrapper.appendChild(statusElement);

      // Barre de progression
      const progressBar = document.createElement("div");
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background-color: #ddd;
        border-radius: 2px;
        overflow: hidden;
        display: none;
      `;

      const progressFill = document.createElement("div");
      progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background-color: #4CAF50;
        transition: width 0.3s ease;
      `;

      progressBar.appendChild(progressFill);

      itemContainer.appendChild(contentWrapper);
      itemContainer.appendChild(progressBar);

      this.downloadStates.set(item.url, {
        container: itemContainer,
        status: statusElement,
        progressBar: progressBar,
        progressFill: progressFill,
      });

      itemContainer.onclick = () => this.downloadItem(item, type);

      list.appendChild(itemContainer);
    });

    return list;
  }

  switchTab(tabName) {
    const videoList = document.getElementById("video-list");
    const imageList = document.getElementById("image-list");

    if (tabName === "videos") {
      videoList.style.display = "flex";
      imageList.style.display = "none";
    } else {
      videoList.style.display = "none";
      imageList.style.display = "flex";
    }
  }

  downloadItem(item, type) {
    const state = this.downloadStates.get(item.url);
    if (!state) return;

    state.progressBar.style.display = "block";
    state.status.textContent = "Starting...";
    state.container.style.backgroundColor = "#f0f0f0";

    chrome.runtime.sendMessage({
      action: type === "video" ? "downloadVideo" : "downloadImage",
      downloadInfo: {
        url: item.url,
        filename: item.filename,
      },
    });
  }

  updateDownloadProgress(url, progress) {
    const state = this.downloadStates.get(url);
    if (!state) return;

    if (progress.state === "in_progress") {
      const percent = Math.round(
        (progress.bytesReceived / progress.totalBytes) * 100
      );
      state.progressFill.style.width = `${percent}%`;
      state.status.textContent = `${percent}%`;
    } else if (progress.state === "complete") {
      state.progressFill.style.width = "100%";
      state.status.textContent = "Complete";
      state.container.style.backgroundColor = "#e8f5e9";
    } else if (progress.state === "error") {
      state.status.textContent = "Error";
      state.container.style.backgroundColor = "#ffebee";
    }
  }

  downloadAll() {
    const downloads = {
      videos: this.videoUrls.map((item) => ({
        url: item.url,
        filename: item.filename,
      })),
      images: this.imageUrls.map((item) => ({
        url: item.url,
        filename: item.filename,
      })),
    };

    chrome.runtime.sendMessage(
      {
        action: "downloadAll",
        downloads: downloads,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Download all error:", chrome.runtime.lastError);
        }
      }
    );
  }
}
