import app from './app.js';
import { env } from './config/env.js';
import { getDatabase } from './db/database.js';
import { closeDatabase } from './db/database.js';

// Initialize database connection
getDatabase();

// Bind to 0.0.0.0 for Render/cloud hosting (allows external connections)
app.listen(env.port, '0.0.0.0', () => {
  console.log(`EmpowerMint Backend API running on http://0.0.0.0:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Database: SQLite at ${process.env.DATABASE_PATH || 'backend/data/empowermint.db'}`);
  if (!env.geminiApiKey) {
    console.warn('Warning: GEMINI_API_KEY not set. AI features will not work.');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

