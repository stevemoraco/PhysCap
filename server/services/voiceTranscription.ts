import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface TranscriptionResult {
  transcript: string;
  confidence?: number;
  language: string;
}

export interface ExpertiseExtractionResult {
  keywords: string[];
  categories: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Transcribe audio file using OpenAI Whisper
 */
export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
    });

    return {
      transcript: transcription.text,
      language: 'en',
    };
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Extract expertise keywords and categories from transcript using GPT-4o-mini
 */
export async function extractExpertise(transcript: string): Promise<ExpertiseExtractionResult> {
  try {
    const prompt = `Analyze this feedback transcript from an investor/expert and extract:
1. Specific expertise keywords (technologies, industries, financial terms)
2. Broad categories of expertise
3. Overall sentiment (positive, neutral, negative)

Transcript:
"${transcript}"

Return JSON with this structure:
{
  "keywords": ["keyword1", "keyword2", ...],
  "categories": ["category1", "category2", ...],
  "sentiment": "positive|neutral|negative"
}

Focus on technical terms, industry expertise, financial knowledge, and domain-specific insights.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      keywords: result.keywords || [],
      categories: result.categories || [],
      sentiment: result.sentiment || 'neutral',
    };
  } catch (error) {
    console.error('Expertise extraction error:', error);
    return {
      keywords: [],
      categories: [],
      sentiment: 'neutral',
    };
  }
}

/**
 * Generate summary of feedback using GPT-4o-mini
 */
export async function summarizeFeedback(transcript: string): Promise<string> {
  try {
    const prompt = `Summarize this investor feedback in 2-3 concise sentences, focusing on key insights and concerns:

"${transcript}"

Be professional and highlight actionable points.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 200,
    });

    return response.choices[0]?.message?.content || transcript;
  } catch (error) {
    console.error('Summarization error:', error);
    return transcript;
  }
}

/**
 * Complete pipeline: transcribe and extract insights
 */
export async function processVoiceFeedback(audioPath: string): Promise<{
  transcript: string;
  expertise: ExpertiseExtractionResult;
  summary: string;
}> {
  // Transcribe audio
  const transcriptionResult = await transcribeAudio(audioPath);

  // Extract expertise in parallel with summarization
  const [expertise, summary] = await Promise.all([
    extractExpertise(transcriptionResult.transcript),
    summarizeFeedback(transcriptionResult.transcript),
  ]);

  return {
    transcript: transcriptionResult.transcript,
    expertise,
    summary,
  };
}
