# Media Downloader Extension

A Chrome extension that helps you download videos and images from web pages. The extension automatically detects media files and provides an easy-to-use interface for downloading them individually or in bulk.

## Features

- Automatically detects videos (.mp4, .webm) and images (.jpg, .jpeg, .png, .gif)
- Floating side panel with tabbed interface for videos and images
- Download individual files or all media at once
- Visual feedback for download status
- Automatic retry mechanism for failed downloads
- Separate handling for video and image downloads to optimize performance

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to a webpage containing media files
2. The extension will automatically detect media files and display a side panel
3. Switch between Videos and Images tabs to view available media
4. Click individual items to download them, or use "Download All" to get everything
5. The background color of items will indicate download status:
   - Gray: Downloading
   - Green: Successfully downloaded
   - Red: Download failed

## Technical Details

- Uses Chrome Extension Manifest V3
- Implements MutationObserver for dynamic content detection
- Features retry mechanism for failed downloads
- Optimized download queuing with different delays for videos and images

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
