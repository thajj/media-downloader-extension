
## Installation

### For Development

1. Run `npm run build` to create the `dist` folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` directory

### For Users

1. Download the latest release from the Chrome Web Store (coming soon)
2. Or download the latest build from the releases page

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

- `npm run watch`: Start development mode with auto-reload
- `npm run dev`: Build for development
- `npm run build`: Build for production
- `npm run test`: Run tests (coming soon)

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

1. Check the [Issues](issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible about your problem
