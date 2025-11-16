import { createContext, useContext, useState, ReactNode } from 'react';
import { Progress } from '../types/progress.js';

interface ProgressContextType {
  progress: Progress | null;
  setProgress: (progress: Progress | null) => void;
  updateProgress: (updates: Partial<Progress>) => void;
  addXP: (amount: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress | null>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem('empowermint_progress');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const updateProgressState = (newProgress: Progress | null) => {
    setProgress(newProgress);
    if (newProgress) {
      localStorage.setItem('empowermint_progress', JSON.stringify(newProgress));
    } else {
      localStorage.removeItem('empowermint_progress');
    }
  };

  const updateProgress = (updates: Partial<Progress>) => {
    if (progress) {
      const updated = { ...progress, ...updates };
      // Recalculate level based on XP
      updated.level = Math.floor(updated.xp / 100);
      updateProgressState(updated);
    }
  };

  const addXP = (amount: number) => {
    if (progress) {
      const newXP = progress.xp + amount;
      const newLevel = Math.floor(newXP / 100);
      updateProgressState({
        ...progress,
        xp: newXP,
        level: newLevel,
        lastActivity: new Date().toISOString(),
      });
    } else {
      // Create initial progress if it doesn't exist
      updateProgressState({
        userId: 'temp-user-id',
        xp: amount,
        level: Math.floor(amount / 100),
        completedLessonIds: [],
        completedScenarioIds: [],
        financialHealthScore: 50,
        lastActivity: new Date().toISOString(),
      });
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        setProgress: updateProgressState,
        updateProgress,
        addXP,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

