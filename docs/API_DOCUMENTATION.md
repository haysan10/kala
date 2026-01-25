# KALA API Documentation
## Complete REST API Reference

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Assignments](#assignment-endpoints)
   - [Milestones](#milestone-endpoints)
   - [AI Services](#ai-endpoints)
   - [Chat](#chat-endpoints)
   - [Synapse](#synapse-endpoints)
   - [Files](#file-endpoints)
   - [Notifications](#notification-endpoints)

---

## Overview

### Base URL
```
Development: http://localhost:3001/api
Staging:     https://api-staging.kala.app/api
Production:  https://api.kala.app/api
```

### Request Format
- Content-Type: `application/json`
- Authorization: `Bearer <jwt_token>`

### Response Format
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Success with pagination
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// Error
{
  "success": false,
  "error": "Error message description"
}
```

---

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires after 7 days by default.

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (AI service down) |

### Error Response Examples

```json
// Validation Error
{
  "success": false,
  "error": "Validation error: email: Invalid email format"
}

// Authentication Error
{
  "success": false,
  "error": "Invalid or expired token"
}

// Not Found
{
  "success": false,
  "error": "Assignment not found"
}
```

---

## Endpoints

---

## Auth Endpoints

### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "student@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400`: Validation error (invalid email, weak password)
- `409`: Email already registered

---

### POST /api/auth/login
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "student@example.com",
      "name": "John Doe",
      "aiProvider": "gemini"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "student@example.com",
    "name": "John Doe",
    "aiProvider": "gemini",
    "aiLanguage": "en",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PUT /api/auth/profile
Update user profile and AI settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "aiProvider": "grok",
  "geminiApiKey": "AIza...",
  "grokApiKey": "xai-...",
  "aiLanguage": "id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Updated",
    "aiProvider": "grok",
    "aiLanguage": "id"
  }
}
```

---

## Assignment Endpoints

### GET /api/assignments
List all assignments for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `course` | string | Filter by course name |
| `atRisk` | boolean | Filter at-risk assignments |
| `sortBy` | string | Sort by: `deadline`, `createdAt`, `progress` |
| `order` | string | Sort order: `asc`, `desc` |
| `limit` | number | Results per page (default: 20) |
| `offset` | number | Pagination offset |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Ethics Essay",
      "description": "Write about Kantian ethics...",
      "deadline": "2024-02-01T23:59:59Z",
      "course": "Philosophy",
      "overallProgress": 45,
      "atRisk": false,
      "milestoneCount": 4,
      "completedMilestones": 2,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /api/assignments/:id
Get single assignment with full details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Ethics Essay",
    "description": "Write about Kantian ethics...",
    "learningOutcome": "Analyze and evaluate ethical frameworks",
    "deadline": "2024-02-01T23:59:59Z",
    "course": "Philosophy",
    "tags": ["ethics", "kant", "essay"],
    "rubrics": ["Critical Analysis", "Citations"],
    "diagnosticQuestions": ["What is...", "How does..."],
    "overallProgress": 45,
    "atRisk": false,
    "clarityScore": 30,
    "milestones": [
      {
        "id": "m-uuid",
        "title": "Literature Review",
        "status": "completed",
        "estimatedMinutes": 120
      }
    ],
    "files": [],
    "validationHistory": [],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /api/assignments
Create new assignment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Ethics Essay",
  "description": "Write about Kantian ethics...",
  "learningOutcome": "Analyze ethical frameworks",
  "deadline": "2024-02-01T23:59:59Z",
  "course": "Philosophy",
  "tags": ["ethics", "essay"],
  "rubrics": ["Critical Analysis"],
  "diagnosticQuestions": ["What is categorical imperative?"],
  "milestones": [
    {
      "title": "Literature Review",
      "description": "Research primary sources",
      "estimatedMinutes": 120,
      "deadline": "2024-01-25T23:59:59Z"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "title": "Ethics Essay",
    ...
  }
}
```

---

### PUT /api/assignments/:id
Update assignment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (partial update supported)
```json
{
  "title": "Updated Title",
  "deadline": "2024-02-15T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /api/assignments/:id
Delete assignment and all related data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Assignment deleted successfully"
  }
}
```

---

## Milestone Endpoints

### GET /api/assignments/:id/milestones
List all milestones for an assignment.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Literature Review",
      "description": "Research primary sources",
      "estimatedMinutes": 120,
      "deadline": "2024-01-25T23:59:59Z",
      "status": "completed",
      "sortOrder": 1,
      "miniCourse": null
    }
  ]
}
```

---

### POST /api/assignments/:id/milestones
Add new milestone to assignment.

**Request Body:**
```json
{
  "title": "New Milestone",
  "description": "Description here",
  "estimatedMinutes": 60,
  "deadline": "2024-01-30T23:59:59Z"
}
```

---

### PUT /api/milestones/:id
Update milestone.

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "in_progress"
}
```

---

### PUT /api/milestones/:id/toggle
Toggle milestone completion status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "status": "completed"
    },
    "assignmentProgress": 75
  }
}
```

---

### DELETE /api/milestones/:id
Delete milestone.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Milestone deleted"
  }
}
```

---

## AI Endpoints

### POST /api/ai/analyze-assignment
Analyze assignment document/text with AI.

**Request Body:**
```json
{
  "text": "Assignment instructions text here...",
  "fileData": {
    "data": "base64-encoded-content",
    "mimeType": "application/pdf"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "Extracted Title",
    "description": "Extracted description",
    "learningOutcome": "Learning objective",
    "diagnosticQuestions": ["Q1", "Q2", "Q3"],
    "deadline": "2024-02-01",
    "course": "Philosophy",
    "rubrics": ["Criterion 1", "Criterion 2"],
    "milestones": [
      {
        "title": "Step 1",
        "description": "Description",
        "estimatedMinutes": 60,
        "deadline": "2024-01-25"
      }
    ]
  }
}
```

