# EmpowerMint

An inclusive, gamified financial literacy and investing education web application powered by AI (Gemini).

## Live Demo

**Try it here:** https://empower-mint.onrender.com/

> **Note:** The backend is hosted on Render. On the first visit or after periods of inactivity, the server may need to "wake up," so the app can take some time to load or respond at first.

## Overview

EmpowerMint helps beginners learn financial concepts through interactive scenarios, visual simulations, and personalized AI-powered explanations. The app emphasizes accessibility and inclusivity, especially for underrepresented genders and financially underserved users.

## Features

- **Onboarding & Personalization**: Tailored learning paths based on user goals and experience
- **Micro-Lessons**: Short, focused lessons with interactive quizzes
- **Gamified Scenarios**: Make decisions in realistic financial situations and see the consequences
- **Wealth Simulator**: Visual tool to understand compound interest and long-term investing
- **AI-Powered Explanations**: Personalized content using Google Gemini API
- **Progress Tracking**: Earn XP and level up as you learn
- **Accessibility First**: Colorblind-safe palettes, keyboard navigation, adjustable fonts

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, React Router, Tailwind CSS, Recharts
- **Backend**: Node.js + TypeScript, Express
- **AI**: Google Gemini API
- **Database**: SQLite (or in-memory for demo)

## Getting Started

### Prerequisites

- **Node.js 18+** and npm (or pnpm/yarn)
- A **Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Note: AI features have fallbacks if the API key is not configured

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd empowermint
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

### Configuration

1. **Create a `.env` file in the `backend` directory:**
```bash
cd backend
cp .env.example .env
```

2. **Add your Gemini API key to `backend/.env`:**
```env
PORT=3000
GEMINI_API_KEY=your_api_key_here
DATABASE_PATH=./data/empowermint.db  # Optional, defaults to this
FRONTEND_URL=http://localhost:5173   # Optional, for CORS
```

**Note:** The app will work without a Gemini API key, but AI-powered explanations will use fallback messages.

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`  
The SQLite database will be automatically created at `backend/data/empowermint.db` on first run.

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (or the next available port)

3. **Open your browser** and navigate to `http://localhost:5173`

## Project Structure

```
empowermint/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── README.md          # This file
├── Architecture.md    # System architecture documentation
```

## Development

### Backend Scripts

- `npm run dev` - Start development server with hot reload (uses `tsx watch`)
- `npm run build` - Build TypeScript to JavaScript in `dist/` folder
- `npm run start` - Start production server (runs `dist/index.js`)

### Frontend Scripts

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build for production (outputs to `dist/` folder)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Development Workflow

1. Start both servers in separate terminals
2. Make changes - both servers support hot reload
3. Database is automatically created/updated on first run
4. User data persists between sessions (SQLite + localStorage)

### Database

- Database file: `backend/data/empowermint.db` (created automatically)
- Schema is initialized on first run
- Database files are gitignored - each developer has their own local database
- To reset: Delete `backend/data/empowermint.db` and restart server

## Documentation

- **[Architecture.md](./Architecture.md)** - Complete system architecture, tech stack, data models, and design decisions
- **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** - Step-by-step 3-5 minute demo guide for judges
- **[PITCH_SCRIPT.md](./PITCH_SCRIPT.md)** - 2-3 minute pitch script for hackathon presentation
- **[API_SPEC.md](./API_SPEC.md)** - Complete API endpoint documentation with request/response formats

## Project Status

**Core Features Complete:**
- User onboarding with personalization
- Interactive lessons with quizzes
- Financial scenarios with decision-making
- Wealth simulator with compound interest
- AI-powered explanations (Gemini)
- Progress tracking and gamification
- Accessibility controls
- Database persistence

**Ready for Demo:**
The application is fully functional and demo-ready. All core flows work end-to-end.

**Known Limitations (Hackathon Scope):**
- No user authentication (uses session IDs)
- Limited content (5 lessons, 3 scenarios)
- SQLite database (suitable for single-user or small deployments)
- No rate limiting on AI endpoints
- Manual testing only (no automated test suite)

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Verify `.env` file exists in `backend/` directory
- Ensure Node.js 18+ is installed

### Frontend won't connect to backend
- Verify backend is running on port 3000
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend `.env` if set

### Database errors
- Delete `backend/data/empowermint.db` and restart server
- Ensure `backend/data/` directory exists
- Check file permissions

### AI features not working
- Verify `GEMINI_API_KEY` is set in `backend/.env`
- Check backend console for API errors
- App will use fallback messages if Gemini is unavailable


