import { Request, Response } from 'express';
import { AiExplainRequest, AiSimulateWealthRequest } from '../types/api.js';
import * as geminiService from '../services/geminiService.js';
import { ScenarioDecisionRequest } from '../types/scenario.js';
import scenariosData from '../data/scenarios.json' assert { type: 'json' };

export const explainConcept = async (req: Request, res: Response) => {
  try {
    const { concept, context, userProfile }: AiExplainRequest = req.body;

    if (!concept || typeof concept !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'concept is required and must be a string',
        },
      });
    }

    const explanation = await geminiService.explainConcept({
      concept,
      context,
      userProfile,
    });

    res.json({ explanation });
  } catch (error: any) {
    console.error('Error explaining concept:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate explanation',
      },
    });
  }
};

export const simulateWealth = async (req: Request, res: Response) => {
  try {
    const {
      initialAmount,
      monthlyContribution,
      annualReturn,
      years,
      userProfile,
    }: AiSimulateWealthRequest = req.body;

    // Validation
    if (
      initialAmount === undefined ||
      monthlyContribution === undefined ||
      annualReturn === undefined ||
      years === undefined
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'initialAmount, monthlyContribution, annualReturn, and years are required',
        },
      });
    }

    // Validate number types and ranges
    if (typeof initialAmount !== 'number' || initialAmount < 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'initialAmount must be a non-negative number',
        },
      });
    }

    if (typeof monthlyContribution !== 'number' || monthlyContribution < 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'monthlyContribution must be a non-negative number',
        },
      });
    }

    if (typeof annualReturn !== 'number' || annualReturn < 0 || annualReturn > 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'annualReturn must be a number between 0 and 100',
        },
      });
    }

    if (typeof years !== 'number' || years < 1 || years > 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'years must be a number between 1 and 100',
        },
      });
    }

    // Calculate wealth over time
    const dataPoints: Array<{ year: number; value: number }> = [];
    let currentValue = initialAmount;
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        for (let month = 0; month < 12; month++) {
          currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
        }
      }
      dataPoints.push({
        year,
        value: Math.round(currentValue),
      });
    }

    const finalValue = dataPoints[dataPoints.length - 1]?.value || 0;
    const totalContributions = initialAmount + monthlyContribution * 12 * years;
    const gains = finalValue - totalContributions;

    // Get AI explanation
    const explanation = await geminiService.explainWealthSimulation({
      initialAmount,
      monthlyContribution,
      annualReturn,
      years,
      finalValue,
      totalContributions,
      gains,
      userProfile,
    });

    res.json({
      dataPoints,
      explanation,
    });
  } catch (error: any) {
    console.error('Error simulating wealth:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to simulate wealth',
      },
    });
  }
};

export const reflectScenarioDecision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decisionPointId, choiceId, currentState }: ScenarioDecisionRequest = req.body;
    const userProfile = req.body.userProfile; // Optional user profile from request

    const scenarios = scenariosData as any[];
    const scenario = scenarios.find((s) => s.id === id);
    if (!scenario) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Scenario with id ${id} not found`,
        },
      });
    }

    const decisionPoint = scenario.decisionPoints.find((dp: any) => dp.id === decisionPointId);
    if (!decisionPoint) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Decision point with id ${decisionPointId} not found`,
        },
      });
    }

    const choice = decisionPoint.choices.find((c: any) => c.id === choiceId);
    if (!choice) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Choice with id ${choiceId} not found`,
        },
      });
    }

    // Calculate state change
    const stateChange = {
      savingsChange: choice.shortTermImpact.savingsChange + choice.longTermImpact.savingsChange,
      debtChange: choice.shortTermImpact.debtChange + choice.longTermImpact.debtChange,
      stressChange: choice.shortTermImpact.stressChange + choice.longTermImpact.stressChange,
      knowledgeChange: choice.shortTermImpact.knowledgeChange + choice.longTermImpact.knowledgeChange,
    };

    const reflection = await geminiService.reflectOnScenarioDecision({
      scenarioTitle: scenario.title,
      decisionText: decisionPoint.prompt,
      choiceText: choice.text,
      stateChange,
      userProfile,
    });

    res.json({ reflection });
  } catch (error: any) {
    console.error('Error reflecting on scenario decision:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate reflection',
      },
    });
  }
};

