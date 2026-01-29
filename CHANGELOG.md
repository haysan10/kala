# Changelog

All notable changes to KALA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-01-29

### 🚀 Infrastructure Migration
- **Supabase Integration** - Migrated core database from Turso (libSQL) to Supabase (PostgreSQL) for better scalability and cerebral search capabilities.
- **Improved Documentation** - Fully updated README and technical docs to reflect the new professional open-source standards.
- **SQL Schema Upgrade** - Re-architected the database schema for PostgreSQL compatibility, including UUIDs and JSONB support.

---

## [1.0.0] - 2026-01-25

### 🎉 Initial Release

This is the first public release of KALA - Academic Intelligence Operating System.

### ✨ Features

#### Core Features
- **Neural Ingestion** - AI-powered document parsing for PDFs, images, and text
- **Mini-Course Generation** - Comprehensive learning modules for each milestone
- **Socratic Sparring** - AI debate mode for mastery validation
- **Academic Mentor** - Contextual AI tutoring per assignment
- **Mastery Assessment** - AI-generated quizzes and tests
- **Focus Mode** - Built-in Pomodoro timer for deep work sessions
- **Daily Synapse** - Daily micro-challenges for continuous learning
- **Calendar View** - Visual deadline tracking and study planning

#### AI Integration
- **Multi-AI Router** - Smart task routing between Gemini and Grok
- **Automatic Fallback** - Reliability when one provider fails
- **Real-time Validation** - Verify API keys before saving
- **User AI Configuration** - Personal API key management in settings

#### Authentication
- **Email/Password Login** - Traditional authentication
- **Google OAuth** - Sign in with Google
- **GitHub OAuth** - Sign in with GitHub
- **JWT Tokens** - Secure session management

#### User Experience
- **Theme Support** - Beautiful light and dark modes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Accessibility** - Keyboard navigation and screen reader support

### 🛠️ Technical Stack

#### Frontend
- React 19 with TypeScript 5.8
- Vite 6 for blazing fast builds
- TailwindCSS 3.4 for styling
- Framer Motion 12 for animations
- Lucide React for icons

#### Backend
- Node.js 20+ with Express 4.18
- TypeScript for type safety
- Drizzle ORM for database operations
- Turso (libSQL) for edge database
- Passport.js for OAuth

---

## [Unreleased]

### 🔜 Planned Features
- [ ] Mobile app (React Native)
- [ ] Collaborative study groups
- [ ] Spaced repetition system
- [ ] Progress analytics dashboard
- [ ] Calendar sync (Google, Outlook)
- [ ] Browser extension

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-25 | Initial public release |

---

## Upgrade Guide

### From Beta to 1.0.0

No breaking changes. Simply pull the latest code and run:

```bash
npm install
cd backend && npm install
```

---

## Contributors

Thanks to all the contributors who helped make this release possible!

<!-- Add contributor avatars here -->

---

[1.0.0]: https://github.com/haysan/kala/releases/tag/v1.0.0
[Unreleased]: https://github.com/haysan/kala/compare/v1.0.0...HEAD
