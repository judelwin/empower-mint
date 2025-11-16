import { useState } from 'react';
import { Lesson } from '../../types/lesson.js';
import Quiz from './Quiz.js';
import Button from '../ui/Button.js';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: (score: number, answers: Array<{ questionId: string; selectedAnswer: number }>) => void;
  loading?: boolean;
}

export default function LessonViewer({ lesson, onComplete, loading }: LessonViewerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const sections = lesson.content.sections;
  const hasQuiz = lesson.quizQuestions && lesson.quizQuestions.length > 0;

  const handleQuizComplete = (score: number, answers: Array<{ questionId: string; selectedAnswer: number }>) => {
    setQuizCompleted(true);
    onComplete(score, answers);
  };

  if (showQuiz && hasQuiz) {
    return (
      <Quiz
        questions={lesson.quizQuestions!}
        onComplete={handleQuizComplete}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  if (quizCompleted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Great job!</h2>
        <p className="text-gray-600 mb-6">You've completed the lesson and quiz.</p>
        <Button onClick={() => window.history.back()}>Continue Learning</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded capitalize">
            {lesson.category}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {lesson.difficultyLevel === 1 ? 'Beginner' : lesson.difficultyLevel === 2 ? 'Intermediate' : 'Advanced'}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
            ~{lesson.estimatedMinutes} min
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      </div>

      <div className="space-y-6 mb-8">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`prose prose-lg max-w-none ${
              section.type === 'text' ? 'text-gray-700 leading-relaxed' : ''
            }`}
          >
            {section.type === 'text' && (
              <p className="whitespace-pre-line">{section.content}</p>
            )}
            {section.type === 'image' && (
              <div className="my-4">
                <img src={section.content} alt={`Lesson image ${index + 1}`} className="rounded-lg" />
              </div>
            )}
            {section.type === 'interactive' && (
              <div className="my-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {hasQuiz && (
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={() => setShowQuiz(true)} disabled={loading}>
            Take Quiz
          </Button>
        </div>
      )}

      {!hasQuiz && (
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={() => onComplete(100, [])} disabled={loading}>
            Mark Complete
          </Button>
        </div>
      )}
    </div>
  );
}

