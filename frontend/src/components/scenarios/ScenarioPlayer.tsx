import { useState } from 'react';
import { Scenario, ScenarioState, DecisionPoint, Choice } from '../../types/scenario.js';
import Button from '../ui/Button.js';
import Card from '../ui/Card.js';

interface ScenarioPlayerProps {
  scenario: Scenario;
  onDecision: (decisionPointId: string, choiceId: string, currentState: ScenarioState) => Promise<{
    newState: ScenarioState;
    aiReflection: string;
    xpEarned: number;
  }>;
  onComplete: (finalState: ScenarioState) => Promise<{ xpEarned: number }>;
  loading?: boolean;
}

export default function ScenarioPlayer({
  scenario,
  onDecision,
  onComplete,
  loading = false,
}: ScenarioPlayerProps) {
  const [currentState, setCurrentState] = useState<ScenarioState>(scenario.initialState);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [aiReflection, setAiReflection] = useState<string>('');
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const currentDecisionPoint = scenario.decisionPoints[currentDecisionIndex];
  const isLastDecision = currentDecisionIndex === scenario.decisionPoints.length - 1;

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
  };

  const handleSubmitDecision = async () => {
    if (!selectedChoice || !currentDecisionPoint) return;

    try {
      const result = await onDecision(
        currentDecisionPoint.id,
        selectedChoice,
        currentState
      );

      setCurrentState(result.newState);
      setAiReflection(result.aiReflection);
      setTotalXPEarned(totalXPEarned + result.xpEarned);
      setShowReflection(true);
    } catch (error) {
      console.error('Failed to submit decision:', error);
    }
  };

  const handleContinueAfterReflection = () => {
    setShowReflection(false);
    setSelectedChoice(null);

    if (isLastDecision) {
      handleCompleteScenario();
    } else {
      setCurrentDecisionIndex(currentDecisionIndex + 1);
    }
  };

  const handleCompleteScenario = async () => {
    try {
      const result = await onComplete(currentState);
      setTotalXPEarned(totalXPEarned + result.xpEarned);
      setScenarioComplete(true);
    } catch (error) {
      console.error('Failed to complete scenario:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (scenarioComplete) {
    return (
      <div className="max-w-3xl mx-auto text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Scenario Complete!</h2>
        <p className="text-lg text-gray-600 mb-4">
          You earned <span className="font-bold text-primary-600">{totalXPEarned} XP</span>
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-left">
          <h3 className="font-semibold mb-3">Final Financial State:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Savings:</span>
              <span className="ml-2 font-semibold text-green-600">
                {formatCurrency(currentState.savings)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Debt:</span>
              <span className="ml-2 font-semibold text-red-600">
                {formatCurrency(currentState.debt)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Monthly Income:</span>
              <span className="ml-2 font-semibold">
                {formatCurrency(currentState.monthlyIncome)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Monthly Expenses:</span>
              <span className="ml-2 font-semibold">
                {formatCurrency(currentState.monthlyExpenses)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Stress Level:</span>
              <span className="ml-2 font-semibold">{currentState.stressLevel}/10</span>
            </div>
            <div>
              <span className="text-gray-600">Financial Knowledge:</span>
              <span className="ml-2 font-semibold">{currentState.financialKnowledge}/10</span>
            </div>
          </div>
        </div>
        <Button onClick={() => window.history.back()}>Continue Learning</Button>
      </div>
    );
  }

  if (showReflection) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Reflection</h2>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed">{aiReflection}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Your Updated Financial State:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Savings:</span>
                <span
                  className={`ml-2 font-semibold ${
                    currentState.savings >= scenario.initialState.savings
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(currentState.savings)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Debt:</span>
                <span
                  className={`ml-2 font-semibold ${
                    currentState.debt <= scenario.initialState.debt
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(currentState.debt)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Monthly Expenses:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(currentState.monthlyExpenses)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stress Level:</span>
                <span className="ml-2 font-semibold">{currentState.stressLevel}/10</span>
              </div>
            </div>
          </div>

          <Button onClick={handleContinueAfterReflection} className="w-full">
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded capitalize">
            {scenario.category}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {scenario.difficultyLevel === 1
              ? 'Beginner'
              : scenario.difficultyLevel === 2
              ? 'Intermediate'
              : 'Advanced'}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-4">{scenario.title}</h1>
        <p className="text-gray-700 leading-relaxed mb-6">{scenario.description}</p>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Decision {currentDecisionIndex + 1} of {scenario.decisionPoints.length}
            </span>
            <span className="text-sm font-semibold text-primary-600">
              +{totalXPEarned} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentDecisionIndex + 1) / scenario.decisionPoints.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Current Financial State */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Your Current Financial State:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Savings:</span>
            <span className="ml-2 font-semibold text-green-600">
              {formatCurrency(currentState.savings)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Debt:</span>
            <span className="ml-2 font-semibold text-red-600">
              {formatCurrency(currentState.debt)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Monthly Income:</span>
            <span className="ml-2 font-semibold">
              {formatCurrency(currentState.monthlyIncome)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Monthly Expenses:</span>
            <span className="ml-2 font-semibold">
              {formatCurrency(currentState.monthlyExpenses)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Stress Level:</span>
            <span className="ml-2 font-semibold">{currentState.stressLevel}/10</span>
          </div>
          <div>
            <span className="text-gray-600">Knowledge:</span>
            <span className="ml-2 font-semibold">{currentState.financialKnowledge}/10</span>
          </div>
        </div>
      </Card>

      {/* Decision Point */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">{currentDecisionPoint.prompt}</h2>
        <div className="space-y-3">
          {currentDecisionPoint.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoiceSelect(choice.id)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                selectedChoice === choice.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{choice.text}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitDecision}
            disabled={!selectedChoice || loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Make Decision'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

