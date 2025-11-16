import { Request, Response } from 'express';
import { Lesson, LessonCategory, DifficultyLevel } from '../types/lesson.js';
import lessonsData from '../data/lessons.json' assert { type: 'json' };
import * as progressService from '../services/progressService.js';

const lessons: Lesson[] = lessonsData as Lesson[];

export const getLessons = (req: Request, res: Response): void => {
  try {
    const category = req.query.category as LessonCategory | undefined;
    let difficulty: DifficultyLevel | undefined;
    
    // Validate difficulty parameter
    if (req.query.difficulty) {
      const parsed = parseInt(req.query.difficulty as string);
      if (isNaN(parsed) || parsed < 1 || parsed > 3) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'difficulty must be a number between 1 and 3',
          },
        });
        return;
      }
      difficulty = parsed as DifficultyLevel;
    }

    let filteredLessons = [...lessons];

    if (category) {
      const validCategories: LessonCategory[] = ['budgeting', 'investing', 'debt', 'saving', 'retirement'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          },
        });
        return;
      }
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
    const { score, answers } = req.body;

    // Validate lesson ID
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lesson ID is required',
        },
      });
      return;
    }

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

    // Validate score
    if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'score must be a number between 0 and 100',
        },
      });
      return;
    }

    // Validate answers if provided
    if (answers !== undefined && (!Array.isArray(answers) || answers.length === 0)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'answers must be a non-empty array',
        },
      });
      return;
    }

    // Get user ID from session or request (for now, using temp ID if not provided)
    const userId = req.body.userId || req.headers['x-user-id'] || 'temp-user-id';
    
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID is required',
        },
      });
      return;
    }

    // Calculate XP based on score (out of 100)
    // Perfect score (100) = 50 XP, decreasing proportionally
    const xpEarned = Math.round((score / 100) * 50);

    try {
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
    } catch (dbError: any) {
      console.error('Database error completing lesson:', dbError);
      res.status(500).json({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to save progress. Please try again.',
        },
      });
    }
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

