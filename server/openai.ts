// OpenAI integration using Replit AI Integrations
import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

/**
 * Transcribe audio using Whisper
 */
export async function transcribeAudioWithWhisper(audioPath: string): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    return transcription as unknown as string;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Generate content with GPT-4o-mini
 */
export async function generateContentWithGPT4oMini(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_completion_tokens: options?.maxTokens || 1000,
      ...(options?.jsonMode && { response_format: { type: 'json_object' } }),
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('GPT-4o-mini error:', error);
    throw new Error('Failed to generate content');
  }
}

/**
 * Extract structured data using GPT-4o-mini with JSON mode
 */
export async function extractStructuredData<T = any>(
  prompt: string,
  schema?: string
): Promise<T> {
  try {
    const fullPrompt = schema
      ? `${prompt}\n\nReturn JSON with this structure:\n${schema}`
      : prompt;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: fullPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Structured data extraction error:', error);
    throw new Error('Failed to extract structured data');
  }
}

export async function generatePersonalizedReport(
  userProfile: {
    profession?: string | null;
    expertise?: string | null;
    email?: string | null;
  },
  feedback: Array<{ projectId: string; feedbackText: string; expertise?: string | null }>,
  interactions: Array<{ pagePath: string; sectionId?: string | null; interactionType: string; duration?: number | null }>
): Promise<{ report: string; recommendedProjects: string[]; insights: any }> {
  
  const prompt = `You are an expert investment advisor for Physical.Capital, analyzing user engagement and expertise to create personalized project recommendations.

User Profile:
- Profession: ${userProfile.profession || 'Not specified'}
- Expertise: ${userProfile.expertise || 'Not specified'}
- Email: ${userProfile.email || 'Not specified'}

User Feedback on Projects:
${feedback.map(f => `- Project ${f.projectId}: "${f.feedbackText}" (Expertise mentioned: ${f.expertise || 'None'})`).join('\n')}

User Interactions:
${interactions.map(i => `- ${i.interactionType} on ${i.pagePath}${i.sectionId ? ` (${i.sectionId})` : ''}${i.duration ? ` for ${i.duration}s` : ''}`).join('\n')}

Based on this data, create a personalized investment report that:
1. Analyzes which Physical.Capital projects (Project Tavakiev, Tabeguache Collection, Venustas Tower, Yádiłhił) best match their expertise and interests
2. Provides specific investment insights and opportunities
3. Highlights how their background could contribute value to recommended projects
4. Includes concrete next steps for engagement

Return a JSON object with:
{
  "report": "A detailed markdown-formatted report (2-3 paragraphs)",
  "recommendedProjects": ["array", "of", "project", "ids"],
  "insights": {
    "expertiseMatch": "How their expertise aligns",
    "engagementLevel": "High/Medium/Low based on interactions",
    "topProject": "Single best-fit project",
    "investmentRange": "Suggested investment tier"
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback response
    return {
      report: `Thank you for your interest in Physical.Capital. Based on your engagement, we recommend exploring our flagship Project Tavakiev solar manufacturing initiative.`,
      recommendedProjects: ['tavakiev'],
      insights: {
        expertiseMatch: 'Analysis pending',
        engagementLevel: 'Medium',
        topProject: 'tavakiev',
        investmentRange: 'Early stage'
      }
    };
  }
}
