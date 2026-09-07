# Media Downloader for Chrome

Find direct image and video links on a webpage and download them individually or in a queue from an on-page panel.


## Installation

### Build and load locally

You need Git, Node.js, npm, and Chrome.

```sh
git clone https://github.com/thajj/media-downloader-extension.git
cd media-downloader-extension
npm ci
npm run build
```

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the generated `dist` directory.
4. Open or refresh a webpage containing supported media.

There are currently no packaged GitHub releases. Use the source build above.

### Supported media and limitations

- Direct links ending in `.mp4` or `.webm`.
- Direct links ending in `.jpg`, `.jpeg`, `.png`, or `.gif`.
- Supported image URLs from image elements, `srcset`, and lazy-loading `data-src` / `data-srcset` attributes.

Detection does not cover every embedded player or streaming format. Detected image URLs preserve query parameters used for signatures and transformations. Media added after the panel first opens may require a page refresh to appear.

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

- Built with Chrome Extension Manifest V3
- Modern JavaScript (ES6+) transpiled with Babel
- Webpack for module bundling and asset management
- Object-oriented architecture with separate concerns:
  - `MediaDetector`: Handles media file detection
  - `SidePanel`: Manages UI interactions
  - `Utils`: Common utility functions
- Implements MutationObserver for dynamic content detection
- Features retry mechanism for failed downloads
- Optimized download queuing system

## Development Commands

- `npm run watch`: Rebuild on source changes; reload the extension in Chrome and refresh the webpage manually
- `npm run dev`: Build for development
- `npm run build`: Build for production
- `npm run test`: Run image URL regression tests (Node.js 18 or newer)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors
- Inspired by various media download extensions
- Built with modern web technologies

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/thajj/media-downloader-extension/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible about your problem

## Permissions

The manifest requests `activeTab`, `downloads`, `storage`, `tabs`, and access to all URLs. A content script detects media on matching webpages, and Chrome’s downloads API saves files.

Built by [Toufic Hajj](https://github.com/thajj). Follow my GitHub profile for updates to this and other practical tools.
