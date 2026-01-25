---
description: Complete development workflow for KALA WebApp - from design to deployment with team processes
---

# 🔄 KALA Development Workflow
## Agency Team Technical Process Guide

---

## 📋 Table of Contents

1. [Development Lifecycle](#1-development-lifecycle)
2. [Environment Setup](#2-environment-setup)
3. [Git Branching Strategy](#3-git-branching-strategy)
4. [Frontend Development](#4-frontend-development)
5. [Backend Development](#5-backend-development)
6. [Database Operations](#6-database-operations)
7. [AI Integration](#7-ai-integration)
8. [Testing Flow](#8-testing-flow)
9. [Code Review Process](#9-code-review-process)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Deployment](#11-deployment)
12. [Monitoring & Debugging](#12-monitoring--debugging)

---

## 1. Development Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        KALA DEVELOPMENT LIFECYCLE                          │
└────────────────────────────────────────────────────────────────────────────┘

 ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
 │ Design  │───▶│ Develop │───▶│  Test   │───▶│ Review  │───▶│ Deploy  │
 └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
      │              │              │              │              │
      ▼              ▼              ▼              ▼              ▼
  PRD/Design     Code +       Unit/E2E        PR Review      Staging/
  Approval       Local Test   + Manual        + Approval     Production
```

### Sprint Cycle (2 weeks)

| Day | Activity | Participants |
|-----|----------|--------------|
| Mon (Week 1) | Sprint Planning | All |
| Daily | Standup (15 min) | All |
| Wed (Week 1) | Backlog Grooming | PM, Tech Lead |
| Thu (Week 2) | Code Freeze | Developers |
| Fri (Week 2) | Sprint Review + Retro | All |

---

## 2. Environment Setup

### 2.1 Prerequisites

```bash
# Required versions
node --version  # v20.0.0+
npm --version   # v10.0.0+
```

### 2.2 Initial Setup

// turbo
```bash
# Clone repository
cd /Users/haysan/Documents/WEBAPPS/KALA

# Install frontend dependencies
npm install
```

// turbo
```bash
# Install backend dependencies
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npm install
```

### 2.3 Environment Variables

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=your-key-here
```

**Backend** (`.env`):
```env
# Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Auth
JWT_SECRET=your-32-char-minimum-secret-key
JWT_EXPIRES_IN=7d

# AI Providers
GEMINI_API_KEY=your-gemini-key
GROK_API_KEY=your-grok-key

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2.4 Start Development Servers

// turbo
```bash
# Terminal 1: Frontend
cd /Users/haysan/Documents/WEBAPPS/KALA && npm run dev
```

// turbo
```bash
# Terminal 2: Backend
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npm run dev
```

### 2.5 Verify Setup

```bash
# Check frontend
curl http://localhost:5173

# Check backend health
curl http://localhost:3001/health
```

---

## 3. Git Branching Strategy

### 3.1 Branch Structure

```
main                      # Production (protected)
├── staging               # Pre-production testing
└── develop               # Integration branch
    ├── feature/auth-jwt
    ├── feature/ai-grok-integration
    ├── bugfix/milestone-toggle
    └── hotfix/critical-login-fix
```

### 3.2 Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<scope>-<description>` | `feature/ai-grok-integration` |
| Bugfix | `bugfix/<issue>-<description>` | `bugfix/123-milestone-status` |
| Hotfix | `hotfix/<description>` | `hotfix/login-redirect` |
| Release | `release/v<version>` | `release/v1.2.0` |
| Chore | `chore/<description>` | `chore/update-deps` |

### 3.3 Commit Convention

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(ai): add Grok provider integration"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(api): update endpoint documentation"
```

### 3.4 Branch Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Work on feature
git add .
git commit -m "feat(scope): description"

# Push and create PR
git push origin feature/my-feature
# Create PR to develop branch
```

---

## 4. Frontend Development

### 4.1 Component Creation

```typescript
// 1. Create file in components/
// components/MyComponent.tsx

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
      <h2 className="text-lg font-bold dark:text-white">{title}</h2>
      <button 
        onClick={onAction}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Action
      </button>
    </div>
  );
};

export default MyComponent;
```

### 4.2 API Integration Pattern

```typescript
// services/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAssignments(token: string) {
  const response = await fetch(`${API_URL}/api/assignments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  
  return response.json();
}
```

### 4.3 Checklist Before Commit

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Dark mode tested
- [ ] Mobile responsive
- [ ] Loading states added
- [ ] Error handling implemented
- [ ] No console errors
- [ ] Accessibility checked

---

## 5. Backend Development

### 5.1 Adding New Endpoint

**Step 1: Create Route File**
```typescript
// backend/src/routes/myfeature.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { mySchema } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
    try {
        // Implementation
        sendSuccess(res, { data: [] });
    } catch (error) {
        next(error);
    }
});

export default router;
```

**Step 2: Register Route**
```typescript
// backend/src/app.ts
import myfeatureRoutes from "./routes/myfeature.routes.js";
app.use("/api/myfeature", myfeatureRoutes);
```

**Step 3: Add Validation Schema**
```typescript
// backend/src/types/index.ts
export const mySchema = z.object({
    field1: z.string().min(1),
    field2: z.number().positive(),
});
```

### 5.2 Service Layer Pattern

```typescript
// backend/src/services/myfeature.service.ts
import { db } from "../config/database.js";
import { myTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export class MyFeatureService {
    async getAll(userId: string) {
        return db.select()
            .from(myTable)
            .where(eq(myTable.userId, userId));
    }
    
    async create(data: NewMyFeature) {
        const [result] = await db.insert(myTable)
            .values(data)
            .returning();
        return result;
    }
}

export const myFeatureService = new MyFeatureService();
```

### 5.3 API Response Format

```typescript
// Success Response
{
    "success": true,
    "data": { ... }
}

// Error Response
{
    "success": false,
    "error": "Error message"
}

// List Response
{
    "success": true,
    "data": [...],
    "meta": {
        "total": 100,
        "page": 1,
        "limit": 20
    }
}
```

---

## 6. Database Operations

### 6.1 Schema Changes

**Step 1: Edit Schema**
```typescript
// backend/src/db/schema.ts
export const myNewTable = sqliteTable("my_new_table", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

**Step 2: Generate Migration**
// turbo
```bash
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npx drizzle-kit generate
```

**Step 3: Apply Migration**
// turbo
```bash
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npx drizzle-kit migrate
```

### 6.2 Seed Data

```typescript
// backend/src/db/seed.ts
import { db } from "../config/database.js";
import { users, assignments } from "./schema.js";

async function seed() {
    // Create test user
    await db.insert(users).values({
        email: "test@example.com",
        passwordHash: "hashed_password",
        name: "Test User",
    });
    
    console.log("Seeding complete!");
}

seed().catch(console.error);
```

// turbo
```bash
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npx tsx src/db/seed.ts
```

### 6.3 Query Patterns

```typescript
// Select with relations
const assignments = await db.query.assignments.findMany({
    where: eq(assignments.userId, userId),
    with: {
        milestones: true,
    },
});

// Update
await db.update(assignments)
    .set({ overallProgress: 50 })
    .where(eq(assignments.id, assignmentId));

// Delete
await db.delete(assignments)
    .where(eq(assignments.id, assignmentId));
```

---

## 7. AI Integration

### 7.1 AI Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Router Service                         │
│                                                                  │
│   ┌──────────────┐                      ┌──────────────┐        │
│   │   Gemini     │◀──── Primary ────────│  AI Router   │        │
│   │   Service    │                      │              │        │
│   └──────────────┘                      │  - Fallback  │        │
│                                         │  - Retry     │        │
│   ┌──────────────┐                      │  - Logging   │        │
│   │    Grok      │◀──── Fallback ───────│              │        │
│   │   Service    │                      └──────────────┘        │
│   └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Using AI Router

```typescript
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";

// In route handler
router.post("/analyze", async (req, res, next) => {
    try {
        const config = AIRouterService.buildConfig(req.user!);
        
        const result = await aiRouter.analyzeAssignment(
            req.body.text,
            req.body.fileData,
            config
        );
        
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});
```

### 7.3 Provider Selection Guide

| Use Case | Recommended Provider | Reason |
|----------|---------------------|--------|
| Structured JSON output | Gemini | Native schema support |
| Long-form content | Either | Both capable |
| Quick responses | Gemini Flash | Faster |
| Complex reasoning | Grok | Better at debate/logic |
| Conversational | Either | Both good |
| Multimodal (images) | Gemini | Better vision support |

### 7.4 Prompt Best Practices

```typescript
// Good: Structured, specific
const systemPrompt = `You are a Senior Professor analyzing academic assignments.
Return JSON with exactly these fields:
- title: string
- description: string
- milestones: array of { title, description, estimatedMinutes }

Be pedagogically sound. Generate 3-5 milestones.`;

// Bad: Vague, unstructured
const badPrompt = "Analyze this assignment and give me some info.";
```

---

## 8. Testing Flow

### 8.1 Testing Pyramid

```
          ┌─────────────┐
          │   E2E (10%) │  Playwright
          ├─────────────┤
          │ Integration │  API + Component
          │    (20%)    │
          ├─────────────┤
          │ Unit (70%)  │  Vitest
          └─────────────┘
```

### 8.2 Running Tests

// turbo
```bash
# Backend unit tests
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npm test
```

// turbo
```bash
# Frontend tests
cd /Users/haysan/Documents/WEBAPPS/KALA && npm test
```

### 8.3 Test File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── auth.service.test.ts
│   └── routes/
│       ├── auth.routes.ts
│       └── auth.routes.test.ts
└── tests/
    └── e2e/
        └── auth.e2e.test.ts
```

### 8.4 API Testing with curl

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Protected endpoint
curl -X GET http://localhost:3001/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. Code Review Process

### 9.1 PR Template

```markdown
## Description
[What does this PR do?]

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Documentation

## Related Issues
Closes #123

## Testing Done
- [ ] Unit tests added
- [ ] Manual testing completed

## Screenshots
[If UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No console.log statements
- [ ] Documentation updated
```

### 9.2 Review Checklist

**Functionality**
- [ ] Code does what it claims
- [ ] Edge cases handled
- [ ] No regressions

**Code Quality**
- [ ] Clear naming
- [ ] No code duplication
- [ ] Proper error handling

**Security**
- [ ] Input validation
- [ ] No sensitive data exposed
- [ ] Auth checks in place

**Performance**
- [ ] Efficient algorithms
- [ ] No memory leaks
- [ ] Optimized queries

### 9.3 Review Response Time

| Priority | First Response | Full Review |
|----------|---------------|-------------|
| Critical | 1 hour | 2 hours |
| High | 4 hours | 8 hours |
| Normal | 24 hours | 48 hours |
| Low | 48 hours | 72 hours |

---

## 10. CI/CD Pipeline

### 10.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

### 10.2 Pipeline Stages

```
Push → Lint → Test → Build → Deploy (if main/staging)
              ↓              ↓
         Type Check      Staging: Auto
                        Production: Manual approval
```

---

## 11. Deployment

### 11.1 Environment URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Development | localhost:5173 | localhost:3001 |
| Staging | staging.kala.app | api-staging.kala.app |
| Production | app.kala.app | api.kala.app |

### 11.2 Deployment Checklist

**Pre-deployment:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Environment variables set
- [ ] Database migrations run

**Post-deployment:**
- [ ] Health check passing
- [ ] Smoke tests run
- [ ] Monitoring active
- [ ] Team notified

### 11.3 Rollback Procedure

```bash
# Identify bad commit
git log --oneline -5

# Revert to previous version
git revert HEAD
git push origin main

# Or redeploy specific commit
# In Vercel/Railway dashboard
```

---

## 12. Monitoring & Debugging

### 12.1 Log Levels

| Level | When to Use |
|-------|-------------|
| `debug` | Detailed debugging info (dev only) |
| `info` | Normal operations, requests |
| `warn` | Potential issues, deprecations |
| `error` | Errors that need attention |

### 12.2 Debugging Checklist

**Frontend Issues:**
1. Check browser console for errors
2. Check Network tab for API failures
3. Check React DevTools for state
4. Check localStorage data

**Backend Issues:**
1. Check server logs
2. Check request/response in Postman
3. Check database queries
4. Check environment variables

**AI Issues:**
1. Check AI provider status
2. Check API key validity
3. Check request payload size
4. Check rate limits

### 12.3 Common Issues

| Issue | Check | Solution |
|-------|-------|----------|
| CORS error | Frontend URL in backend env | Update FRONTEND_URL |
| 401 Unauthorized | Token expired/invalid | Re-login |
| AI timeout | Large payload | Reduce input size |
| DB connection | Turso credentials | Verify env vars |

---

## 📝 Quick Reference Commands

```bash
# Development
npm run dev                    # Start frontend
npm run dev --prefix backend   # Start backend

# Database
npx drizzle-kit generate       # Generate migration
npx drizzle-kit migrate        # Apply migration
npx drizzle-kit studio         # Open DB GUI

# Testing
npm test                       # Run tests
npm run test:coverage          # With coverage

# Build
npm run build                  # Production build
npm run preview                # Preview build

# Linting
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix issues
npx tsc --noEmit              # Type check
```

---

*Last updated: January 2026*
