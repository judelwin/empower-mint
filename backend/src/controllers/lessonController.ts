import { Request, Response } from 'express';
import { Lesson, LessonCategory, DifficultyLevel } from '../types/lesson.js';
import lessonsData from '../data/lessons.json' assert { type: 'json' };
import * as progressService from '../services/progressService.js';

const lessons: Lesson[] = lessonsData as Lesson[];

export const getLessons = (req: Request, res: Response): void => {
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

export const getLessonById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Lesson with id ${id} not found`,
        },
      });
      return;
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

export const completeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const lesson = lessons.find(l => l.id === id);
    if (!lesson) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Lesson with id ${id} not found`,
        },
      });
      return;
    }

    // Calculate XP based on score (out of 100)
    // Perfect score (100) = 50 XP, decreasing proportionally
    const xpEarned = Math.round((score / 100) * 50);

    // Get user ID from session or request (for now, using temp ID if not provided)
    // TODO: Implement proper session/auth in production
    const userId = req.body.userId || req.headers['x-user-id'] || 'temp-user-id';

    // Update progress in database
    await progressService.completeLesson(userId, id, xpEarned);
    
    // Update financial health score based on quiz performance
    const financialHealthScore = Math.min(100, Math.round((score / 100) * 100));
    const updatedProgress = await progressService.updateProgress(userId, {
      financialHealthScore,
    });

    res.json({
      xpEarned,
      progress: updatedProgress,
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

