import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import onboardingRoutes from './routes/onboarding.js';
import lessonsRoutes from './routes/lessons.js';
import scenariosRoutes from './routes/scenarios.js';
import aiRoutes from './routes/ai.js';

const app = express();

// Middleware - CORS configuration
// Allowed origins are FRONTEND URLs that can make requests to this backend
// On Render: Set FRONTEND_URL environment variable to your frontend service URL
// Example: FRONTEND_URL=https://empower-mint.onrender.com
const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://empower-mint.onrender.com', // Default Render frontend URL
  // Add FRONTEND_URL from environment if set
  ...(frontendUrl ? [frontendUrl] : []),
].filter((url): url is string => Boolean(url)); // Remove undefined/null values

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, only allow listed origins
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        // In development, allow any origin
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
}));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'EmpowerMint Backend API',
    version: '0.1.0',
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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

