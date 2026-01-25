# 🤖 AI Router - Quick Reference Card

## 🎯 Task Specialization at a Glance

| Task | AI | Why? | Icon |
|------|-----|------|------|
| **Analyze Assignment** | 💎 Gemini | Document analysis & structured output | 📄 |
| **Generate Mini Course** | 💎 Gemini | Long-form educational content | 📚 |
| **Generate Quiz** | 💎 Gemini | Structured assessments | 📝 |
| **Validate Work** | 💎 Gemini | Rubric-based grading | ✅ |
| **Generate Synapse** | ⚡ Grok | Creative provocative questions | 💡 |
| **Generate Scaffolding** | ⚡ Grok | Motivational quick responses | 🎯 |
| **Chat Tutoring** | ⚡ Grok | Interactive conversations | 💬 |
| **Chat Debate** | ⚡ Grok | Argumentation & debate | 🎭 |

## 🔑 API Key Configuration

### Getting API Keys

| Provider | URL | Notes |
|----------|-----|-------|
| **Google Gemini** | https://aistudio.google.com/apikey | Free tier available |
| **xAI Grok** | https://console.x.ai/ | Sign up required |

### Configuration Options

```
Option 1: Single Key (Budget)
├── Gemini only → All tasks use Gemini
└── Grok only → All tasks use Grok

Option 2: Dual Key (Optimal) ⭐ RECOMMENDED
├── Gemini for: Analysis, Courses, Quizzes, Validation
└── Grok for: Synapse, Scaffolding, Chat, Debate
```

## 📡 API Endpoints

```bash
# Validate API Key
POST /api/user/validate-api-key
Body: { "provider": "gemini|grok", "apiKey": "..." }

# Get AI Status
GET /api/user/ai-status

# Update Settings
PUT /api/user/settings
Body: { "geminiApiKey": "...", "grokApiKey": "..." }

# Delete API Key
DELETE /api/user/settings/api-key/:provider
```

## 💻 Code Snippets

### Get AI Config
```typescript
import { AIRouterService } from "../services/ai-router.service.js";
import { db } from "../config/database.js";
import { userSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

async function getAIConfig(userId: string) {
    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
    });
    return AIRouterService.buildConfig(settings || {});
}
```

### Use AI Router
```typescript
import { aiRouter } from "../services/ai-router.service.js";

// Analyze assignment (uses Gemini if available)
const config = await getAIConfig(userId);
const result = await aiRouter.analyzeAssignment(text, fileData, config);

// Chat (uses Grok if available)
const response = await aiRouter.chatTutoring(
    systemInstruction,
    messages,
    newMessage,
    config
);
```

### Validate Before Use
```typescript
if (!AIRouterService.hasValidConfig(config)) {
    return sendError(res, "No AI API key configured", 400);
}
```

## 🎨 UI Components

### Settings Page Sections
```
⚙️ Settings
├── 📊 AI Status Card (shows active providers)
├── 🤖 AI Provider Configuration
│   ├── Primary AI Provider selector
│   ├── Gemini API Key (with validation)
│   └── Grok API Key (with validation)
├── 🎯 Task Specialization (info card)
├── 🧠 AI Thinking Mode
└── 🌍 Language & Notifications
```

### Validation Flow
```
1. User enters API key
2. Click "Validasi" button
3. Real-time check:
   ✅ Valid → Green checkmark + save
   ❌ Invalid → Red error message
4. Save settings
5. AI Status Card updates automatically
```

## 🔄 Routing Logic

```
When task is requested:
1. Check available providers (from user's keys)
2. If 1 provider only → use it
3. If 2 providers → check TASK_SPECIALIZATION
4. Use optimal provider for task
5. If fails → try alternative (fallback)
6. Return result or error
```

## 🚨 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No AI API key configured" | No API keys saved | Add at least 1 key in Settings |
| "API key tidak valid" | Invalid/expired key | Check key from console, try new one |
| "Both AI providers failed" | Network/API issue | Check internet, retry later |
| "Rate limit exceeded" | Too many requests | Wait a bit, or use other provider |

## 🔒 Security

- 🔐 Keys encrypted in database
- 🎭 Keys masked in UI: `****xyz`
- ✅ Validated before save
- 🚫 Never logged
- 👤 User-isolated

## 📊 Status Indicators

```typescript
// In AI Status Card:
hasGemini: true/false  → 🟢 Terhubung / ⚫ Tidak terkonfigurasi
hasGrok: true/false    → 🟢 Terhubung / ⚫ Tidak terkonfigurasi
canUseFallback: true   → 💚 Kedua AI tersedia (optimal)
canUseFallback: false  → 🟡 Satu AI tersedia
```

## 🎓 Best Practices

✅ **DO:**
- Use 2 API keys for optimal performance
- Validate keys before saving
- Check `hasValidConfig()` before AI calls
- Handle errors gracefully
- Show clear feedback to users

❌ **DON'T:**
- Call `geminiService` or `grokService` directly (use `aiRouter`)
- Store API keys in frontend
- Log API keys anywhere
- Skip validation
- Ignore fallback errors

## 🐛 Quick Debug

```typescript
// Check if user has AI configured
const config = await getAIConfig(userId);
console.log('Has Gemini:', !!config.geminiApiKey);
console.log('Has Grok:', !!config.grokApiKey);
console.log('Active provider:', config.provider);

// Check task routing
const provider = aiRouter.selectProvider('analyze_assignment', config);
console.log('Will use:', provider); // 'gemini' or 'grok'

// Get all task mappings
const spec = AIRouterService.getTaskSpecialization();
console.log(spec);
```

## 📈 Performance Tips

- **Cold start:** First call might be slower (AI initialization)
- **Caching:** Consider caching frequently used AI responses
- **Fallback:** Adds ~2-3s if primary fails (worth the reliability)
- **Concurrent:** Both AIs can run in parallel if needed

## 🔗 Quick Links

- 📖 [Full Guide](./AI_ROUTER_GUIDE.md)
- 📋 [Implementation Summary](./AI_ROUTER_IMPLEMENTATION_SUMMARY.md)
- 🔧 [Settings UI Component](../components/Settings.tsx)
- ⚙️ [AI Router Service](../backend/src/services/ai-router.service.ts)

---

**Last Updated:** 2026-01-24  
**Version:** 1.0.0
