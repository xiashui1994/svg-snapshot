# SVG Snapshot

English | [中文](./README.zh-CN.md)

A browser extension for capturing web pages as scalable SVG images. Unlike traditional screenshots, SVG snapshots remain crisp at any zoom level and can be easily edited in vector graphics software.

## Features

### Capture Modes

- **Capture Viewport** - Capture the entire visible area of the current tab
- **Capture Area** - Select a specific region to capture

### Output Options

- **Download SVG** - Save the captured SVG file to your computer
- **Open in new tab** - Preview the SVG in a new browser tab
- **Copy to clipboard** - Copy SVG code directly to clipboard

### Processing Options

- **Inline resources** - Embed external resources (images, fonts) into the SVG
- **Keep links** - Preserve hyperlinks in the captured SVG
- **Minify SVG** - Optimize file size by removing unnecessary data
- **Pretty-print** - Format SVG code for better readability

## Installation

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the extension:
   ```bash
   pnpm build
   ```
4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod` directory

## Usage

1. Click the SVG Snapshot icon in your browser toolbar
2. Choose your capture mode (Viewport or Area)
3. Configure output and processing options as needed
4. Click to capture

## Development

Start the development server:

```bash
pnpm dev
```

Load the development build from `build/chrome-mv3-dev` in Chrome.

## Tech Stack

- [Plasmo](https://docs.plasmo.com/) - Browser extension framework
- [Vue 3](https://vuejs.org/) - UI framework
- [dom2svg](https://www.npmjs.com/package/dom2svg) - DOM to SVG conversion
- [SVGO](https://github.com/svg/svgo) - SVG optimization
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
