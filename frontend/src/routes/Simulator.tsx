import { useState } from 'react';
import { api } from '../services/api.js';
import { useUser } from '../context/UserContext.js';
import WealthSimulator from '../components/simulator/WealthSimulator.js';

export default function Simulator() {
  const { userProfile } = useUser();
  const [loading, setLoading] = useState(false);

  const handleExplain = async (params: {
    initialAmount: number;
    monthlyContribution: number;
    annualReturn: number;
    years: number;
  }) => {
    setLoading(true);
    try {
      const response = await api.simulateWealth({
        ...params,
        userProfile: userProfile ? {
          experienceLevel: userProfile.experienceLevel,
          learningStyle: userProfile.learningStyle,
        } : undefined,
      });
      return response.explanation;
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <WealthSimulator onExplain={handleExplain} loading={loading} />
    </div>
  );
}

