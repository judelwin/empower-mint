import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  geminiApiKey: string | undefined;
  nodeEnv: string;
}

function validateEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT configuration. Must be a number between 1 and 65535.');
  }

  return {
    port,
    geminiApiKey,
    nodeEnv,
  };
}

export const env = validateEnv();

