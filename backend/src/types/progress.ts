export interface Progress {
  userId: string;
  xp: number;
  level: number; // Derived from XP (e.g., level = floor(xp / 100))
  completedLessonIds: string[];
  completedScenarioIds: string[];
  financialHealthScore: number; // 0-100, derived from decisions/quiz performance
  lastActivity: Date;
}

