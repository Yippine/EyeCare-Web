# EyeCare-Web

🎯 Eye Care Web App: Provides 20-20-20 timer reminders, interactive eye exercise guidance, and a gamified experience to prevent Computer Vision Syndrome (CVS). A cross-platform solution based on PWA technology.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **State Management**: Zustand with persist middleware
- **Styling**: TailwindCSS 4 with dark mode support
- **Animations**: Framer Motion
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

## Project Structure

```
eyecare-web/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI components (Button, Card, Modal, ProgressRing)
│   │   └── layout/         # Layout components (TabBar, Layout)
│   ├── pages/              # Page components (Home, Activities, Stats, Settings)
│   ├── router/             # Route configuration
│   ├── stores/             # Zustand stores (timer, stats, settings)
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles with TailwindCSS
├── .husky/                 # Git hooks configuration
└── docs/                   # Documentation
```

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development Commands

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting (automatic via pre-commit hook)
git commit
```

## Features Implemented (v1.0 MVP)

### 1. Project Bootstrap

- Vite + React 18 + TypeScript configuration
- ESLint and Prettier setup
- Git pre-commit hooks with husky and lint-staged

### 2. Style System

- TailwindCSS with JIT mode
- Custom theme colors (Primary: #4ECDC4, Secondary: #FFE66D)
- Dark mode support with class-based strategy

### 3. Routing Infrastructure

- 4 main routes: Home, Activities, Stats, Settings
- Bottom TabBar navigation with active state highlighting
- Smooth route transitions

### 4. State Management

- Timer store: track eye care session state
- Stats store: record and persist session history
- Settings store: manage user preferences with localStorage

### 5. UI Components Library

- **Button**: Multiple variants (primary, secondary, outline) and sizes with animations
- **Card**: Container with hover effects
- **Modal**: Portal-rendered modal with backdrop and animations
- **ProgressRing**: SVG-based circular progress indicator

## Theme Colors

- **Primary**: `#4ECDC4` (Teal)
- **Secondary**: `#FFE66D` (Yellow)

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
