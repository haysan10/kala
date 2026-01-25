# 🤖 AI Router - Smart Multi-AI System Guide

## Overview

KALA menggunakan **AI Router** yang cerdas untuk mengoptimalkan penggunaan multiple AI providers (Google Gemini dan xAI Grok). Sistem ini secara otomatis memilih AI yang paling optimal untuk setiap tugas berdasarkan keunggulan masing-masing.

## ✨ Fitur Utama

### 1. **Dukungan Single atau Dual API Key**
- ✅ Bisa menggunakan **hanya 1 API key** (Gemini saja atau Grok saja)
- ✅ Bisa menggunakan **kedua API key** untuk performa optimal
- ✅ Sistem otomatis beradaptasi dengan API key yang tersedia

### 2. **Task Specialization**
Setiap AI dipilih berdasarkan keunggulannya:

#### **Google Gemini** - Optimal untuk:
| Task | Alasan |
|------|--------|
| 📄 Analyze Assignment | Unggul dalam analisis dokumen & output terstruktur |
| 📚 Generate Mini Course | Lebih baik untuk konten edukatif panjang |
| 📝 Generate Quiz | Optimal untuk assessment terstruktur |
| ✅ Validate Work | Bagus untuk penilaian berbasis rubrik |

#### **xAI Grok** - Optimal untuk:
| Task | Alasan |
|------|--------|
| 💡 Generate Synapse | Lebih kreatif untuk pertanyaan provokatif |
| 🎯 Generate Scaffolding | Lebih cepat untuk respons motivasional |
| 💬 Chat Tutoring | Unggul dalam percakapan interaktif |
| 🎭 Chat Debate | Lebih baik untuk argumentasi & debat |

### 3. **Automatic Fallback**
- Jika AI primary gagal, sistem otomatis mencoba AI alternatif
- Tidak ada downtime untuk user
- Error handling yang robust

### 4. **API Key Validation**
- ✅ Validasi real-time sebelum menyimpan
- ✅ Feedback jelas: valid/invalid
- ✅ Error messages yang informatif

## 🚀 Cara Penggunaan

### Untuk User

#### 1. **Setup API Keys**

**Opsi A: Gunakan Satu API Key**
```
1. Buka Settings
2. Pilih AI Provider (Gemini atau Grok)
3. Masukkan API key
4. Klik "Validasi" untuk memastikan key valid
5. Simpan Pengaturan
```

**Opsi B: Gunakan Kedua API Key (Recommended)**
```
1. Buka Settings
2. Masukkan Gemini API key → Validasi
3. Masukkan Grok API key → Validasi
4. Pilih Primary Provider (default yang digunakan jika tidak ada preferensi khusus)
5. Simpan Pengaturan
```

#### 2. **Mendapatkan API Keys**

**Google Gemini:**
- Kunjungi: https://aistudio.google.com/apikey
- Sign in dengan Google Account
- Create API Key
- Copy dan paste ke KALA Settings

**xAI Grok:**
- Kunjungi: https://console.x.ai/
- Sign up / Login
- Navigate to API Keys
- Create new key
- Copy dan paste ke KALA Settings

#### 3. **Monitoring Status AI**

Di halaman Settings, Anda akan melihat:
- ✅ **AI Status Card**: Menunjukkan provider mana yang aktif
- 🎯 **Task Specialization**: Menunjukkan AI mana yang akan digunakan untuk task tertentu
- 💡 **Smart Routing Message**: Informasi tentang konfigurasi Anda

### Untuk Developer

#### 1. **Menggunakan AI Router di Code**

```typescript
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";
import { db } from "../config/database.js";
import { userSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Helper function untuk mendapatkan AI config
async function getAIConfig(userId: string) {
    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
    });

    if (!settings) {
        return AIRouterService.buildConfig({
            aiProvider: null,
            geminiApiKey: null,
            grokApiKey: null,
            aiLanguage: null,
        });
    }

    return AIRouterService.buildConfig({
        aiProvider: settings.aiProvider,
        geminiApiKey: settings.geminiApiKey,
        grokApiKey: settings.grokApiKey,
        aiLanguage: settings.language,
    });
}

// Contoh penggunaan
router.post("/api/ai/analyze", async (req, res, next) => {
    try {
        const config = await getAIConfig(req.user!.id);
        
        // Check if user has at least one API key
        if (!AIRouterService.hasValidConfig(config)) {
            return sendError(res, "No AI API key configured", 400);
        }

        // AI Router akan otomatis memilih Gemini untuk analyze (optimal)
        // Atau Grok jika Gemini tidak tersedia
        const result = await aiRouter.analyzeAssignment(
            text, 
            fileData, 
            config
        );
        
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});
```

#### 2. **Validasi API Key**

```typescript
// Endpoint sudah tersedia di /api/user/validate-api-key
router.post("/validate-api-key", async (req, res, next) => {
    const { provider, apiKey } = req.body;

    let result;
    if (provider === "gemini") {
        result = await aiRouter.validateGeminiKey(apiKey);
    } else {
        result = await aiRouter.validateGrokKey(apiKey);
    }

    if (result.valid) {
        return sendSuccess(res, result);
    } else {
        return sendError(res, result.message, 400);
    }
});
```

#### 3. **Mendapatkan Task Specialization Info**

