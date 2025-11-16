import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useProgress } from '../context/ProgressContext.js';
import ScenarioPlayerComponent from '../components/scenarios/ScenarioPlayer.js';
import { Scenario, ScenarioState } from '../types/scenario.js';

export default function ScenarioPlayer() {
  const { id } = useParams();
  const { addXP, updateProgress } = useProgress();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const { loading, error, execute } = useApi();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;

    execute(async () => {
      const response = await api.getScenarioById(id);
      setScenario(response.scenario);
      return response;
    }).catch(() => {
      // Error handled by useApi hook
    });
  }, [id]);

  const handleDecision = async (
    decisionPointId: string,
    choiceId: string,
    currentState: ScenarioState
  ) => {
    if (!id) throw new Error('Scenario ID is required');

    setProcessing(true);
    try {
      const response = await api.makeDecision(id, { decisionPointId, choiceId, currentState });
      addXP(response.xpEarned);
      updateProgress(response.progress);
      return {
        newState: response.newState,
        aiReflection: response.aiReflection,
        xpEarned: response.xpEarned,
      };
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (finalState: ScenarioState) => {
    if (!id) throw new Error('Scenario ID is required');

    setProcessing(true);
    try {
      const response = await api.completeScenario(id, { finalState });
      addXP(response.xpEarned);
      updateProgress(response.progress);
      return { xpEarned: response.xpEarned };
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-600">Loading scenario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error.error.message || 'Failed to load scenario'}
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-600">Scenario not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ScenarioPlayerComponent
        scenario={scenario}
        onDecision={handleDecision}
        onComplete={handleComplete}
        loading={processing}
      />
    </div>
  );
}

