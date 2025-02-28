# 🌐 MintPraMim Frontend

## 🚀 Project Overview

MintPraMim's frontend is a sophisticated, blockchain-powered social matching application built with cutting-edge web technologies, designed to create meaningful connections through shared experiences.

## 🛠 Technology Stack

### Core Frameworks
- **React 18**: Modern UI library for building interactive interfaces
- **Next.js 13.5.1**: Server-side rendering and optimal performance framework
- **TypeScript 5.2.2**: Adds strong typing for enhanced code reliability

### Blockchain Integration
- **Arbitrum SDK**: Blockchain interaction capabilities
- **Ethers.js 6.10.0**: Ethereum blockchain interaction
- **Viem 1.19.11**: Lightweight Ethereum library
- **Wagmi 1.4.13**: React Hooks for Ethereum
- **RainbowKit 1.3.7**: Wallet connection management

### State Management & Forms
- **Zustand 4.4.7**: Lightweight state management
- **React Hook Form 7.53.0**: Efficient form handling
- **Zod 3.23.8**: TypeScript-first schema validation

### UI Components & Styling
- **Radix UI**: Unstyled, accessible UI components
- **Tailwind CSS 3.3.3**: Utility-first CSS framework
- **Shadcn/UI**: Component library
- **Framer Motion**: Animation library
- **React Spring**: Smooth, physics-based animations

### Additional Key Libraries
- **CMDk**: Command palette functionality
- **Sonner**: Toast notification system
- **Lucide React**: Icon system
- **Next Themes**: Theme management
- **React Tinder Card**: Swipe interaction components

## 🏗️ Project Structure

```
└── 📁frontend
    ├── 📁app            # Next.js application routes
    ├── 📁components     # Reusable React components
    ├── 📁hooks          # Custom React hooks
    ├── 📁lib            # Utility functions and providers
    └── 📁public         # Static assets
```

## 🔧 Development Scripts

- `dev`: Start development server
- `build`: Create production build
- `start`: Run production server
- `lint`: Run ESLint code quality checks

## 🌟 Key Features

### Blockchain-Powered Matching
- Wallet connection via RainbowKit
- Ethereum interaction with Ethers.js
- POAP-based matching algorithm

### Responsive Design
- Mobile-first approach
- Adaptive UI components
- Dark/Light theme support

### Performance Optimization
- Server-side rendering
- Code splitting
- Progressive Web App (PWA) support

## 🚀 Performance Considerations

### Build Optimization
- Next.js incremental static regeneration
- Webpack chunking
- SWC for fast compilation
- Tailwind CSS purging

### Bundle Analysis
The project uses modern bundling techniques to ensure:
- Minimal bundle size
- Efficient code splitting
- Quick initial page loads

## 🔍 Development Best Practices

### Type Safety
- Full TypeScript integration
- Zod for runtime type validation
- Strict typing across components

### State Management
- Zustand for lightweight, efficient state management
- Minimal boilerplate
- Easy state updates and subscriptions

## 🛡️ Security Features

- Wallet connection security via RainbowKit
- Client-side form validation with Zod
- Secure blockchain interactions
- HTTPS by default

## 🔮 Future Improvements

- More sophisticated matching algorithms
- Improved performance optimizations


## 🤝 Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create `.env.local` from `.env.local.example`
4. Run development server: `pnpm dev`