```typescript
// Get task specialization mapping
const specialization = AIRouterService.getTaskSpecialization();

console.log(specialization);
/* Output:
{
  analyze_assignment: { provider: 'gemini', reason: '...' },
  generate_synapse: { provider: 'grok', reason: '...' },
  ...
}
*/
```

#### 4. **Check Config Status**

```typescript
const config = await getAIConfig(userId);
const status = aiRouter.getConfigStatus(config);

console.log(status);
/* Output:
{
  hasGemini: true,
  hasGrok: true,
  activeProvider: 'gemini',
  canUseFallback: true,
  message: 'Kedua AI tersedia. Task akan otomatis dialokasikan...'
}
*/
```

## 🔧 API Endpoints

### 1. `POST /api/user/validate-api-key`
Validasi API key sebelum menyimpan

**Request:**
```json
{
  "provider": "gemini", // or "grok"
  "apiKey": "AIzaSy..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "provider": "gemini",
    "message": "API key valid! Connected to Gemini.",
    "model": "gemini-2.0-flash"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "API key Gemini tidak valid atau sudah expired"
}
```

### 2. `GET /api/user/ai-status`
Mendapatkan status konfigurasi AI user

**Response:**
```json
{
  "success": true,
  "data": {
    "hasGemini": true,
    "hasGrok": true,
    "activeProvider": "gemini",
    "canUseFallback": true,
    "message": "Kedua AI tersedia...",
    "taskSpecialization": {
      "analyze_assignment": {
        "provider": "gemini",
        "reason": "Gemini unggul dalam analisis dokumen..."
      },
      "generate_synapse": {
        "provider": "grok",
        "reason": "Grok lebih kreatif..."
      }
    }
  }
}
```

## 🎯 Task Routing Logic

AI Router menggunakan logic berikut untuk memilih provider:

```typescript
function selectProvider(task: TaskType, config: AIConfig): AIProvider {
    const available = getAvailableProviders(config);
    
    // 1. If only one provider available, use it
    if (available.length === 1) {
        return available[0];
    }
    
    // 2. Get optimal provider for this task
    const optimalProvider = TASK_SPECIALIZATION[task];
    
    // 3. If optimal provider is available, use it
    if (available.includes(optimalProvider)) {
        return optimalProvider;
    }
    
    // 4. Otherwise use user's preferred provider or first available
    return available.includes(config.provider) 
        ? config.provider 
        : available[0];
}
```

## 💡 Best Practices

### 1. **Untuk Performa Optimal**
- Gunakan **kedua API key** (Gemini + Grok)
- Biarkan sistem memilih AI yang optimal untuk setiap task
- Set primary provider sesuai task yang paling sering Anda gunakan

### 2. **Untuk Budget Terbatas**
- Gunakan **1 API key** saja (Gemini atau Grok)
- Sistem akan menggunakan satu-satunya provider yang tersedia untuk semua task
- Pilih Gemini jika fokus pada analisis dokumen
- Pilih Grok jika fokus pada chat/percakapan

### 3. **Error Handling**
- Selalu check `AIRouterService.hasValidConfig(config)` sebelum memanggil AI
- Gunakan try-catch untuk menangani error from AI providers
- Berikan feedback yang jelas ke user jika API key tidak valid

### 4. **Security**
- API keys disimpan di database dengan enkripsi
- Hanya 4 karakter terakhir yang ditampilkan di UI (masked: `****xyz`)
- Validasi API key dilakukan sebelum menyimpan
- API keys tidak pernah dikirim ke client dalam bentuk plain text

## 🔒 Security & Privacy

1. **Enkripsi**: API keys dienkripsi di database
2. **Masking**: Keys di-mask saat ditampilkan (`****xyz`)
3. **Validation**: Keys divalidasi sebelum disimpan
4. **No Logging**: API keys tidak pernah di-log
5. **User Isolation**: Setiap user hanya bisa akses key mereka sendiri

## 🐛 Troubleshooting

### Problem: "No AI API key configured"
**Solution:** 
- Buka Settings
- Tambahkan minimal 1 API key
- Validasi dan simpan

### Problem: "API key tidak valid"
**Solution:**
- Check apakah key sudah benar (copy-paste dari console)
- Check apakah key masih aktif (belum expired)
- Check quota API (mungkin sudah habis)

### Problem: "Both AI providers failed"
**Solution:**
- Check koneksi internet
- Check status API providers (Google/xAI)
- Coba regenerate API key baru

### Problem: Chat tidak menggunakan Grok padahal sudah ada key
**Solution:**
- Check di Settings apakah Grok key benar-benar tersimpan
- Refresh halaman
- Logout dan login kembali

## 📊 Monitoring & Analytics

Developer dapat monitor penggunaan AI Router melalui console logs:

```
[AIRouter] Executing generate_synapse with grok
[AIRouter] Primary provider grok failed: Rate limit exceeded
[AIRouter] Attempting fallback to gemini
```

## 🚀 Future Enhancements

- [ ] AI usage analytics per user
- [ ] Cost tracking per provider
- [ ] Custom task-to-provider mapping
- [ ] A/B testing untuk task specialization
- [ ] Support untuk provider tambahan (Claude, OpenAI, dll)

## 📝 Changelog

### v1.0.0 (2026-01-24)
- ✅ Multi-provider support (Gemini + Grok)
- ✅ Task specialization system
- ✅ Automatic fallback
- ✅ API key validation
- ✅ Single/dual key support
- ✅ Enhanced Settings UI

---

**Developed with ❤️ by KALA Team**
