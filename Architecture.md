# Architecture Documentation

## Overview

EmpowerMint is a full-stack web application built with React (frontend) and Node.js/Express (backend), integrating Google Gemini AI for personalized financial education. The application follows a monolithic repository structure with clear separation between frontend and backend concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│              (React SPA - Vite)                          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JSON)
┌────────────────────▼────────────────────────────────────┐
│              Express Backend API                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │ Controllers  │  │  Services    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│  ┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────┐ │
│  │   SQLite    │   │   Gemini AI  │   │  Static     │ │
│  │  Database   │   │     API      │   │  JSON Data  │ │
│  └─────────────┘   └──────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 18** with TypeScript - Component-based UI framework
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **Context API + Hooks** - State management (no Redux needed for hackathon scope)

### Backend
- **Node.js** with TypeScript - Runtime environment
- **Express** - Web framework for REST API
- **SQLite** - File-based relational database
- **@google/generative-ai** - Gemini API client
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Directory Structure

```
empowermint/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/       # Header, Footer, Navigation
│   │   │   ├── ui/           # Button, Card, Modal, etc.
│   │   │   ├── lessons/      # Lesson-specific components
│   │   │   ├── scenarios/    # Scenario-specific components
│   │   │   ├── simulator/    # Wealth simulator component
│   │   │   ├── onboarding/   # Onboarding components
│   │   │   └── accessibility/ # Accessibility controls
│   │   ├── routes/           # Page components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript type definitions
│   │   └── styles/           # Global styles
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # Express route definitions
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (Gemini, progress)
│   │   ├── models/           # Data models (if needed)
│   │   ├── db/               # Database setup and queries
│   │   ├── config/           # Configuration (env, Gemini)
│   │   ├── data/             # Static JSON content
│   │   └── types/            # TypeScript type definitions
│   ├── data/                 # Database files (gitignored)
│   └── package.json
│
├── README.md
├── Architecture.md          # This file
├── DEMO_SCRIPT.md
├── PITCH_SCRIPT.md
└── .gitignore
```

## Data Models

### UserProfile
```typescript
{
  id: string;                    // UUID
  createdAt: Date;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  financialGoals: string[];      // ['saving', 'investing', etc.]
  riskComfort: number;           // 1-10 scale
  learningStyle: 'visual' | 'textual' | 'interactive';
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
}
```

### Lesson
```typescript
{
  id: string;
  title: string;
  category: 'budgeting' | 'investing' | 'debt' | 'saving' | 'retirement';
  content: {
    sections: Array<{
      type: 'text' | 'image' | 'interactive';
      content: string;
    }>;
  };
  difficultyLevel: 1 | 2 | 3;
  estimatedMinutes: number;
  quizQuestions?: QuizQuestion[];
}
```

### Scenario
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'first-job' | 'rent' | 'debt' | 'market-crash' | 'emergency';
  difficultyLevel: 1 | 2 | 3;
  decisionPoints: DecisionPoint[];
  initialState: ScenarioState;
}
```

### Progress
```typescript
{
  userId: string;
  xp: number;
  level: number;                  // floor(xp / 100)
  completedLessonIds: string[];
  completedScenarioIds: string[];
  financialHealthScore: number;   // 0-100
  lastActivity: Date;
}
```

## API Design

### Base URL
- Development: `http://localhost:3000/api`
- Production: `<backend-url>/api`

### Endpoints

#### Health
- `GET /api/health` - Health check

#### Onboarding
- `POST /api/onboarding` - Complete onboarding questionnaire

#### Lessons
- `GET /api/lessons?category?&difficulty?` - List lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons/:id/complete` - Complete lesson and earn XP

#### Scenarios
- `GET /api/scenarios?category?&difficulty?` - List scenarios
- `GET /api/scenarios/:id` - Get scenario by ID
- `POST /api/scenarios/:id/decision` - Make a decision in scenario
- `POST /api/scenarios/:id/complete` - Complete scenario

#### AI
- `POST /api/ai/explain` - Get AI explanation of a concept
- `POST /api/ai/simulate-wealth` - Get AI explanation of wealth simulation
- `POST /api/ai/scenarios/:id/reflect` - Get AI reflection on scenario decision

See `API_SPEC.md` for detailed request/response formats.

## Frontend Architecture

### State Management

**UserContext** - Manages user profile and preferences
- Persists to localStorage
- Provides user profile access across app
- Handles accessibility settings updates

**ProgressContext** - Manages XP and progress tracking
- Tracks XP, level, completed items
- Persists to localStorage
- Updates on lesson/scenario completion

**ThemeContext** - Manages accessibility/theme settings
- Applies font size, contrast, colorblind mode
- Updates CSS variables and classes
- Integrates with UserContext

### Routing

All routes are defined in `App.tsx`:
- `/` - Landing page
- `/onboarding` - Onboarding questionnaire
- `/dashboard` - User dashboard with progress
- `/lessons` - Lessons list
- `/lessons/:id` - Lesson detail with quiz
- `/scenarios` - Scenarios list
- `/scenarios/:id` - Scenario player
- `/simulator` - Wealth simulator
- `/settings` - Settings and accessibility

### Component Hierarchy

```
App
└── UserProvider
    └── ProgressProvider
        └── ThemeProvider
            └── BrowserRouter
                └── Routes
                    ├── Landing
                    └── AppLayout
                        ├── Header (with XP Badge)
                        ├── Navigation
                        ├── Outlet (Dashboard, Lessons, etc.)
                        └── Footer
