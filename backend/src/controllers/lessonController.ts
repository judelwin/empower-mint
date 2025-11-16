import { Request, Response } from 'express';
import { Lesson, LessonCategory, DifficultyLevel } from '../types/lesson.js';
import lessonsData from '../data/lessons.json' assert { type: 'json' };

const lessons: Lesson[] = lessonsData as Lesson[];

export const getLessons = (req: Request, res: Response) => {
  try {
    const category = req.query.category as LessonCategory | undefined;
    const difficulty = req.query.difficulty 
      ? parseInt(req.query.difficulty as string) as DifficultyLevel 
      : undefined;

    let filteredLessons = [...lessons];

    if (category) {
      filteredLessons = filteredLessons.filter(lesson => lesson.category === category);
    }

    if (difficulty) {
      filteredLessons = filteredLessons.filter(lesson => lesson.difficultyLevel === difficulty);
    }

    res.json({ lessons: filteredLessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lessons',
      },
    });
  }
};

export const getLessonById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Lesson with id ${id} not found`,
        },
      });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lesson',
      },
    });
  }
};

export const completeLesson = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, answers } = req.body;

    const lesson = lessons.find(l => l.id === id);
    if (!lesson) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Lesson with id ${id} not found`,
        },
      });
    }

    // Calculate XP based on score (out of 100)
    // Perfect score (100) = 50 XP, decreasing proportionally
    const xpEarned = Math.round((score / 100) * 50);

    // TODO: Update user progress in database (will be implemented in Batch 17)
    // For now, return mock progress
    const progress = {
      userId: 'temp-user-id', // Will be replaced with actual user ID
      xp: xpEarned,
      level: Math.floor(xpEarned / 100),
      completedLessonIds: [id],
      completedScenarioIds: [],
      financialHealthScore: Math.min(100, Math.round((score / 100) * 100)),
      lastActivity: new Date(),
    };

    res.json({
      xpEarned,
      progress,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete lesson',
      },
    });
  }
};

