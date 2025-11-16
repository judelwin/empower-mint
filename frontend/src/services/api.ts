import { ApiError } from '../types/api.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: {
        code: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
      },
    }));
    throw error;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => fetchAPI<{ status: string; timestamp: string }>('/health'),

  // Lessons
  getLessons: (params?: { category?: string; difficulty?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty.toString());
    const queryString = query.toString();
    return fetchAPI<{ lessons: any[] }>(`/lessons${queryString ? `?${queryString}` : ''}`);
  },

  getLessonById: (id: string) => 
    fetchAPI<{ lesson: any }>(`/lessons/${id}`),

  completeLesson: (id: string, data: { score: number; answers: Array<{ questionId: string; selectedAnswer: number }> }) =>
    fetchAPI<{ xpEarned: number; progress: any }>(`/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Scenarios
  getScenarios: (params?: { category?: string; difficulty?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty.toString());
    const queryString = query.toString();
    return fetchAPI<{ scenarios: any[] }>(`/scenarios${queryString ? `?${queryString}` : ''}`);
  },

  getScenarioById: (id: string) =>
    fetchAPI<{ scenario: any }>(`/scenarios/${id}`),

  makeDecision: (id: string, data: { decisionPointId: string; choiceId: string; currentState: any }) =>
    fetchAPI<{ newState: any; aiReflection: string; xpEarned: number; progress: any }>(`/scenarios/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeScenario: (id: string, data: { finalState: any }) =>
    fetchAPI<{ xpEarned: number; progress: any }>(`/scenarios/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI
  explainConcept: (data: { concept: string; context?: string; userProfile?: any }) =>
    fetchAPI<{ explanation: string }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  simulateWealth: (data: { initialAmount: number; monthlyContribution: number; annualReturn: number; years: number; userProfile?: any }) =>
    fetchAPI<{ dataPoints: Array<{ year: number; value: number }>; explanation: string }>('/ai/simulate-wealth', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Onboarding
  completeOnboarding: (data: { experienceLevel: string; financialGoals: string[]; riskComfort: number; learningStyle: string }) =>
    fetchAPI<{ userProfile: any; recommendedLessons: string[]; recommendedScenarios: string[] }>('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

