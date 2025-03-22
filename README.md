# ChatGPT Token Counter

A Chrome extension that counts the input and output tokens used in ChatGPT conversations, helping you track your usage and estimate costs.

## Features

- 🔢 Counts input and output tokens in real-time
- 💰 Calculates approximate costs based on GPT-4 pricing
- 📊 Maintains session statistics across page refreshes
- 🔄 Reset counters with a single click
- 🛠️ Debug tools to ensure proper functionality

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "ChatGPT Token Counter"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Build the extension (see Development section below)
3. In Chrome, go to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the `dist` folder from this project
6. The extension icon should appear in your toolbar

## Usage

1. Visit [ChatGPT](https://chatgpt.com)
2. Start your conversation as normal
3. Click the extension icon in your toolbar to see token counts
4. View input/output token counts and estimated costs
5. Use the "Reset Counters" button to start fresh

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/chatgpt-token-counter.git
cd chatgpt-token-counter
```

2. Install dependencies:
```
npm install
```

3. Start the development server (watches for changes):
```
npm start
```

4. Build for production:
```
npm run build
```

### Project Structure

```
├── public/                # Static assets
│   ├── manifest.json      # Extension manifest
│   └── popup.html         # Popup HTML template
├── src/
│   ├── components/        # React components
│   ├── content/           # Content script files
│   ├── utils/             # Utility functions
│   ├── background.ts      # Background service worker
│   └── popup.tsx          # Popup entry point
├── webpack.config.js      # Webpack configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Technical Details

- Built with React and TypeScript
- Styled with Tailwind CSS
- Uses Chrome Extensions Manifest V3
- Token counting is performed using a simple approximation (4 characters ≈ 1 token)

## Limitations

- Token counting is approximate and may not exactly match OpenAI
- Coupled to ChatGPT's interface

## License

MIT
