import OpenAI from 'openai';
import type { UserProfile, PageInteraction, Feedback, InteractionEvent } from '@shared/schema';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface VisitSummary {
  totalInteractions: number;
  totalDuration: number;
  pagesVisited: string[];
  sectionsViewed: string[];
  ctaClicks: number;
  threeDInteractions: number;
}

interface ProjectRanking {
  projectId: string;
  score: number;
  rationale: string;
  engagementMetrics: {
    visits: number;
    duration: number;
    interactions: number;
  };
}

/**
 * Build visit summary from interaction data
 */
function buildVisitSummary(
  interactions: PageInteraction[],
  events: InteractionEvent[]
): VisitSummary {
  const pagesVisited = [...new Set(interactions.map((i) => i.pagePath))];
  const sectionsViewed = [...new Set(
    events
      .filter((e) => e.eventType === 'section_view')
      .map((e) => e.context || 'unknown')
  )];

  const totalDuration = interactions.reduce(
    (sum, i) => sum + (i.duration || 0),
    0
  );

  const ctaClicks = events.filter((e) => e.eventType === 'cta_click').length;
  const threeDInteractions = events.filter((e) => e.eventType === '3d_interaction').length;

  return {
    totalInteractions: interactions.length + events.length,
    totalDuration,
    pagesVisited,
    sectionsViewed,
    ctaClicks,
    threeDInteractions,
  };
}

/**
 * Rank projects based on user profile and interactions
 */
function rankProjects(
  profile: UserProfile,
  interactions: PageInteraction[],
  events: InteractionEvent[]
): ProjectRanking[] {
  const projects = ['tavakiev', 'tabeguache', 'venustas', 'yadilhil'];
  const rankings: ProjectRanking[] = [];

  for (const projectId of projects) {
    const projectInteractions = interactions.filter((i) =>
      i.pagePath.includes(projectId)
    );
    const projectEvents = events.filter((e) =>
      e.context?.includes(projectId)
    );

    const visits = projectInteractions.filter(
      (i) => i.interactionType === 'visit'
    ).length;
    const duration = projectInteractions.reduce(
      (sum, i) => sum + (i.duration || 0),
      0
    );
    const interactionCount = projectInteractions.length + projectEvents.length;

    // Calculate score based on engagement and profile match
    let score = interactionCount * 10 + duration;

    // Bonus for profile alignment
    const tags = profile.expertiseTags || [];
    if (projectId === 'tavakiev' && (tags.includes('Solar Energy') || tags.includes('Manufacturing'))) {
      score += 50;
    }
    if (projectId === 'tabeguache' && (tags.includes('Real Estate') || tags.includes('Construction'))) {
      score += 50;
    }
    if (projectId === 'venustas' && tags.includes('AI/Robotics')) {
      score += 50;
    }

    rankings.push({
      projectId,
      score,
      rationale: `Engagement score: ${score}`,
      engagementMetrics: {
        visits,
        duration,
        interactions: interactionCount,
      },
    });
  }

  return rankings.sort((a, b) => b.score - a.score);
}

/**
 * Extract key insights from user behavior
 */
