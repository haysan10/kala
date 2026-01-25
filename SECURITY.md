# ===========================================
# KALA - Security Policy
# ===========================================

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take security seriously at KALA. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: **security@kala-app.com**
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-72 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release cycle

### After Reporting

- We will keep you informed of our progress
- We may ask for additional information
- Once fixed, we'll credit you (unless you prefer anonymity)

## 🛡️ Security Best Practices

### For Users

1. **Never share your API keys** publicly
2. **Use strong passwords** for your KALA account
3. **Enable 2FA** when available (coming soon)
4. **Keep your tokens secure** - don't expose JWT tokens

### For Developers

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all secrets
3. **Validate all user input** on both frontend and backend
4. **Keep dependencies updated** regularly
5. **Follow the principle of least privilege**

## 🔐 Security Features

KALA implements several security measures:

- **JWT Authentication** with secure tokens
- **Password Hashing** using bcrypt
- **OAuth 2.0** for third-party authentication
- **CORS Protection** limiting allowed origins
- **Input Validation** using Zod schemas
- **SQL Injection Prevention** via parameterized queries (Drizzle ORM)

## 📋 Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded credentials or secrets
- [ ] User input is properly validated
- [ ] SQL queries use parameterized statements
- [ ] Authentication is properly checked on protected routes
- [ ] Sensitive data is not logged
- [ ] Dependencies have no known vulnerabilities (`npm audit`)

---

Thank you for helping keep KALA secure! 🙏
