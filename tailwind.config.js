/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
      },
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        soft: 'var(--border-soft)',
        medium: 'var(--border-medium)',
        strong: 'var(--border-strong)',
        't-primary': 'var(--text-primary)',
        't-secondary': 'var(--text-secondary)',
        't-tertiary': 'var(--text-tertiary)',
        't-muted': 'var(--text-muted)',
        'accent': 'var(--accent)',
        'sidebar-active': 'var(--sidebar-active)',
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        kala: {
          bg: '#FFFFFF',
          secondaryBg: '#F7F7F5',
          card: '#FFFFFF',
          text: '#37352F',
          textSecondary: '#6F6E69',
          border: '#E9E9E7',
          // Dark Mode Tones
          darkBg: '#191919',
          darkSecondaryBg: '#202020',
          darkCard: '#252525',
          darkText: '#EDEDED',
          darkTextSecondary: '#9B9B9B',
          darkDivider: '#2F2F2F',
          accent: '#10B981',
          // Legacy support/Utility mapping
          black: '#37352F',
          white: '#FFFFFF'
        },
        // Notion-specific utility scale
        notion: {
          50: '#F7F7F5',
          100: '#E9E9E7',
          800: '#2F2F2F',
          900: '#252525',
          950: '#191919'
        }
      }
    },
  },
  plugins: [],
}