function extractInsights(
  interactions: PageInteraction[],
  events: InteractionEvent[],
  feedbacks: Feedback[]
): any {
  const threeDViews = events.filter((e) => e.eventType === '3d_interaction');
  const ctaClicks = events.filter((e) => e.eventType === 'cta_click');
  const sectionViews = events.filter((e) => e.eventType === 'section_view');

  return {
    mostViewedSections: sectionViews
      .reduce((acc: any[], event) => {
        const existing = acc.find((item) => item.section === event.context);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ section: event.context, count: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    threeDEngagement: threeDViews.length > 0,
    ctaEngagement: ctaClicks.length,
    feedbackProvided: feedbacks.length,
    expertiseShared: feedbacks.map((f) => f.expertise).filter(Boolean),
  };
}

/**
 * Generate personalized investment report
 */
export async function generatePersonalizedReport(userId: string): Promise<{
  reportContent: string;
  recommendedProjects: string[];
  insights: any;
}> {
  // Fetch user data
  const [profile, interactions, events, feedbacks] = await Promise.all([
    storage.getUserProfile(userId),
    storage.getUserInteractions(userId),
    storage.getUserInteractionEvents(userId),
    storage.getUserFeedback(userId),
  ]);

  if (!profile) {
    throw new Error('User profile not found');
  }

  // Build context
  const visitSummary = buildVisitSummary(interactions, events);
  const projectRankings = rankProjects(profile, interactions, events);
  const insights = extractInsights(interactions, events, feedbacks);

  const topProjects = projectRankings.slice(0, 3);
  const recommendedProjects = topProjects.map((p) => p.projectId);

  // Generate report with GPT-4o-mini
  const prompt = `Generate a personalized investment report for a Physical.Capital visitor.

User Profile:
- Expertise: ${(profile.expertiseTags || []).join(', ')}
- Investment Goals: ${(profile.investmentGoals || []).join(', ')}
- Risk Appetite: ${profile.riskAppetite || 'Moderate'}
- Investment Range: ${profile.preferredInvestmentRange || 'Not specified'}

Visit Summary:
- Total Interactions: ${visitSummary.totalInteractions}
- Time Spent: ${Math.round(visitSummary.totalDuration / 60)} minutes
- Pages Visited: ${visitSummary.pagesVisited.join(', ')}
- Sections Viewed: ${visitSummary.sectionsViewed.join(', ')}
- CTA Clicks: ${visitSummary.ctaClicks}
- 3D Interactions: ${visitSummary.threeDInteractions}

Top Project Matches:
${topProjects.map((p, i) => `${i + 1}. ${p.projectId.toUpperCase()}
   - Visits: ${p.engagementMetrics.visits}
   - Time: ${Math.round(p.engagementMetrics.duration / 60)} min
   - Interactions: ${p.engagementMetrics.interactions}`).join('\n')}

User Feedback:
${feedbacks.map((f) => `- ${f.projectId}: "${f.feedbackText}"`).join('\n') || 'None provided yet'}

Write a comprehensive 2000-word markdown report with these sections:

# Executive Summary
Brief overview of user's interests and top recommendation

# Your Visit at a Glance
- Pages explored and time spent
- Key interactions (3D models, CTAs, sections)
- Engagement pattern analysis

# Projects Matching Your Expertise
For each of the top 3 projects:
- Why it matches their expertise and goals
- Specific investment opportunity details
- Risk/return profile aligned with their appetite
- How their background could add value

# Insights You Explored
- 3D models and visualizations interacted with
- Sections that captured attention
- Documents or data reviewed

# Next Steps
Personalized recommendations for:
1. Immediate actions (schedule meeting, review materials)
2. Investment opportunities (specific amounts and terms)
3. Ways to engage (advisory, partnership, investment)

# Concrete Investment Opportunity
Specific offering tailored to their profile:
- Investment vehicle (equity, tax credits, real estate)
- Amount range matching their preference
- Expected returns and timeline
- Next step to proceed

Make it professional, data-driven, and highly tailored to their expertise. Use specific numbers and metrics.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 3000,
    });

    const reportContent = response.choices[0]?.message?.content || 'Report generation failed';

    return {
      reportContent,
      recommendedProjects,
      insights: {
        visitSummary,
        projectRankings: topProjects,
        behavioralInsights: insights,
      },
    };
  } catch (error) {
    console.error('Report generation error:', error);

    // Fallback report
    return {
      reportContent: `# Investment Report

Thank you for exploring Physical.Capital. Based on your expertise in ${(profile.expertiseTags || []).join(', ')}, we recommend exploring our flagship Project Tavakiev solar manufacturing initiative.

Your engagement with our platform shows strong interest in ${recommendedProjects[0] || 'our projects'}. We'd love to discuss investment opportunities that match your goals.`,
      recommendedProjects,
      insights: {
        visitSummary,
        projectRankings: topProjects,
        behavioralInsights: insights,
      },
    };
  }
}
