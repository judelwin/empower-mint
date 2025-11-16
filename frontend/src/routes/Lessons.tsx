import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficultyLevel: number;
  estimatedMinutes: number;
}

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filter, setFilter] = useState<{ category?: string; difficulty?: number }>({});
  const { loading, error, execute } = useApi();

  useEffect(() => {
    execute(async () => {
      const response = await api.getLessons(filter);
      setLessons(response.lessons);
      return response;
    }).catch(() => {
      // Error handled by useApi hook
    });
  }, [filter]);

  const categories = ['budgeting', 'investing', 'debt', 'saving', 'retirement'];
  const difficulties = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lessons</h1>

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
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
          {error.error.message || 'Failed to load lessons'}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      )}

      {!loading && !error && lessons.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No lessons found. Try adjusting your filters.
        </div>
      )}

      {!loading && !error && lessons.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">
                  {lesson.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {lesson.difficultyLevel === 1
                    ? 'Beginner'
                    : lesson.difficultyLevel === 2
                    ? 'Intermediate'
                    : 'Advanced'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600 mb-4">~{lesson.estimatedMinutes} minutes</p>
              <Link to={`/lessons/${lesson.id}`}>
                <Button variant="primary" className="w-full">
                  Start Lesson
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
