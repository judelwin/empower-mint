import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import onboardingRoutes from './routes/onboarding.js';
import lessonsRoutes from './routes/lessons.js';
import scenariosRoutes from './routes/scenarios.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/scenarios', scenariosRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EmpowerMint Backend API',
    version: '0.1.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    },
  });
});

export default app;

