import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { UserProfile } from '../types/user.js';
import { Progress } from '../types/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/empowermint.db');

let db: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!db) {
    try {
      // Ensure data directory exists
      const dbDir = path.dirname(DB_PATH);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          throw err;
        }
        console.log('Connected to SQLite database');
      });

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
        }
      });

      // Initialize schema
      initializeSchema();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  return db;
}

function initializeSchema() {
  if (!db) return;

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      financial_goals TEXT NOT NULL,
      risk_comfort INTEGER NOT NULL,
      learning_style TEXT NOT NULL,
      accessibility_font_size TEXT NOT NULL DEFAULT 'medium',
      accessibility_high_contrast INTEGER NOT NULL DEFAULT 0,
      accessibility_colorblind_mode TEXT NOT NULL DEFAULT 'none'
    )
  `);

  // Progress table
  db.run(`
    CREATE TABLE IF NOT EXISTS progress (
      user_id TEXT PRIMARY KEY,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      completed_lesson_ids TEXT NOT NULL DEFAULT '[]',
      completed_scenario_ids TEXT NOT NULL DEFAULT '[]',
      financial_health_score INTEGER NOT NULL DEFAULT 50,
      last_activity TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database schema initialized');
}

// Promisified database methods
export const dbRun = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = <T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
};

export const dbAll = <T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

// User operations
export async function saveUser(user: UserProfile): Promise<void> {
  const database = getDatabase();
  
  await dbRun(
    database,
    `INSERT OR REPLACE INTO users (
      id, created_at, experience_level, financial_goals, risk_comfort,
      learning_style, accessibility_font_size, accessibility_high_contrast,
      accessibility_colorblind_mode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.createdAt.toISOString(),
      user.experienceLevel,
      JSON.stringify(user.financialGoals),
      user.riskComfort,
      user.learningStyle,
      user.accessibility.fontSize,
      user.accessibility.highContrast ? 1 : 0,
      user.accessibility.colorblindMode,
    ]
  );
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  const database = getDatabase();
  
  const row = await dbGet<any>(
    database,
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (!row) return null;

  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    experienceLevel: row.experience_level,
    financialGoals: JSON.parse(row.financial_goals),
    riskComfort: row.risk_comfort,
    learningStyle: row.learning_style,
    accessibility: {
      fontSize: row.accessibility_font_size,
      highContrast: row.accessibility_high_contrast === 1,
      colorblindMode: row.accessibility_colorblind_mode,
    },
  };
}

export async function updateUserAccessibility(
  userId: string,
  accessibility: Partial<UserProfile['accessibility']>
): Promise<void> {
  const database = getDatabase();
  const user = await getUser(userId);
  if (!user) return;

  const updated = {
    ...user.accessibility,
    ...accessibility,
  };

  await dbRun(
    database,
    `UPDATE users SET 
      accessibility_font_size = ?,
      accessibility_high_contrast = ?,
      accessibility_colorblind_mode = ?
    WHERE id = ?`,
    [
      updated.fontSize,
      updated.highContrast ? 1 : 0,
      updated.colorblindMode,
      userId,
    ]
  );
}

// Progress operations
export async function saveProgress(progress: Progress): Promise<void> {
  const database = getDatabase();
  
  await dbRun(
    database,
    `INSERT OR REPLACE INTO progress (
      user_id, xp, level, completed_lesson_ids, completed_scenario_ids,
      financial_health_score, last_activity
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      progress.userId,
      progress.xp,
      progress.level,
      JSON.stringify(progress.completedLessonIds),
      JSON.stringify(progress.completedScenarioIds),
      progress.financialHealthScore,
      progress.lastActivity instanceof Date
        ? progress.lastActivity.toISOString()
        : progress.lastActivity,
    ]
  );
}

export async function getProgress(userId: string): Promise<Progress | null> {
  const database = getDatabase();
  
  const row = await dbGet<any>(
    database,
    'SELECT * FROM progress WHERE user_id = ?',
    [userId]
  );

  if (!row) return null;

  return {
    userId: row.user_id,
    xp: row.xp,
    level: row.level,
    completedLessonIds: JSON.parse(row.completed_lesson_ids),
    completedScenarioIds: JSON.parse(row.completed_scenario_ids),
    financialHealthScore: row.financial_health_score,
    lastActivity: new Date(row.last_activity),
  };
}

export async function updateProgress(userId: string, updates: Partial<Progress>): Promise<Progress> {
  getDatabase(); // Ensure database is initialized
  const existing = await getProgress(userId);
  
  if (!existing) {
    // Create new progress
    const newProgress: Progress = {
      userId,
      xp: updates.xp ?? 0,
      level: updates.level ?? Math.floor((updates.xp ?? 0) / 100),
      completedLessonIds: updates.completedLessonIds ?? [],
      completedScenarioIds: updates.completedScenarioIds ?? [],
      financialHealthScore: updates.financialHealthScore ?? 50,
      lastActivity: updates.lastActivity ?? new Date(),
    };
    await saveProgress(newProgress);
    return newProgress;
  }

  const updated: Progress = {
    ...existing,
    ...updates,
    level: updates.xp !== undefined ? Math.floor(updates.xp / 100) : existing.level,
  };

  await saveProgress(updated);
  return updated;
}

// Close database connection (useful for tests or graceful shutdown)
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

