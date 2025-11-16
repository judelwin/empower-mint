import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.js';
import { useProgress } from '../context/ProgressContext.js';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import XPBadge from '../components/ui/XPBadge.js';
import ProgressBar from '../components/ui/ProgressBar.js';

export default function Dashboard() {
  const { userProfile } = useUser();
  const { progress } = useProgress();
  const [recommendedLessons, setRecommendedLessons] = useState<any[]>([]);
  const [recommendedScenarios, setRecommendedScenarios] = useState<any[]>([]);
  const { loading, error, execute } = useApi();

  useEffect(() => {
    if (!userProfile) return;

    // Load recommended lessons and scenarios
    execute(async () => {
      const lessonsResponse = await api.getLessons({
        difficulty: userProfile.experienceLevel === 'beginner' ? 1 : undefined,
      });
      const scenariosResponse = await api.getScenarios({
        difficulty: userProfile.experienceLevel === 'beginner' ? 1 : undefined,
      });

      // Get first 3 lessons and scenarios
      setRecommendedLessons(lessonsResponse.lessons.slice(0, 3));
      setRecommendedScenarios(scenariosResponse.scenarios.slice(0, 2));
      return { lessons: lessonsResponse.lessons, scenarios: scenariosResponse.scenarios };
    }).catch(() => {
      // Error handled by useApi hook
    });
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to EmpowerMint!</h1>
          <p className="text-gray-600 mb-6">
            Get started by completing the onboarding questionnaire.
          </p>
          <Link to="/onboarding">
            <Button>Start Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentXP = progress?.xp || 0;
  const currentLevel = progress?.level || 1;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXP % 100;
  const completedLessons = progress?.completedLessonIds.length || 0;
  const completedScenarios = progress?.completedScenarioIds.length || 0;
  const financialHealthScore = progress?.financialHealthScore || 50;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userProfile.experienceLevel === 'beginner' ? 'beginner' : 'learner'}!
        </h1>
        <p className="text-gray-600">
          Continue your financial literacy journey
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Progress</h2>
            <XPBadge xp={currentXP} level={currentLevel} size="md" />
          </div>
          <ProgressBar
            value={xpInCurrentLevel}
            max={100}
            label={`Level ${currentLevel} → ${currentLevel + 1}`}
            showValue={false}
            className="mb-2"
          />
          <div className="text-sm text-gray-600">
            {xpInCurrentLevel} / {100} XP to next level
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Completed</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lessons</span>
              <span className="text-xl font-bold text-primary-600">{completedLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Scenarios</span>
              <span className="text-xl font-bold text-secondary-600">{completedScenarios}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Financial Health</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {financialHealthScore}
            </div>
            <ProgressBar
              value={financialHealthScore}
              max={100}
              color="success"
              className="mb-2"
            />
            <div className="text-sm text-gray-600">Based on your decisions</div>
          </div>
        </Card>
      </div>

      {/* Recommended Content */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recommended Lessons */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended Lessons</h2>
            <Link to="/lessons">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {loading && (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4 w-8 h-8"></div>
              <p className="text-gray-600 text-sm">Loading recommendations...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
              {error.error.message || 'Failed to load recommendations'}
            </div>
          )}
          {!loading && !error && recommendedLessons.length === 0 && (
            <div className="text-center py-8 text-gray-600">No lessons available</div>
          )}
          {!loading && !error && recommendedLessons.length > 0 && (
            <div className="space-y-4">
              {recommendedLessons.map((lesson) => (
                <Card key={lesson.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">
                      {lesson.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      ~{lesson.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
                  <Link to={`/lessons/${lesson.id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Start Lesson
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended Scenarios</h2>
            <Link to="/scenarios">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {loading && (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4 w-8 h-8"></div>
              <p className="text-gray-600 text-sm">Loading recommendations...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
              {error.error.message || 'Failed to load recommendations'}
            </div>
          )}
          {!loading && !error && recommendedScenarios.length === 0 && (
            <div className="text-center py-8 text-gray-600">No scenarios available</div>
          )}
          {!loading && !error && recommendedScenarios.length > 0 && (
            <div className="space-y-4">
              {recommendedScenarios.map((scenario) => (
                <Card key={scenario.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs capitalize">
                      {scenario.category === 'first-job' ? 'First Job' : scenario.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{scenario.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {scenario.description}
                  </p>
                  <Link to={`/scenarios/${scenario.id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Start Scenario
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/lessons">
            <Button variant="outline" className="w-full">
              Browse Lessons
            </Button>
          </Link>
          <Link to="/scenarios">
            <Button variant="outline" className="w-full">
              Try Scenarios
            </Button>
          </Link>
          <Link to="/simulator">
            <Button variant="outline" className="w-full">
              Wealth Simulator
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
