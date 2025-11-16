import { Request, Response } from 'express';
import { OnboardingRequest, OnboardingResponse, UserProfile } from '../types/user.js';
import { v4 as uuidv4 } from 'uuid';
import * as userService from '../services/userService.js';
import * as progressService from '../services/progressService.js';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const { experienceLevel, financialGoals, riskComfort, learningStyle }: OnboardingRequest = req.body;

    // Validation
    if (!experienceLevel || !financialGoals || riskComfort === undefined || !learningStyle) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: experienceLevel, financialGoals, riskComfort, learningStyle',
        },
      });
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid experienceLevel. Must be beginner, intermediate, or advanced',
        },
      });
    }

    if (!['visual', 'textual', 'interactive'].includes(learningStyle)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid learningStyle. Must be visual, textual, or interactive',
        },
      });
    }

    if (riskComfort < 1 || riskComfort > 10) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'riskComfort must be between 1 and 10',
        },
      });
    }

    // Create user profile
    const userProfile: UserProfile = {
      id: uuidv4(),
      createdAt: new Date(),
      experienceLevel,
      financialGoals: Array.isArray(financialGoals) ? financialGoals : [financialGoals],
      riskComfort,
      learningStyle,
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        colorblindMode: 'none',
      },
    };

    // Save user to database
    await userService.createUser(userProfile);

    // Initialize progress
    await progressService.saveProgress({
      userId: userProfile.id,
      xp: 0,
      level: 1,
      completedLessonIds: [],
      completedScenarioIds: [],
      financialHealthScore: 50,
      lastActivity: new Date(),
    });

    // Recommend lessons and scenarios based on experience level
    const recommendedLessons: string[] = [];
    const recommendedScenarios: string[] = [];

    if (experienceLevel === 'beginner') {
      recommendedLessons.push('lesson-1-compound-interest', 'lesson-2-budgeting-basics', 'lesson-4-emergency-fund');
      recommendedScenarios.push('scenario-1-first-job', 'scenario-2-apartment-rent');
    } else if (experienceLevel === 'intermediate') {
      recommendedLessons.push('lesson-3-debt-management', 'lesson-5-investing-basics');
      recommendedScenarios.push('scenario-3-market-dip');
    } else {
      // Advanced users get all content
      recommendedLessons.push('lesson-1-compound-interest', 'lesson-2-budgeting-basics', 'lesson-3-debt-management', 'lesson-4-emergency-fund', 'lesson-5-investing-basics');
      recommendedScenarios.push('scenario-1-first-job', 'scenario-2-apartment-rent', 'scenario-3-market-dip');
    }

    const response: OnboardingResponse = {
      userProfile,
      recommendedLessons,
      recommendedScenarios,
    };

    res.json(response);
    return;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete onboarding',
      },
    });
    return;
  }
};

