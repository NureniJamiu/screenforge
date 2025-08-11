# ScreenForge Frontend

React + TypeScript frontend for the ScreenForge screen recording application.

## 🖼️ Project Preview

![ScreenForge Homepage](./public/homepage.png)

*ScreenForge - Professional screen recording and video editing platform*

## 🚀 Technologies Used

- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **React Router** for navigation
- **Zustand** for state management
- **Lucide React** for icons

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── store/             # Zustand stores
├── utils/             # Utility functions
└── assets/            # Static assets
```

## ✨ Key Features

- 🎥 **Screen recording** with multiple capture modes
- ✂️ **Video editing interface** with advanced tools
- 🔐 **User authentication** via Clerk
- 📱 **Responsive design** with Tailwind CSS
- 🎯 **Type-safe development** with TypeScript
- 🌐 **Real-time video processing**
- 📤 **Cloud storage integration** with Cloudinary

## 🎯 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**
4. **Start development server**: `npm run dev`
5. **Open your browser** and navigate to `http://localhost:5173`

## 📱 Supported Browsers

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
