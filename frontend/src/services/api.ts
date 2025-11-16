import { ApiError } from '../types/api.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  userId?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add user ID header if provided
  if (userId) {
    (headers as Record<string, string>)['X-User-Id'] = userId;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let error: ApiError;
      try {
        const parsedError = await response.json() as any;
        // Ensure error has expected structure
        if (!parsedError || !parsedError.error) {
          error = {
            error: {
              code: 'HTTP_ERROR',
              message: parsedError?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            },
          };
        } else {
          error = parsedError as ApiError;
        }
      } catch {
        // If response is not JSON, create error object
        error = {
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        } as ApiError;
      }

      // Enhance error messages for common status codes if not already set
      if (response.status === 404 && error.error?.code === 'HTTP_ERROR') {
        error.error.code = 'NOT_FOUND';
        error.error.message = error.error.message || 'Resource not found';
      } else if (response.status === 400 && error.error?.code === 'HTTP_ERROR') {
        error.error.code = 'VALIDATION_ERROR';
        error.error.message = error.error.message || 'Invalid request';
      } else if (response.status === 500 && error.error?.code === 'HTTP_ERROR') {
        error.error.code = 'SERVER_ERROR';
        error.error.message = error.error.message || 'Server error. Please try again.';
      } else if (response.status === 503 && error.error?.code === 'HTTP_ERROR') {
        error.error.code = 'SERVICE_UNAVAILABLE';
        error.error.message = 'Service temporarily unavailable. Please try again later.';
      }

      throw error;
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle network errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw {
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'Request timed out. Please check your connection and try again.',
        },
      } as ApiError;
    }

    // Handle network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection and try again.',
        },
      } as ApiError;
    }

    // Re-throw API errors
    if (error.error) {
      throw error;
    }

    // Unknown error
    throw {
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    } as ApiError;
  }
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

  completeLesson: (id: string, data: { score: number; answers: Array<{ questionId: string; selectedAnswer: number }>; userId?: string }) =>
    fetchAPI<{ xpEarned: number; progress: any }>(
      `/lessons/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      data.userId
    ),

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

  makeDecision: (id: string, data: { decisionPointId: string; choiceId: string; currentState: any; userId?: string }) =>
    fetchAPI<{ newState: any; aiReflection: string; xpEarned: number; progress: any }>(
      `/scenarios/${id}/decision`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      data.userId
    ),

  completeScenario: (id: string, data: { finalState: any; userId?: string }) =>
    fetchAPI<{ xpEarned: number; progress: any }>(
      `/scenarios/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      data.userId
    ),

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

