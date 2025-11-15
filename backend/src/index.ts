import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`🚀 EmpowerMint Backend API running on http://localhost:${env.port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  if (!env.geminiApiKey) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not set. AI features will not work.');
  }
});

