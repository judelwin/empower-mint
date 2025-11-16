import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import { useProgress } from '../context/ProgressContext.js';
import { useUser } from '../context/UserContext.js';
import LessonViewer from '../components/lessons/LessonViewer.js';
import { Lesson } from '../types/lesson.js';

export default function LessonDetail() {
  const { id } = useParams();
  const { addXP, updateProgress } = useProgress();
  const { userProfile } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { loading, error, execute } = useApi();
  const [completing, setCompleting] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    execute(async () => {
      const response = await api.getLessonById(id);
      setLesson(response.lesson);
      return response;
    }).catch(() => {
      // Error handled by useApi hook
    });
  }, [id]);

  const handleComplete = async (score: number, answers: Array<{ questionId: string; selectedAnswer: number }>) => {
    if (!id) return;

    setCompleting(true);
    setCompletionError(null);
    try {
      const response = await api.completeLesson(id, {
        score,
        answers,
        userId: userProfile?.id,
      });
      addXP(response.xpEarned);
      updateProgress(response.progress);
    } catch (err: any) {
      console.error('Failed to complete lesson:', err);
      const errorMessage = err?.error?.message || 'Failed to complete lesson. Please try again.';
      setCompletionError(errorMessage);
    } finally {
      setCompleting(false);
    }
  };

  const handleExplain = async (concept: string, context?: string) => {
    setExplaining(true);
    try {
      const response = await api.explainConcept({
        concept,
        context,
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
      setExplaining(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error.error.message || 'Failed to load lesson'}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-600">Lesson not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {completionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {completionError}
        </div>
      )}
      <LessonViewer
        lesson={lesson}
        onComplete={handleComplete}
        onExplain={handleExplain}
        loading={completing || explaining}
      />
    </div>
  );
}

