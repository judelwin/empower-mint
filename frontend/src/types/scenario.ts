import { Progress } from './progress.js';

export type ScenarioCategory = 'first-job' | 'rent' | 'debt' | 'market-crash' | 'emergency';
export type DifficultyLevel = 1 | 2 | 3;

export interface ScenarioState {
  savings: number;
  debt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  stressLevel: number; // 1-10 scale
  financialKnowledge: number; // 1-10 scale
}

export interface ScenarioStateDelta {
  savingsChange: number;
  debtChange: number;
  expenseChange: number;
  stressChange: number;
  knowledgeChange: number;
}

export interface Choice {
  id: string;
  text: string;
  shortTermImpact: ScenarioStateDelta;
  longTermImpact: ScenarioStateDelta;
}

export interface DecisionPoint {
  id: string;
  prompt: string;
  choices: Choice[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficultyLevel: DifficultyLevel;
  decisionPoints: DecisionPoint[];
  initialState: ScenarioState;
}

export interface ScenarioDecisionRequest {
  decisionPointId: string;
  choiceId: string;
  currentState: ScenarioState;
}

export interface ScenarioDecisionResponse {
  newState: ScenarioState;
  aiReflection: string;
  xpEarned: number;
  progress: Progress;
}

export interface ScenarioCompletionRequest {
  finalState: ScenarioState;
}

