import { Progress } from '../types/progress.js';
import * as db from '../db/database.js';

export async function getProgress(userId: string): Promise<Progress | null> {
  return db.getProgress(userId);
}

export async function saveProgress(progress: Progress): Promise<void> {
  return db.saveProgress(progress);
}

export async function updateProgress(userId: string, updates: Partial<Progress>): Promise<Progress> {
  return db.updateProgress(userId, updates);
}

export async function addXP(userId: string, amount: number): Promise<Progress> {
  const current = await getProgress(userId);
  const newXP = (current?.xp || 0) + amount;
  const newLevel = Math.floor(newXP / 100);

  return updateProgress(userId, {
    xp: newXP,
    level: newLevel,
    lastActivity: new Date(),
  });
}

export async function completeLesson(userId: string, lessonId: string, xpEarned: number): Promise<Progress> {
  const current = await getProgress(userId);
  const completedLessonIds = current?.completedLessonIds || [];
  
  if (!completedLessonIds.includes(lessonId)) {
    completedLessonIds.push(lessonId);
  }

  return addXP(userId, xpEarned).then((progress) =>
    updateProgress(userId, {
      completedLessonIds,
      lastActivity: new Date(),
    })
  );
}

export async function completeScenario(userId: string, scenarioId: string, xpEarned: number): Promise<Progress> {
  const current = await getProgress(userId);
  const completedScenarioIds = current?.completedScenarioIds || [];
  
  if (!completedScenarioIds.includes(scenarioId)) {
    completedScenarioIds.push(scenarioId);
  }

  return addXP(userId, xpEarned).then((progress) =>
    updateProgress(userId, {
      completedScenarioIds,
      lastActivity: new Date(),
    })
  );
}

