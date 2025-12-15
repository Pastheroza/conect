import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function loadPrompt(name: string, vars: Record<string, string>): Promise<string> {
  let prompt = await readFile(join(PROMPTS_DIR, `${name}.md`), 'utf-8');
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return prompt;
}

export async function callGroq(prompt: string, maxTokens: number = 4096): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callGroqJson<T>(prompt: string, maxTokens: number = 4096): Promise<T> {
  const response = await callGroq(prompt, maxTokens);
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response;
  
  // Try to find JSON in code block first
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  
  // Try to find JSON object/array directly
  if (!jsonStr.trim().startsWith('{') && !jsonStr.trim().startsWith('[')) {
    const objectMatch = response.match(/(\{[\s\S]*\})/);
    const arrayMatch = response.match(/(\[[\s\S]*\])/);
    jsonStr = objectMatch?.[1] || arrayMatch?.[1] || jsonStr;
  }
  
  try {
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    // Try to fix common JSON issues
    try {
      // Remove trailing commas
      const fixed = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(fixed.trim());
    } catch {
      console.error('Failed to parse Groq response as JSON:', response.substring(0, 500));
      throw new Error('Invalid JSON response from Groq');
    }
  }
}
