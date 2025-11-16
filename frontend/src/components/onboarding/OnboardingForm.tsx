import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.js';
import { useProgress } from '../../context/ProgressContext.js';
import { api } from '../../services/api.js';
import { ExperienceLevel, LearningStyle, OnboardingRequest } from '../../types/user.js';

const FINANCIAL_GOALS = [
  { id: 'saving', label: 'Building an emergency fund' },
  { id: 'investing', label: 'Learning to invest' },
  { id: 'debt-payoff', label: 'Paying off debt' },
  { id: 'retirement', label: 'Planning for retirement' },
  { id: 'budgeting', label: 'Better budgeting' },
];

export default function OnboardingForm() {
  const navigate = useNavigate();
  const { setUserProfile } = useUser();
  const { setProgress } = useProgress();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<OnboardingRequest>({
    experienceLevel: 'beginner' as ExperienceLevel,
    financialGoals: [],
    riskComfort: 5,
    learningStyle: 'interactive' as LearningStyle,
  });

  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    setFormData({ ...formData, experienceLevel: level });
    setStep(2);
  };

  const handleGoalToggle = (goalId: string) => {
    const goals = formData.financialGoals.includes(goalId)
      ? formData.financialGoals.filter(g => g !== goalId)
      : [...formData.financialGoals, goalId];
    setFormData({ ...formData, financialGoals: goals });
  };

  const handleRiskComfortChange = (value: number) => {
    setFormData({ ...formData, riskComfort: value });
  };

  const handleLearningStyleChange = (style: LearningStyle) => {
    setFormData({ ...formData, learningStyle: style });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.financialGoals.length === 0) {
      setError('Please select at least one financial goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.completeOnboarding({
        experienceLevel: formData.experienceLevel,
        financialGoals: formData.financialGoals,
        riskComfort: formData.riskComfort,
        learningStyle: formData.learningStyle,
      });

      // Convert Date to ISO string for frontend
      const userProfile = {
        ...response.userProfile,
        createdAt: response.userProfile.createdAt instanceof Date
          ? response.userProfile.createdAt.toISOString()
          : response.userProfile.createdAt,
      };

      setUserProfile(userProfile);

      // Initialize progress
      setProgress({
        userId: userProfile.id,
        xp: 0,
        level: 1,
        completedLessonIds: [],
        completedScenarioIds: [],
        financialHealthScore: 50,
        lastActivity: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to EmpowerMint!</h1>
      <p className="text-gray-600 mb-8">
        Let's personalize your learning experience. This will only take a few minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Experience Level */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">What's your experience level with personal finance?</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleExperienceLevelChange('beginner')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.experienceLevel === 'beginner'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Beginner</div>
                <div className="text-sm text-gray-600">I'm new to personal finance and investing</div>
              </button>
              <button
                type="button"
                onClick={() => handleExperienceLevelChange('intermediate')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.experienceLevel === 'intermediate'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Intermediate</div>
                <div className="text-sm text-gray-600">I know the basics and want to learn more</div>
              </button>
              <button
                type="button"
                onClick={() => handleExperienceLevelChange('advanced')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.experienceLevel === 'advanced'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Advanced</div>
                <div className="text-sm text-gray-600">I'm experienced and want to deepen my knowledge</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Financial Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">What are your financial goals? (Select all that apply)</h2>
            <div className="space-y-3">
              {FINANCIAL_GOALS.map((goal) => (
                <label
                  key={goal.id}
                  className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors hover:border-gray-300 focus-ring"
                  style={{
                    borderColor: formData.financialGoals.includes(goal.id) ? '#0284c7' : '#e5e7eb',
                    backgroundColor: formData.financialGoals.includes(goal.id) ? '#f0f9ff' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.financialGoals.includes(goal.id)}
                    onChange={() => handleGoalToggle(goal.id)}
                    className="mr-3 w-5 h-5 text-primary-600 focus-ring"
                  />
                  <span className="font-medium">{goal.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus-ring"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={formData.financialGoals.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Risk Comfort */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              How comfortable are you with financial risk? (1 = Very cautious, 10 = Very comfortable)
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-20">Very Cautious</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.riskComfort}
                  onChange={(e) => handleRiskComfortChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-24 text-right">Very Comfortable</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary-600">{formData.riskComfort}</span>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.riskComfort <= 3 && 'Very conservative'}
                  {formData.riskComfort > 3 && formData.riskComfort <= 6 && 'Moderate'}
                  {formData.riskComfort > 6 && 'Aggressive'}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus-ring"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus-ring"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Learning Style */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">How do you prefer to learn?</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleLearningStyleChange('visual')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.learningStyle === 'visual'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Visual</div>
                <div className="text-sm text-gray-600">I learn best with charts, graphs, and visual aids</div>
              </button>
              <button
                type="button"
                onClick={() => handleLearningStyleChange('textual')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.learningStyle === 'textual'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Textual</div>
                <div className="text-sm text-gray-600">I prefer reading and written explanations</div>
              </button>
              <button
                type="button"
                onClick={() => handleLearningStyleChange('interactive')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-ring ${
                  formData.learningStyle === 'interactive'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Interactive</div>
                <div className="text-sm text-gray-600">I learn by doing - scenarios, simulations, and hands-on practice</div>
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus-ring"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {step === 4 && (
          <button
            type="submit"
            disabled={loading || formData.financialGoals.length === 0}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
          >
            {loading ? 'Setting up your profile...' : 'Complete Setup'}
          </button>
        )}
      </form>
    </div>
  );
}

