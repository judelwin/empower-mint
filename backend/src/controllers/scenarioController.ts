import { Request, Response } from 'express';
import { Scenario, ScenarioCategory, DifficultyLevel, ScenarioState, ScenarioDecisionRequest } from '../types/scenario.js';
import scenariosData from '../data/scenarios.json' assert { type: 'json' };

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

    // TODO: Update user progress in database (will be implemented in Batch 17)
    const progress = {
      userId: 'temp-user-id', // Will be replaced with actual user ID
      xp: xpEarned,
      level: Math.floor(xpEarned / 100),
      completedLessonIds: [],
      completedScenarioIds: [],
      financialHealthScore: Math.max(0, Math.min(100, 50 + newState.financialKnowledge * 5)),
      lastActivity: new Date(),
    };

    res.json({
      newState,
      aiReflection,
      xpEarned,
      progress,
    });
  } catch (error) {
    console.error('Error making decision:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process decision',
      },
    });
  }
};

export const completeScenario = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalState } = req.body;

    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Scenario with id ${id} not found`,
        },
      });
    }

    // Award bonus XP for completing the scenario
    const xpEarned = 100;
    const financialHealthScore = Math.max(0, Math.min(100, 50 + finalState.financialKnowledge * 5));

    // TODO: Update user progress in database (will be implemented in Batch 17)
    const progress = {
      userId: 'temp-user-id',
      xp: xpEarned,
      level: Math.floor(xpEarned / 100),
      completedLessonIds: [],
      completedScenarioIds: [id],
      financialHealthScore,
      lastActivity: new Date(),
    };

    res.json({
      xpEarned,
      progress,
    });
  } catch (error) {
    console.error('Error completing scenario:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete scenario',
      },
    });
  }
};

