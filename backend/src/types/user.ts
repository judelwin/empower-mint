export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningStyle = 'visual' | 'textual' | 'interactive';
export type FontSize = 'small' | 'medium' | 'large';
export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  colorblindMode: ColorblindMode;
}

export interface UserProfile {
  id: string;
  createdAt: Date;
  experienceLevel: ExperienceLevel;
  financialGoals: string[];
  riskComfort: number; // 1-10 scale
  learningStyle: LearningStyle;
  accessibility: AccessibilitySettings;
}

export interface OnboardingRequest {
  experienceLevel: ExperienceLevel;
  financialGoals: string[];
  riskComfort: number;
  learningStyle: LearningStyle;
}

export interface OnboardingResponse {
  userProfile: UserProfile;
  recommendedLessons: string[]; // Lesson IDs
  recommendedScenarios: string[]; // Scenario IDs
}