```

## Backend Architecture

### Request Flow

1. **Request** → Express Middleware (CORS, JSON parsing)
2. **Route** → Route handler matches URL pattern
3. **Controller** → Validates input, extracts data
4. **Service** → Business logic (database, AI calls)
5. **Response** → JSON response sent to frontend

### Database Schema

**users** table:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  financial_goals TEXT NOT NULL,
  risk_comfort INTEGER NOT NULL,
  learning_style TEXT NOT NULL,
  accessibility_font_size TEXT NOT NULL DEFAULT 'medium',
  accessibility_high_contrast INTEGER NOT NULL DEFAULT 0,
  accessibility_colorblind_mode TEXT NOT NULL DEFAULT 'none'
);
```

**progress** table:
```sql
CREATE TABLE progress (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  completed_lesson_ids TEXT NOT NULL DEFAULT '[]',
  completed_scenario_ids TEXT NOT NULL DEFAULT '[]',
  financial_health_score INTEGER NOT NULL DEFAULT 50,
  last_activity TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### AI Integration

**Gemini Service** (`backend/src/services/geminiService.ts`):
- Wraps Google Gemini API calls
- Provides three main functions:
  - `explainConcept()` - Personalized concept explanations
  - `explainWealthSimulation()` - Wealth simulation insights
  - `reflectOnScenarioDecision()` - Scenario decision reflections

**Prompt Engineering**:
- Adapts language based on user experience level
- Adjusts style based on learning preferences
- Uses inclusive, empowering language
- Includes disclaimers about educational use

## Security & Privacy

### Current Implementation (Hackathon)
- **User Identification**: Session-based with temporary IDs (no authentication)
- **Data Storage**: Local SQLite database (no cloud storage)
- **API Security**: CORS configured for frontend origin
- **Secrets**: Environment variables for API keys (never committed)

### Production Considerations
- Implement proper authentication (JWT, OAuth)
- Encrypt sensitive user data
- Rate limiting on AI endpoints
- Input validation and sanitization
- HTTPS for all connections
- Database backups

### Privacy
- No real financial data collected
- Educational scenarios only (no actual transactions)
- Clear disclaimers about educational use
- User can delete data (not implemented in hackathon version)

## Accessibility Features

### Implemented
- **Font Size Controls**: Small, Medium, Large options
- **High Contrast Mode**: Increased contrast for better visibility
- **Colorblind Modes**: Support for protanopia, deuteranopia, tritanopia
- **Keyboard Navigation**: Full keyboard support throughout
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

### Design Principles
- WCAG AA compliance target
- Inclusive language and examples
- No assumptions about user background
- Clear visual hierarchy

## Performance Considerations

### Frontend
- Code splitting via Vite
- Lazy loading of routes (can be added)
- Optimized bundle size
- Efficient re-renders with React hooks

### Backend
- SQLite for simple, fast queries
- In-memory caching of static content (lessons/scenarios)
- Async/await for non-blocking operations
- Connection pooling (SQLite handles this automatically)

## Deployment Architecture

### Development
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `npm run dev` (tsx watch on port 3000)
- Database: SQLite file in `backend/data/`

### Production (Suggested)
- **Frontend**: Static hosting on Netlify/Vercel
- **Backend**: Node.js hosting on Render/Fly.io
- **Database**: SQLite file on backend server (or migrate to PostgreSQL for scale)
- **Environment**: Set `FRONTEND_URL`, `PORT`, `GEMINI_API_KEY`

## Error Handling

### Frontend
- API errors caught and displayed to user
- Loading states for async operations
- Fallback UI for errors
- Console logging for debugging

### Backend
- Try-catch blocks in all controllers
- Structured error responses with codes
- Logging to console
- Graceful degradation (e.g., AI fallbacks)

## Future Enhancements

### Potential Improvements
- User authentication and sessions
- Social sharing features
- Multi-language support
- Advanced analytics
- Mobile app (React Native)
- Real-time collaboration features
- More scenarios and lessons
- Badges and achievements system

### Scaling Considerations
- Migrate to PostgreSQL for multi-user support
- Add Redis for session management
- Implement rate limiting
- Add CDN for static assets
- Consider microservices for AI integration
- Add monitoring and logging (e.g., Sentry)

## Development Workflow

1. **Frontend Development**: `cd frontend && npm run dev`
2. **Backend Development**: `cd backend && npm run dev`
3. **Database**: Automatically created on first run
4. **Testing**: Manual testing (unit tests can be added)
5. **Building**: `npm run build` in both directories

## Dependencies

### Key Frontend Dependencies
- `react` & `react-dom`: ^18.2.0
- `react-router-dom`: ^6.20.0
- `recharts`: ^2.10.3
- `tailwindcss`: ^3.3.6

### Key Backend Dependencies
- `express`: ^4.18.2
- `@google/generative-ai`: ^0.2.1
- `sqlite3`: ^5.1.6
- `uuid`: For user ID generation

## Environment Variables

### Backend (.env)
```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=./data/empowermint.db (optional)
FRONTEND_URL=http://localhost:5173 (optional)
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api (optional, defaults to this)
```

