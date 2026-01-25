# KALA Frontend Structure

## 📁 Folder Organization

```
src/
├── components/          # All React components
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── Dashboard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── CourseGroup.tsx
│   │   └── index.ts
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── ui/             # Reusable UI components (Button, Input, etc.)
│   └── shared/         # Shared components across features
│
├── pages/              # Page components (future: routing)
│
├── services/           # API services and integrations
│   ├── api.ts
│   ├── authService.ts
│   ├── assignmentService.ts
│   └── chatService.ts
│
├── hooks/              # Custom React hooks
│   └── useAuth.ts
│
├── utils/              # Utility functions
│   ├── formatters.ts
│   └── validators.ts
│
├── types/              # TypeScript types and interfaces
│   └── index.ts
│
├── assets/             # Static assets
│   ├── icons/
│   └── images/
│
└── styles/             # Global styles
    └── animations.css
```

## 🎨 Component Architecture

### Dashboard Module

**Dashboard.tsx** - Main container component
- Orchestrates all dashboard sub-components
- Manages state and data flow
- Handles search, filter, sort logic
- Displays hero header with stats

**MetricCard.tsx** - Metric display component
- Shows key metrics (Total, At Risk, Completed, Progress)
- Animated hover effects
- Trend indicators (+/- percentages)
- 4 variants: default, warning, success, primary

**ProjectCard.tsx** - Individual project display
- Risk indicators with pulsing animation
- Deadline countdown
- Progress bar with gradients
- Hover effects with gradient overlays
- Delete action button

**CourseGroup.tsx** - Course grouping component
- Groups projects by course
- Displays course-level statistics
- Animated circular progress indicator
- Grid layout for projects

## 🔄 Data Flow

```
App.tsx
  └── Dashboard Component
      ├── MetricCard (x4)
      ├── DailySynapse
      └── CourseGroup (dynamic)
          └── ProjectCard (multiple)
```

## 🎯 Design Principles

1. **Modularity** - Each component has single responsibility
2. **Reusability** - Components are generic and configurable
3. **Performance** - Lazy loading and memoization where needed
4. **Accessibility** - ARIA labels and keyboard navigation
5. **Responsiveness** - Mobile-first design approach

## 🚀 Usage Example

```tsx
import { Dashboard } from './src/components/dashboard';

function App() {
  return (
    <Dashboard
      assignments={assignments}
      onSelect={handleSelect}
      onDelete={handleDelete}
      onSynapseComplete={handleSynapseComplete}
    />
  );
}
```

## 🎨 Styling Conventions

- **Glass Morphism**: `bg-white/5`, `backdrop-blur-xl`
- **Gradients**: `from-purple-500 via-blue-500 to-cyan-500`
- **Borders**: `border-white/5` to `border-white/20`
- **Hover States**: Increase opacity/scale on hover
- **Animations**: Framer Motion for smooth transitions

## 📦 Export Strategy

- Each folder has `index.ts` for clean imports
- Old `/components` folder re-exports from `/src` for backward compatibility
- Named exports preferred over default exports (except main components)

## 🔧 Future Enhancements

- [ ] Add React Router for page navigation
- [ ] Implement Zustand/Redux for state management
- [ ] Create Storybook for component documentation
- [ ] Add unit tests with Vitest
- [ ] Implement E2E tests with Playwright
