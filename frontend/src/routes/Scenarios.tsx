import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: number;
}

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filter, setFilter] = useState<{ category?: string; difficulty?: number }>({});
  const { loading, error, execute } = useApi();

  useEffect(() => {
    execute(async () => {
      const response = await api.getScenarios(filter);
      setScenarios(response.scenarios);
      return response;
    }).catch(() => {
      // Error handled by useApi hook
    });
  }, [filter]);

  const categories = ['first-job', 'rent', 'debt', 'market-crash', 'emergency'];
  const difficulties = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' },
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'first-job': 'First Job',
      'rent': 'Housing',
      'debt': 'Debt',
      'market-crash': 'Market',
      'emergency': 'Emergency',
    };
    return labels[category] || category;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Financial Scenarios</h1>
      <p className="text-gray-600 mb-6">
        Make decisions in realistic financial situations and see how they impact your financial health.
      </p>

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus-ring"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={filter.difficulty || ''}
            onChange={(e) =>
              setFilter({ ...filter, difficulty: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus-ring"
          >
            <option value="">All Levels</option>
            {difficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error.error.message || 'Failed to load scenarios'}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      )}

      {!loading && !error && scenarios.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No scenarios found. Try adjusting your filters.
        </div>
      )}

      {!loading && !error && scenarios.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                  {getCategoryLabel(scenario.category)}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {scenario.difficultyLevel === 1
                    ? 'Beginner'
                    : scenario.difficultyLevel === 2
                    ? 'Intermediate'
                    : 'Advanced'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{scenario.description}</p>
              <Link to={`/scenarios/${scenario.id}`}>
                <Button variant="primary" className="w-full">
                  Start Scenario
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
