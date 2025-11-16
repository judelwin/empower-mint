import { useState } from 'react';
import { QuizQuestion } from '../../types/lesson.js';
import Button from '../ui/Button.js';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: Array<{ questionId: string; selectedAnswer: number }>) => void;
  onBack?: () => void;
}

export default function Quiz({ questions, onComplete, onBack }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedAnswer: number }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, { questionId: question.id, selectedAnswer }];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate score
      const correctAnswers = newAnswers.filter(
        (ans) => {
          const q = questions.find((q) => q.id === ans.questionId);
          return q && q.correctAnswer === ans.selectedAnswer;
        }
      ).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      setShowResults(true);
      onComplete(score, newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.selectedAnswer || null);
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
    } else if (onBack) {
      onBack();
    }
  };

  if (showResults) {
    const correctAnswers = answers.filter(
      (ans) => {
        const q = questions.find((q) => q.id === ans.questionId);
        return q && q.correctAnswer === ans.selectedAnswer;
      }
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-5xl mb-4">{score >= 70 ? '🎉' : score >= 50 ? '👍' : '📚'}</div>
        <h2 className="text-3xl font-bold mb-2">
          Quiz Complete!
        </h2>
        <p className="text-2xl mb-4">
          You scored <span className="font-bold text-primary-600">{score}%</span>
        </p>
        <p className="text-gray-600 mb-6">
          {correctAnswers} out of {questions.length} questions correct
        </p>
        <Button onClick={() => window.history.back()}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quiz</h2>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedAnswer === index
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={selectedAnswer === index}
                onChange={() => setSelectedAnswer(index)}
                className="mr-3 w-5 h-5 text-primary-600 focus-ring"
              />
              <span className="font-medium">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentQuestion > 0 ? 'Previous' : onBack ? 'Back' : 'Cancel'}
        </Button>
        <Button onClick={handleNext} disabled={selectedAnswer === null}>
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

