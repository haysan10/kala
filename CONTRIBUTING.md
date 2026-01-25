# Contributing to KALA

First off, thank you for considering contributing to KALA! It's people like you that make KALA such a great tool for students worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

### Our Standards

- **Be Respectful**: Treat everyone with respect and consideration
- **Be Inclusive**: Welcome newcomers and help them get started
- **Be Constructive**: Provide helpful feedback and accept feedback graciously
- **Be Professional**: Focus on what is best for the community

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kala.git
   cd kala
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/haysan/kala.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

5. **Set up environment variables** (see README.md)

6. **Start development servers**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

Use this template:

```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 14.0]
- Node: [e.g., 20.10.0]
- Browser: [e.g., Chrome 120]
```

### 💡 Suggesting Features

Feature suggestions are welcome! Please include:

- **Clear title** for the feature
- **Detailed description** of the proposed feature
- **Use case** explaining why this feature would be useful
- **Possible implementation** if you have ideas

### 📝 Documentation

Help improve our documentation:

- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation
- Update outdated information

### 💻 Code Contributions

1. **Find an issue** to work on (look for `good first issue` labels)
2. **Comment** on the issue to let others know you're working on it
3. **Create a branch** for your work
4. **Write code** following our style guidelines
5. **Write tests** for your changes
6. **Submit a pull request**

---

## 🔄 Development Process

### Branching Strategy

```
main          - Production-ready code
├── develop   - Development integration branch
├── feature/* - New features
├── fix/*     - Bug fixes
├── docs/*    - Documentation updates
└── refactor/*- Code refactoring
```

### Branch Naming

- `feature/add-calendar-sync`
- `fix/login-redirect-issue`
- `docs/update-api-reference`
- `refactor/improve-ai-router`

### Workflow

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes** and commit regularly

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open Pull Request** against `main`

---

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types from dedicated files

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Use descriptive component names
- Keep components focused and small
- Extract reusable logic into custom hooks

```tsx
// ✅ Good
const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const { title, dueDate, status } = assignment;
  
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{formatDate(dueDate)}</p>
      <StatusBadge status={status} />
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Group related classes logically
- Extract common patterns to component classes
- Follow mobile-first responsive design

### File Organization

```
components/
├── ComponentName/
│   ├── index.tsx        # Main component
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx
│   └── types.ts         # Component-specific types
```

---

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
feat(auth): add Google OAuth login
fix(quiz): correct scoring calculation
docs(readme): update installation steps
refactor(ai-router): improve task routing logic
test(api): add user endpoint tests
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing
Describe tests you ran.

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests
- [ ] I have updated documentation
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one approving review** required
3. **Address all review comments**
4. **Maintainer merges** the PR

---

## 🎉 Recognition

Contributors are recognized in:

- README.md Contributors section
- Release notes
- Our community hall of fame

---

## 💬 Getting Help

- 💬 **GitHub Discussions** for questions
- 🐛 **GitHub Issues** for bugs
- 📧 **Email** maintainers for sensitive matters

---

Thank you for contributing to KALA! 🙏

Every contribution, no matter how small, helps make KALA better for students everywhere.
