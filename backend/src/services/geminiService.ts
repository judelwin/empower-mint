import { getGeminiClient, isGeminiAvailable } from '../config/gemini.js';
import { UserProfile, ExperienceLevel, LearningStyle } from '../types/user.js';

interface ExplainConceptParams {
  concept: string;
  context?: string;
  userProfile?: Partial<UserProfile>;
}

interface SimulateWealthParams {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  finalValue: number;
  totalContributions: number;
  gains: number;
  userProfile?: Partial<UserProfile>;
}

interface ReflectScenarioParams {
  scenarioTitle: string;
  decisionText: string;
  choiceText: string;
  stateChange: {
    savingsChange: number;
    debtChange: number;
    stressChange: number;
    knowledgeChange: number;
  };
  userProfile?: Partial<UserProfile>;
}

function buildPromptForExperienceLevel(
  experienceLevel: ExperienceLevel | undefined,
  learningStyle: LearningStyle | undefined
): string {
  let levelContext = '';
  if (experienceLevel === 'beginner') {
    levelContext = 'Use simple, everyday language. Avoid financial jargon. Use analogies and real-world examples.';
  } else if (experienceLevel === 'intermediate') {
    levelContext = 'You can use some financial terms, but explain them briefly. Provide practical insights.';
  } else {
    levelContext = 'You can use technical terms and provide deeper analysis.';
  }

  let styleContext = '';
  if (learningStyle === 'visual') {
    styleContext = 'Focus on visual comparisons and concrete examples that help visualize the concept.';
  } else if (learningStyle === 'textual') {
    styleContext = 'Provide clear written explanations with structured information.';
  } else {
    styleContext = 'Make it interactive and engaging, connecting to practical scenarios.';
  }

  return `${levelContext} ${styleContext}`;
}

export async function explainConcept(params: ExplainConceptParams): Promise<string> {
  if (!isGeminiAvailable()) {
    return `Here's a simple explanation of ${params.concept}: This feature will provide AI-powered explanations once the Gemini API is configured. In the meantime, consider researching this concept through our lessons.`;
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const experienceLevel = params.userProfile?.experienceLevel;
    const learningStyle = params.userProfile?.learningStyle;
    const styleGuidance = buildPromptForExperienceLevel(experienceLevel, learningStyle);

    const prompt = `You are a friendly financial education assistant helping users learn about personal finance and investing. Your goal is to make financial concepts accessible and empowering, especially for underrepresented groups who may have been historically excluded from financial education.

${styleGuidance}

Concept to explain: ${params.concept}
${params.context ? `Context: ${params.context}` : ''}

Provide a clear, encouraging explanation (2-3 paragraphs) that:
1. Explains the concept in accessible language
2. Uses relatable examples
3. Connects it to practical financial decisions
4. Emphasizes how this knowledge can empower the user

Keep it positive, inclusive, and empowering. Avoid condescending language.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate explanation. Please try again.');
  }
}

export async function explainWealthSimulation(params: SimulateWealthParams): Promise<string> {
  if (!isGeminiAvailable()) {
    return `Based on your simulation: Starting with $${params.initialAmount.toLocaleString()} and contributing $${params.monthlyContribution.toLocaleString()} monthly at ${params.annualReturn}% annual return for ${params.years} years, you would have approximately $${params.finalValue.toLocaleString()}. AI-powered insights will be available once the Gemini API is configured.`;
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const experienceLevel = params.userProfile?.experienceLevel;
    const learningStyle = params.userProfile?.learningStyle;
    const styleGuidance = buildPromptForExperienceLevel(experienceLevel, learningStyle);

    const prompt = `You are a friendly financial education assistant helping users understand wealth simulation results. Your goal is to make compound interest and long-term investing concepts accessible and empowering.

${styleGuidance}

Simulation Results:
- Initial Amount: $${params.initialAmount.toLocaleString()}
- Monthly Contribution: $${params.monthlyContribution.toLocaleString()}
- Annual Return: ${params.annualReturn}%
- Time Period: ${params.years} years
- Final Value: $${params.finalValue.toLocaleString()}
- Total Contributions: $${params.totalContributions.toLocaleString()}
- Investment Gains: $${params.gains.toLocaleString()}

Provide an encouraging explanation (2-3 paragraphs) that:
1. Highlights the power of compound interest and consistent investing
2. Explains what the numbers mean in practical terms
3. Emphasizes how time and consistency are key to building wealth
4. Makes the user feel empowered about their financial future

Keep it positive, inclusive, and motivating. Avoid making assumptions about the user's current financial situation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate explanation. Please try again.');
  }
}

export async function reflectOnScenarioDecision(params: ReflectScenarioParams): Promise<string> {
  if (!isGeminiAvailable()) {
    return `You chose: ${params.choiceText}. This decision reflects thoughtful consideration of your financial situation. Remember that financial decisions have both short-term and long-term impacts. Keep learning and building your financial knowledge!`;
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const experienceLevel = params.userProfile?.experienceLevel;
    const learningStyle = params.userProfile?.learningStyle;
    const styleGuidance = buildPromptForExperienceLevel(experienceLevel, learningStyle);

    const formatChange = (change: number, label: string): string => {
      if (change > 0) return `${label} increased by ${Math.abs(change).toFixed(1)}`;
      if (change < 0) return `${label} decreased by ${Math.abs(change).toFixed(1)}`;
      return `${label} stayed the same`;
    };

    const prompt = `You are a supportive financial education assistant providing reflection on user decisions in financial scenarios. Your goal is to help users learn from their choices in a positive, non-judgmental way.

${styleGuidance}

Scenario: ${params.scenarioTitle}
Decision Context: ${params.decisionText}
Choice Made: ${params.choiceText}

Impact:
- ${formatChange(params.stateChange.savingsChange, 'Savings')}
- ${formatChange(params.stateChange.debtChange, 'Debt')}
- ${formatChange(params.stateChange.stressChange, 'Stress Level')}
- ${formatChange(params.stateChange.knowledgeChange, 'Financial Knowledge')}

Provide a thoughtful reflection (2-3 paragraphs) that:
1. Acknowledges the decision positively
2. Explains the short-term and long-term implications in accessible terms
3. Highlights what can be learned from this choice
4. Offers encouragement and actionable insights for future decisions

Keep it constructive, educational, and empowering. Avoid judgmental language. Focus on learning and growth.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate reflection. Please try again.');
  }
}

