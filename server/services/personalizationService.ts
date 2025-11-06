import OpenAI from 'openai';
import type { UserProfile } from '@shared/schema';

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

// Pre-defined persona-specific copy variants
export const PersonalizedCopy = {
  hero: {
    'FinTech Investor': {
      headline: 'Turn Federal Tax Credits into Cash Flow',
      subheading: 'Monetize Section 45X credits at $0.96 on the dollar through our autonomous solar gigafactory',
      cta: 'Explore Tax Credit Opportunities',
    },
    'Technical Expert': {
      headline: 'Witness the Future of Manufacturing',
      subheading: 'WebGPU-powered visualization of HJT cell production with humanoid robotics',
      cta: 'Explore Technical Details',
    },
    'Policy Advisor': {
      headline: 'Accelerating Clean Energy Through Strategic Policy',
      subheading: 'Leveraging IRA incentives to build domestic solar manufacturing at scale',
      cta: 'View Policy Impact',
    },
    'Strategic Corporate Partner': {
      headline: 'Strategic Infrastructure for Sustainable Growth',
      subheading: 'Vertically integrated projects from manufacturing to real estate development',
      cta: 'Explore Partnership Opportunities',
    },
    'General Investor': {
      headline: 'Invest in Physical Capital',
      subheading: 'Building autonomous manufacturing and sustainable infrastructure',
      cta: 'Explore Opportunities',
    },
  },
  'project-tavakiev': {
    'FinTech Investor': {
      headline: 'Project Tavakiev: $2.8B Tax Credit Opportunity',
      description: 'Generate predictable returns through Section 45X manufacturing credits while building domestic solar capacity',
    },
    'Technical Expert': {
      headline: 'Project Tavakiev: Next-Gen HJT Manufacturing',
      description: 'Advanced heterojunction cell production with humanoid robotics achieving 24.5% efficiency',
    },
    'Policy Advisor': {
      headline: 'Project Tavakiev: Domestic Manufacturing Leadership',
      description: 'First-of-its-kind autonomous gigafactory aligned with IRA goals for energy independence',
    },
    'Strategic Corporate Partner': {
      headline: 'Project Tavakiev: Vertically Integrated Solar Platform',
      description: 'Complete value chain from wafer production to module assembly with offtake partnerships',
    },
    'General Investor': {
      headline: 'Project Tavakiev: Autonomous Solar Gigafactory',
      description: 'Revolutionary manufacturing facility producing 10GW of solar modules annually',
    },
  },
  'project-tabeguache': {
    'FinTech Investor': {
      headline: 'Tabeguache Collection: Premium Real Estate Returns',
      description: 'High-end resort development with projected 18% IRR in untapped Colorado market',
    },
    'Technical Expert': {
      headline: 'Tabeguache Collection: Engineering Excellence',
      description: 'Sustainable architecture integrating geothermal systems and advanced materials',
    },
    'Policy Advisor': {
      headline: 'Tabeguache Collection: Rural Development Initiative',
      description: 'Bringing economic growth to Southern Colorado through sustainable tourism',
    },
    'Strategic Corporate Partner': {
      headline: 'Tabeguache Collection: Mixed-Use Development',
      description: 'Luxury resort, residential units, and commercial space spanning 2,400 acres',
    },
    'General Investor': {
      headline: 'Tabeguache Collection: Mountain Resort Development',
      description: 'World-class destination resort in the San Luis Valley, Colorado',
    },
  },
};

export function determinePersona(profile: UserProfile): string {
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

export async function generatePersonalizedContent(
  baseContent: string,
  userProfile: UserProfile,
  context: 'hero' | 'project-card' | 'cta' | 'section-heading',
  projectId?: string
): Promise<string> {
  const persona = determinePersona(userProfile);

  // Try to use pre-cached copy first
  if (context === 'hero' && PersonalizedCopy.hero[persona]) {
    return JSON.stringify(PersonalizedCopy.hero[persona]);
  }

  if (projectId && PersonalizedCopy[`project-${projectId}` as keyof typeof PersonalizedCopy]) {
    const projectCopy = PersonalizedCopy[`project-${projectId}` as keyof typeof PersonalizedCopy] as any;
    if (projectCopy[persona]) {
      return JSON.stringify(projectCopy[persona]);
    }
  }

  // Generate with GPT-4o-mini if no cached version
  try {
    const prompt = `You are personalizing content for Physical.Capital investment platform.

User Persona: ${persona}
User Expertise: ${(userProfile.expertiseTags || []).join(', ')}
User Goals: ${(userProfile.investmentGoals || []).join(', ')}
Risk Appetite: ${userProfile.riskAppetite || 'Moderate'}
Context: ${context}
${projectId ? `Project: ${projectId}` : ''}

Base Content:
${baseContent}

Rewrite this content to resonate with this user's background and goals.
Keep length similar. Maintain professional tone.
Focus on aspects most relevant to their expertise.
If the base content has multiple fields (like headline, subheading), return JSON with the same structure.
Otherwise, return plain text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    return response.choices[0]?.message?.content || baseContent;
  } catch (error) {
    console.error('GPT-4o-mini personalization error:', error);
    return baseContent;
  }
}

export async function generateUserCopyBundle(
  userId: string,
  profile: UserProfile
): Promise<Record<string, string>> {
  const persona = determinePersona(profile);
  const bundle: Record<string, string> = {};

  // Hero section
  if (PersonalizedCopy.hero[persona]) {
    const heroCopy = PersonalizedCopy.hero[persona];
    bundle['hero.headline'] = heroCopy.headline;
    bundle['hero.subheading'] = heroCopy.subheading;
    bundle['hero.cta'] = heroCopy.cta;
  }

  // Project cards
  const projects = ['tavakiev', 'tabeguache'];
  for (const projectId of projects) {
    const key = `project-${projectId}` as keyof typeof PersonalizedCopy;
    if (PersonalizedCopy[key]) {
      const projectCopy = PersonalizedCopy[key] as any;
      if (projectCopy[persona]) {
        bundle[`${projectId}.headline`] = projectCopy[persona].headline;
        bundle[`${projectId}.description`] = projectCopy[persona].description;
      }
    }
  }

  return bundle;
}
