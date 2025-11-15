export type LessonCategory = 'budgeting' | 'investing' | 'debt' | 'saving' | 'retirement';
export type DifficultyLevel = 1 | 2 | 3; // 1=beginner, 2=intermediate, 3=advanced

export interface LessonSection {
  type: 'text' | 'image' | 'interactive';
  content: string;
}

export interface LessonContent {
  sections: LessonSection[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  content: LessonContent;
  difficultyLevel: DifficultyLevel;
  estimatedMinutes: number;
  quizQuestions?: QuizQuestion[];
}

export interface LessonCompletionRequest {
  score: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
  }>;
}

