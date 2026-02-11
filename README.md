# 📏 On-Screen Measurement Tool

A high-precision, production-ready web application for measuring objects on your screen using an image as reference.

![App Screenshot](public/vite.svg) (*Add your screenshot here after deployment*)

## ✨ Features

- **🎯 High Precision**: Accurate pixel-to-real-world measurement using reference calibration.
- **🖼️ Image Support**: Drag and drop any image (JPG, PNG, WEBP) up to 10MB.
- **⚡ Performance**: Optimized with React 19 + Vite 7 for near-instant interaction.
- **🛡️ Robust Architecture**: 
  - Centralized logging and error tracking.
  - Safe local storage persistence.
  - Custom React hooks for clean state management.
- **📱 Responsive Design**: Works on desktop and mobile browsers.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/measurement-tool.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Built With
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Lucide React** - Icons

## 🔒 Security & Performance
- **CSP Protected**: Content Security Policy implemented for safe asset loading.
- **Memory Leak Protection**: Proper cleanup of `requestAnimationFrame` and event listeners.
- **Safe Persistence**: Validated `localStorage` operations with failure fallbacks.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
