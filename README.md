# EmpowerMint

An inclusive, gamified financial literacy and investing education web application powered by AI (Gemini).

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

- Node.js 18+ and npm
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd empowermint
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

2. Add your Gemini API key to `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### Running Locally

1. Start the backend server:
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

2. In a new terminal, start the frontend dev server:
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite default port)

3. Open your browser and navigate to the frontend URL

## Project Structure

```
empowermint/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── README.md          # This file
├── Architecture.md    # System architecture documentation
├── DEMO_SCRIPT.md     # Demo walkthrough guide
└── PITCH_SCRIPT.md    # Pitch presentation script
```

## Development

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Documentation

- [Architecture.md](./Architecture.md) - System architecture and design decisions
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) - Step-by-step demo guide
- [PITCH_SCRIPT.md](./PITCH_SCRIPT.md) - Pitch presentation script

## License

[To be determined]

## Contributing

[To be determined]

