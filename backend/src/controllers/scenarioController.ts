import { Request, Response } from 'express';
import { Scenario, ScenarioCategory, DifficultyLevel, ScenarioState, ScenarioDecisionRequest } from '../types/scenario.js';
import scenariosData from '../data/scenarios.json' assert { type: 'json' };
import * as progressService from '../services/progressService.js';

const scenarios: Scenario[] = scenariosData as Scenario[];

export const getScenarios = (req: Request, res: Response) => {
  try {
    const category = req.query.category as ScenarioCategory | undefined;
    const difficulty = req.query.difficulty 
      ? parseInt(req.query.difficulty as string) as DifficultyLevel 
      : undefined;

    let filteredScenarios = [...scenarios];

    if (category) {
      filteredScenarios = filteredScenarios.filter(scenario => scenario.category === category);
    }

    if (difficulty) {
      filteredScenarios = filteredScenarios.filter(scenario => scenario.difficultyLevel === difficulty);
    }

    res.json({ scenarios: filteredScenarios });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch scenarios',
      },
    });
  }
};

export const getScenarioById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scenario = scenarios.find(s => s.id === id);

    if (!scenario) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Scenario with id ${id} not found`,
        },
      });
    }

    res.json({ scenario });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch scenario',
      },
    });
  }
};

export const makeDecision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decisionPointId, choiceId, currentState }: ScenarioDecisionRequest = req.body;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Scenario ID is required',
        },
      });
    }

    if (!decisionPointId || typeof decisionPointId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'decisionPointId is required',
        },
      });
    }

    if (!choiceId || typeof choiceId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'choiceId is required',
        },
      });
    }

    if (!currentState || typeof currentState !== 'object') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'currentState is required and must be an object',
        },
      });
    }

    // Validate currentState structure
    const requiredStateFields = ['savings', 'debt', 'monthlyIncome', 'monthlyExpenses', 'stressLevel', 'financialKnowledge'];
    for (const field of requiredStateFields) {
      if (currentState[field] === undefined || typeof currentState[field] !== 'number') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: `currentState.${field} is required and must be a number`,
          },
        });
      }
    }

    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Scenario with id ${id} not found`,
        },
      });
    }

    const decisionPoint = scenario.decisionPoints.find(dp => dp.id === decisionPointId);
    if (!decisionPoint) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Decision point with id ${decisionPointId} not found`,
        },
      });
    }

    const choice = decisionPoint.choices.find(c => c.id === choiceId);
    if (!choice) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Choice with id ${choiceId} not found`,
        },
      });
    }

    // Calculate new state by applying both short-term and long-term impacts
    const newState: ScenarioState = {
      savings: Math.max(0, currentState.savings + choice.shortTermImpact.savingsChange + choice.longTermImpact.savingsChange),
      debt: Math.max(0, currentState.debt + choice.shortTermImpact.debtChange + choice.longTermImpact.debtChange),
      monthlyIncome: currentState.monthlyIncome,
      monthlyExpenses: Math.max(0, currentState.monthlyExpenses + choice.shortTermImpact.expenseChange + choice.longTermImpact.expenseChange),
      stressLevel: Math.max(1, Math.min(10, currentState.stressLevel + choice.shortTermImpact.stressChange + choice.longTermImpact.stressChange)),
      financialKnowledge: Math.max(1, Math.min(10, currentState.financialKnowledge + choice.shortTermImpact.knowledgeChange + choice.longTermImpact.knowledgeChange)),
    };

    // Award XP based on decision quality (simplified - better knowledge gain = more XP)
    const xpEarned = Math.max(10, Math.min(50, newState.financialKnowledge - currentState.financialKnowledge + 20));

    // Generate AI reflection using Gemini (fallback if not available)
    let aiReflection = `You chose: ${choice.text}. This decision will have both short-term and long-term impacts on your financial situation.`;
    
    try {
      // Try to get AI reflection if Gemini is configured
      const { reflectOnScenarioDecision } = await import('../services/geminiService.js');
      const stateChange = {
        savingsChange: choice.shortTermImpact.savingsChange + choice.longTermImpact.savingsChange,
        debtChange: choice.shortTermImpact.debtChange + choice.longTermImpact.debtChange,
        stressChange: choice.shortTermImpact.stressChange + choice.longTermImpact.stressChange,
        knowledgeChange: choice.shortTermImpact.knowledgeChange + choice.longTermImpact.knowledgeChange,
      };
      aiReflection = await reflectOnScenarioDecision({
        scenarioTitle: scenario.title,
        decisionText: decisionPoint.prompt,
        choiceText: choice.text,
        stateChange,
      });
    } catch (error) {
      // Fallback to simple message if Gemini fails
      console.log('Using fallback reflection (Gemini may not be configured)');
    }

    // Get user ID from session or request (for now, using temp ID if not provided)
    const userId = req.body.userId || req.headers['x-user-id'] || 'temp-user-id';
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID is required',
        },
      });
    }

    try {
      // Update progress in database
      const financialHealthScore = Math.max(0, Math.min(100, 50 + newState.financialKnowledge * 5));
      const progress = await progressService.addXP(userId, xpEarned);
      const updatedProgress = await progressService.updateProgress(userId, {
        financialHealthScore,
      });

      res.json({
        newState,
        aiReflection,
        xpEarned,
        progress: updatedProgress,
      });
    } catch (dbError: any) {
      console.error('Database error making decision:', dbError);
      // Still return the decision result even if progress save fails
      res.json({
        newState,
        aiReflection,
        xpEarned,
        progress: null, // Indicate progress update failed
        warning: 'Decision processed but progress was not saved. Please try again.',
      });
    }
  } catch (error: any) {
    console.error('Error making decision:', error);
    const errorMessage = error?.message || 'Failed to process decision';
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
      },
    });
  }
};

export const completeScenario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalState } = req.body;

    // Validate scenario ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Scenario ID is required',
        },
      });
    }

    // Validate finalState
    if (!finalState || typeof finalState !== 'object') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'finalState is required and must be an object',
        },
      });
    }

    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Scenario with id ${id} not found`,
        },
      });
    }

    // Validate finalState structure
    if (finalState.financialKnowledge === undefined || typeof finalState.financialKnowledge !== 'number') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'finalState.financialKnowledge is required and must be a number',
        },
      });
    }

    // Award bonus XP for completing the scenario
    const xpEarned = 100;
    const financialHealthScore = Math.max(0, Math.min(100, 50 + finalState.financialKnowledge * 5));

    // Get user ID from session or request (for now, using temp ID if not provided)
    const userId = req.body.userId || req.headers['x-user-id'] || 'temp-user-id';
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID is required',
        },
      });
    }

    try {
      // Update progress in database
      const progress = await progressService.completeScenario(userId, id, xpEarned);
      const updatedProgress = await progressService.updateProgress(userId, {
        financialHealthScore,
      });

      res.json({
        xpEarned,
        progress: updatedProgress,
      });
    } catch (dbError: any) {
      console.error('Database error completing scenario:', dbError);
      res.status(500).json({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to save progress. Please try again.',
        },
      });
    }
  } catch (error: any) {
    console.error('Error completing scenario:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to complete scenario',
      },
    });
  }
};

