export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface AiExplainRequest {
  concept: string;
  context?: string;
  userProfile?: Partial<import('./user.js').UserProfile>;
}

export interface AiExplainResponse {
  explanation: string;
}

export interface AiSimulateWealthRequest {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  userProfile?: Partial<import('./user.js').UserProfile>;
}

export interface AiSimulateWealthResponse {
  dataPoints: Array<{
    year: number;
    value: number;
  }>;
  explanation: string;
}

