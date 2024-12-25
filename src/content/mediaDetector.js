export class MediaDetector {
  constructor() {
    this.videoUrls = [];
    this.imageUrls = [];
  }

  findMediaUrls() {
    this.findVideos();
    this.findImages();
    return {
      videoUrls: this.videoUrls,
      imageUrls: this.imageUrls,
    };
  }

  findVideos() {
    const videoLinks = document.querySelectorAll(
      'a[href$=".webm"], a[href$=".mp4"]'
    );

    for (const link of videoLinks) {
      const newVideoUrl = {
        url: link.href,
        filename: this.extractFilename(link.href),
      };

      if (!this.isDuplicate(this.videoUrls, newVideoUrl.url)) {
        this.videoUrls.push(newVideoUrl);
      }
    }
  }

  findImages() {
    this.findImageLinks();
    this.findImgElements();
  }

  findImageLinks() {
    const imageLinks = document.querySelectorAll(
      'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"]'
    );

    for (const link of imageLinks) {
      const newImageUrl = {
        url: link.href,
        filename: this.extractFilename(link.href),
      };

      if (!this.isDuplicate(this.imageUrls, newImageUrl.url)) {
        this.imageUrls.push(newImageUrl);
      }
    }
  }

  findImgElements() {
    const imgElements = document.querySelectorAll("img");

    imgElements.forEach((img) => {
      this.processImageSource(img.src);
      this.processSrcSet(img.srcset);
      this.processDataAttributes(img.dataset);
    });
  }

  processImageSource(src) {
    if (!src) return;

    const cleanUrl = this.cleanUrl(src);
    if (
      this.isValidImageUrl(cleanUrl) &&
      !this.isDuplicate(this.imageUrls, cleanUrl)
    ) {
      this.imageUrls.push({
        url: cleanUrl,
        filename: this.extractFilename(cleanUrl),
      });
    }
  }

  processSrcSet(srcset) {
    if (!srcset) return;

    const srcsetUrls = srcset
      .split(",")
      .map((entry) => entry.trim().split(" ")[0])
      .filter((url) => url);

    srcsetUrls.forEach((url) => {
      const cleanUrl = this.cleanUrl(url);
      if (
        this.isValidImageUrl(cleanUrl) &&
        !this.isDuplicate(this.imageUrls, cleanUrl)
      ) {
        this.imageUrls.push({
          url: cleanUrl,
          filename: this.extractFilename(cleanUrl),
        });
      }
    });
  }

  processDataAttributes(dataset) {
    if (dataset.src) {
      this.processImageSource(dataset.src);
    }

    if (dataset.srcset) {
      this.processSrcSet(dataset.srcset);
    }
  }

  cleanUrl(url) {
    if (!url) return "";
    return url.split("?")[0].split("#")[0];
  }

  extractFilename(url) {
    if (!url) return "";
    return url.substring(url.lastIndexOf("/") + 1);
  }

  isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isDuplicate(array, url) {
    return array.some((item) => item.url === url);
  }

  clearUrls() {
    this.videoUrls = [];
    this.imageUrls = [];
  }

  getVideoUrls() {
    return [...this.videoUrls];
  }

  getImageUrls() {
    return [...this.imageUrls];
  }

  getTotalCount() {
    return {
      videos: this.videoUrls.length,
      images: this.imageUrls.length,
    };
  }
}
