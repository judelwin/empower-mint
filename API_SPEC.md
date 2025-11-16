# API Specification

Base URL: `http://localhost:3000/api` (development)  
All requests/responses use JSON format.

---

## Health Check

### GET /api/health

**Description:** Check if the API is running

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Onboarding

### POST /api/onboarding

**Description:** Complete onboarding and create user profile

**Request Body:**
```json
{
  "experienceLevel": "beginner",
  "financialGoals": ["saving", "investing"],
  "riskComfort": 5,
  "learningStyle": "interactive"
}
```

**Response:**
```json
{
  "userProfile": {
    "id": "uuid-here",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "experienceLevel": "beginner",
    "financialGoals": ["saving", "investing"],
    "riskComfort": 5,
    "learningStyle": "interactive",
    "accessibility": {
      "fontSize": "medium",
      "highContrast": false,
      "colorblindMode": "none"
    }
  },
  "recommendedLessons": ["lesson-1-compound-interest", "lesson-2-budgeting-basics"],
  "recommendedScenarios": ["scenario-1-first-job"]
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid values)
- `500` - Internal server error

---

## Lessons

### GET /api/lessons

**Description:** List all lessons, optionally filtered

**Query Parameters:**
- `category` (optional): `budgeting` | `investing` | `debt` | `saving` | `retirement`
- `difficulty` (optional): `1` | `2` | `3`

**Example:** `GET /api/lessons?category=investing&difficulty=1`

**Response:**
```json
{
  "lessons": [
    {
      "id": "lesson-1-compound-interest",
      "title": "Understanding Compound Interest",
      "category": "investing",
      "difficultyLevel": 1,
      "estimatedMinutes": 10,
      "content": { ... },
      "quizQuestions": [ ... ]
    }
  ]
}
```

### GET /api/lessons/:id

**Description:** Get a specific lesson by ID

**Response:**
```json
{
  "lesson": {
    "id": "lesson-1-compound-interest",
    "title": "Understanding Compound Interest",
    "category": "investing",
    "difficultyLevel": 1,
    "estimatedMinutes": 10,
    "content": {
      "sections": [
        {
          "type": "text",
          "content": "Compound interest is..."
        }
      ]
    },
    "quizQuestions": [
      {
        "id": "q1",
        "question": "What is compound interest?",
        "options": ["...", "..."],
        "correctAnswer": 1,
        "explanation": "..."
      }
    ]
  }
}
```

**Error Responses:**
- `404` - Lesson not found

### POST /api/lessons/:id/complete

**Description:** Complete a lesson and earn XP

**Request Headers:**
- `X-User-Id` (optional): User ID for progress tracking

**Request Body:**
```json
{
  "score": 85,
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": 1
    }
  ],
  "userId": "uuid-here" // Optional, also accepts X-User-Id header
}
```

**Response:**
```json
{
  "xpEarned": 42,
  "progress": {
    "userId": "uuid-here",
    "xp": 142,
    "level": 1,
    "completedLessonIds": ["lesson-1-compound-interest"],
    "completedScenarioIds": [],
    "financialHealthScore": 85,
    "lastActivity": "2024-01-15T10:35:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Lesson not found
- `400` - Invalid request data

---

## Scenarios

### GET /api/scenarios

**Description:** List all scenarios, optionally filtered

**Query Parameters:**
- `category` (optional): `first-job` | `rent` | `debt` | `market-crash` | `emergency`
- `difficulty` (optional): `1` | `2` | `3`

**Example:** `GET /api/scenarios?difficulty=1`

**Response:**
```json
{
  "scenarios": [
    {
      "id": "scenario-1-first-job",
      "title": "Your First Real Job",
      "description": "...",
      "category": "first-job",
      "difficultyLevel": 1,
      "decisionPoints": [ ... ],
      "initialState": { ... }
    }
  ]
}
```

### GET /api/scenarios/:id

**Description:** Get a specific scenario by ID

**Response:**
```json
{
  "scenario": {
    "id": "scenario-1-first-job",
    "title": "Your First Real Job",
    "description": "...",
    "category": "first-job",
    "difficultyLevel": 1,
    "decisionPoints": [
      {
        "id": "dp1",
        "prompt": "You receive your first paycheck...",
        "choices": [
          {
            "id": "choice1a",
            "text": "Save everything",
            "shortTermImpact": { ... },
            "longTermImpact": { ... }
          }
        ]
      }
    ],
    "initialState": {
      "savings": 500,
      "debt": 25000,
      "monthlyIncome": 3500,
      "monthlyExpenses": 2000,
      "stressLevel": 5,
      "financialKnowledge": 4
    }
  }
}
```

### POST /api/scenarios/:id/decision

**Description:** Make a decision in a scenario and get updated state + AI reflection

**Request Headers:**
- `X-User-Id` (optional): User ID for progress tracking

**Request Body:**
```json
{
  "decisionPointId": "dp1",
  "choiceId": "choice1b",
  "currentState": {
    "savings": 500,
    "debt": 25000,
    "monthlyIncome": 3500,
    "monthlyExpenses": 2000,
    "stressLevel": 5,
    "financialKnowledge": 4
  },
  "userId": "uuid-here" // Optional, also accepts X-User-Id header
}
```

**Response:**
```json
{
  "newState": {
    "savings": 500,
    "debt": 24000,
    "monthlyIncome": 3500,
    "monthlyExpenses": 2000,
    "stressLevel": 3,
    "financialKnowledge": 6
  },
  "aiReflection": "You chose to split your extra income between an emergency fund and debt repayment. This is a balanced approach...",
  "xpEarned": 30,
  "progress": {
    "userId": "uuid-here",
    "xp": 30,
    "level": 1,
    "completedLessonIds": [],
    "completedScenarioIds": [],
    "financialHealthScore": 60,
    "lastActivity": "2024-01-15T10:40:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Scenario, decision point, or choice not found
- `400` - Invalid request data

### POST /api/scenarios/:id/complete

**Description:** Complete a scenario and earn bonus XP

**Request Headers:**
- `X-User-Id` (optional): User ID for progress tracking

**Request Body:**
```json
{
  "finalState": {
    "savings": 2000,
    "debt": 22000,
    "monthlyIncome": 3500,
    "monthlyExpenses": 2100,
    "stressLevel": 4,
    "financialKnowledge": 7
  },
  "userId": "uuid-here" // Optional, also accepts X-User-Id header
}
```

**Response:**
```json
{
  "xpEarned": 100,
  "progress": {
    "userId": "uuid-here",
    "xp": 130,
    "level": 1,
    "completedLessonIds": [],
    "completedScenarioIds": ["scenario-1-first-job"],
    "financialHealthScore": 75,
    "lastActivity": "2024-01-15T10:45:00.000Z"
  }
}
```

---

## AI Endpoints

### POST /api/ai/explain

**Description:** Get AI-powered explanation of a financial concept

**Request Body:**
```json
{
  "concept": "compound interest",
  "context": "Optional context from lesson content",
  "userProfile": {
    "experienceLevel": "beginner",
    "learningStyle": "interactive"
  }
}
```

**Response:**
```json
{
  "explanation": "Compound interest is like a snowball rolling downhill... [personalized explanation based on user profile]"
}
```

**Error Responses:**
- `400` - Missing required fields
- `500` - AI service error

### POST /api/ai/simulate-wealth

**Description:** Get AI-powered explanation of wealth simulation results

**Request Body:**
```json
{
  "initialAmount": 1000,
  "monthlyContribution": 100,
  "annualReturn": 7,
  "years": 30,
  "userProfile": {
    "experienceLevel": "beginner",
    "learningStyle": "visual"
  }
}
```

**Response:**
```json
{
  "dataPoints": [
    { "year": 0, "value": 1000 },
    { "year": 1, "value": 2843 },
    { "year": 30, "value": 122346 }
  ],
  "explanation": "Based on your simulation, starting with $1,000 and contributing $100 monthly at 7% annual return for 30 years... [personalized explanation]"
}
```

### POST /api/ai/scenarios/:id/reflect

**Description:** Get AI-powered reflection on a scenario decision

**Request Body:**
```json
{
  "decisionPointId": "dp1",
  "choiceId": "choice1b",
  "currentState": { ... },
  "userProfile": {
    "experienceLevel": "beginner",
    "learningStyle": "interactive"
  }
}
```

**Response:**
```json
{
  "reflection": "You chose to split your income between savings and debt. This reflects good financial judgment... [personalized reflection]"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Invalid request data (400)
- `INTERNAL_ERROR` - Server error (500)
- `UNKNOWN_ERROR` - Unexpected error

---

## Authentication

**Current Implementation (Hackathon):**
- User ID passed via `X-User-Id` header or `userId` field in request body
- No authentication/authorization (all users anonymous)
- Database tracks users by ID

**Production Considerations:**
- Implement JWT-based authentication
- Add session management
- User ownership verification
- Rate limiting per user

---

## Rate Limiting

**Current Implementation:**
- No rate limiting (hackathon scope)

**Production Considerations:**
- Rate limit AI endpoints (e.g., 10 requests/minute per user)
- Rate limit general API endpoints
- Consider API key tiers

---

## Data Types

### ScenarioState
```typescript
{
  savings: number;           // Current savings amount
  debt: number;              // Current debt amount
  monthlyIncome: number;     // Monthly income
  monthlyExpenses: number;   // Monthly expenses
  stressLevel: number;       // 1-10 scale
  financialKnowledge: number; // 1-10 scale
}
```

### ScenarioStateDelta
```typescript
{
  savingsChange: number;
  debtChange: number;
  expenseChange: number;
  stressChange: number;
  knowledgeChange: number;
}
```

---

## Notes

- All dates are in ISO 8601 format
- All monetary values are in USD (can be converted in frontend)
- XP calculation: Level = floor(XP / 100)
- Financial Health Score: 0-100, derived from quiz scores and scenario decisions