---

### POST /api/ai/generate-mini-course
Generate comprehensive learning module for milestone.

**Request Body:**
```json
{
  "milestoneTitle": "Literature Review",
  "milestoneDescription": "Research primary sources on ethics",
  "assignmentContext": "Essay on Kantian ethics",
  "fullRoadmap": "Optional: full milestone sequence"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "learningOutcome": "Analyze and synthesize primary sources...",
    "overview": "Understanding the 'why' behind...",
    "concepts": ["Deontology", "Categorical Imperative", ...],
    "practicalGuide": "Step-by-step guide (300+ words)...",
    "formativeAction": "Complete annotated bibliography of 5 sources",
    "expertTip": "Professional insight...",
    "masteryStatus": "untested",
    "formativeTaskCompleted": false
  }
}
```

---

### POST /api/ai/generate-synapse
Generate daily micro-challenge question.

**Request Body:**
```json
{
  "assignmentTitle": "Ethics Essay",
  "assignmentDescription": "Write about Kantian ethics",
  "progress": 45,
  "atRisk": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "question": "What if duty itself is a form of desire?"
  }
}
```

---

### POST /api/ai/generate-scaffold
Generate micro-burst task for academic freeze.

**Request Body:**
```json
{
  "assignmentContext": "Research proposal on AI in education"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "instruction": "Write one sentence describing your main research question",
    "durationSeconds": 180,
    "completed": false
  }
}
```

---

### POST /api/ai/generate-quiz
Generate assessment quiz.

**Request Body:**
```json
{
  "context": "Content about Kantian ethics and categorical imperative..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "question": "What is the categorical imperative?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Explanation of correct answer..."
    }
  ]
}
```

---

### POST /api/ai/validate-work
Perform summative assessment of student work.

**Request Body:**
```json
{
  "assignmentContext": "Essay on Kantian ethics...",
  "workText": "Student's submitted essay text...",
  "reflectionText": "Student's reflection on their work..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallScore": 78,
    "rubricScores": [
      {
        "criterion": "Critical Analysis",
        "score": 3,
        "feedback": "Good analysis but could go deeper..."
      }
    ],
    "strengths": ["Clear argumentation", "Good structure"],
    "weaknesses": ["Limited sources", "Surface-level analysis"],
    "recommendations": ["Add more primary sources", "Deepen ethical analysis"],
    "alignmentScore": 82,
    "assessmentDate": "2024-01-20T15:30:00Z"
  }
}
```

---

## Chat Endpoints

### GET /api/assignments/:id/chat
Get or create chat session for assignment.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | `tutor` or `debate` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "type": "tutor",
    "messages": [
      {
        "role": "model",
        "content": "Welcome! How can I help?",
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/chat/:sessionId/message
Send message in chat session.

**Request Body:**
```json
{
  "message": "Can you explain the categorical imperative?"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "role": "user",
      "content": "Can you explain...",
      "createdAt": "2024-01-20T10:01:00Z"
    },
    "aiResponse": {
      "role": "model",
      "content": "The categorical imperative is...",
      "createdAt": "2024-01-20T10:01:02Z"
    }
  }
}
```

---

### GET /api/chat/:sessionId/history
Get full chat history.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "type": "tutor",
    "messages": [...]
  }
}
```

---

## Synapse Endpoints

### GET /api/synapse/today
Get today's synapse challenge.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "synapse-uuid",
    "question": "What if your core assumption is incomplete?",
    "assignmentId": "assignment-uuid",
    "assignmentTitle": "Ethics Essay",
    "date": "2024-01-20",
    "completed": false,
    "clarityAwarded": 15
  }
}
```

---

### POST /api/synapse/:id/complete
Complete synapse with response.

**Request Body:**
```json
{
  "response": "My reflection on this question..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "synapse": {
      "id": "uuid",
      "completed": true,
      "response": "My reflection..."
    },
    "clarityAwarded": 15,
    "newClarityScore": 45
  }
}
```

---

## File Endpoints

### GET /api/assignments/:id/files
List files for assignment.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "file-uuid",
      "name": "essay-draft.docx",
      "type": "draft",
      "size": "245KB",
      "createdAt": "2024-01-18T14:00:00Z"
    }
  ]
}
```

---

### POST /api/assignments/:id/files
Upload files to assignment.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `files`: File(s) to upload
- `type`: File type (`instruction`, `draft`, `final`, `feedback`)

**Response (201):**
```json
{
  "success": true,
  "data": [
    {
      "id": "new-file-uuid",
      "name": "document.pdf",
      "type": "draft"
    }
  ]
}
```

---

### DELETE /api/files/:id
Delete file.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "File deleted"
  }
}
```

---

## Notification Endpoints

### GET /api/notifications
Get user notifications.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `unreadOnly` | boolean | Filter unread only |
| `limit` | number | Results per page |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "title": "Deadline Alert",
      "message": "Essay due in 2 days!",
      "type": "deadline",
      "read": false,
      "link": { "view": "assignment", "id": "uuid" },
      "createdAt": "2024-01-20T08:00:00Z"
    }
  ]
}
```

---

### PUT /api/notifications/read-all
Mark all notifications as read.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

---

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| Authentication | 10 req/min |
| AI Services | 30 req/min |
| Standard CRUD | 100 req/min |
| File Upload | 20 req/min |

---

## Changelog

### v1.0.0 (January 2026)
- Initial API release
- Full CRUD for assignments and milestones
- AI integration with Gemini and Grok
- Chat and synapse features
- File management
