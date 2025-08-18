import { generateApiOnboardingInstructions, generateMcpOnboardingInstructions, type OnboardingConfig } from './onboarding-flows';

export function generateOnboardingInstructions(
  projectId: string,
  apiToken?: string
): string {
  // Legacy function - defaults to API onboarding for backward compatibility
  return generateApiOnboardingInstructions({ projectId, apiToken });
}

export function generateApiOnboarding(config: OnboardingConfig): string {
  return generateApiOnboardingInstructions(config);
}

export function generateMcpOnboarding(config: OnboardingConfig): string {
  return generateMcpOnboardingInstructions(config);
}