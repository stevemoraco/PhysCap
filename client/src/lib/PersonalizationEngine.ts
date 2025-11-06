import type { UserProfile } from '@shared/schema';

export type ContentContext = 'hero' | 'project-card' | 'cta' | 'section-heading';

export interface PersonalizationRequest {
  baseContent: string;
  userProfile: UserProfile;
  context: ContentContext;
  projectId?: string;
}

export class PersonalizationEngine {
  /**
   * Generate personalized copy on the client side using server API
   */
  static async generatePersonalizedCopy(request: PersonalizationRequest): Promise<string> {
    try {
      const response = await fetch('/api/personalization/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        console.error('Failed to generate personalized copy');
        return request.baseContent;
      }

      const data = await response.json();
      return data.personalizedContent || request.baseContent;
    } catch (error) {
      console.error('Personalization error:', error);
      return request.baseContent;
    }
  }

  /**
   * Determine user persona based on profile
   */
  static determinePersona(profile: UserProfile): string {
    const tags = profile.expertiseTags || [];

    if (tags.includes('Finance') || tags.includes('Tax Credits')) {
      return 'FinTech Investor';
    }
    if (tags.includes('Solar Energy') || tags.includes('Manufacturing')) {
      return 'Technical Expert';
    }
    if (tags.includes('Policy')) {
      return 'Policy Advisor';
    }
    if (tags.includes('Real Estate') || tags.includes('Construction')) {
      return 'Strategic Corporate Partner';
    }

    return 'General Investor';
  }

  /**
   * Get pre-cached persona-specific copy variant
   */
  static getPersonaCopy(
    persona: string,
    context: ContentContext,
    projectId?: string
  ): string | null {
    // This would ideally fetch from a cache or use pre-defined variants
    // For now, return null to trigger server-side generation
    return null;
  }

  /**
   * Calculate engagement score based on user interactions
   */
  static calculateEngagementScore(interactionCount: number, feedbackCount: number): number {
    const interactionScore = Math.min(interactionCount * 2, 50);
    const feedbackScore = Math.min(feedbackCount * 10, 50);
    return interactionScore + feedbackScore;
  }

  /**
   * Recommend projects based on user profile
   */
  static recommendProjects(profile: UserProfile): string[] {
    const recommendations: string[] = [];
    const tags = profile.expertiseTags || [];
    const goals = profile.investmentGoals || [];

    // Tavakiev - Solar manufacturing
    if (
      tags.includes('Solar Energy') ||
      tags.includes('Manufacturing') ||
      tags.includes('Tax Credits') ||
      goals.includes('Tax Credit Monetization (Section 45X)')
    ) {
      recommendations.push('tavakiev');
    }

    // Tabeguache - Real estate
    if (
      tags.includes('Real Estate') ||
      tags.includes('Construction') ||
      goals.includes('Real Estate Development')
    ) {
      recommendations.push('tabeguache');
    }

    // Venustas - AI/Tech infrastructure
    if (
      tags.includes('AI/Robotics') ||
      tags.includes('Infrastructure') ||
      tags.includes('Clean Tech')
    ) {
      recommendations.push('venustas');
    }

    // Yadilhil - Complex strategic project
    if (
      tags.includes('Policy') ||
      tags.includes('Strategic Partnership') ||
      profile.riskAppetite === 'Aggressive'
    ) {
      recommendations.push('yadilhil');
    }

    // Default to flagship project if no specific match
    if (recommendations.length === 0) {
      recommendations.push('tavakiev');
    }

    return recommendations;
  }
}
