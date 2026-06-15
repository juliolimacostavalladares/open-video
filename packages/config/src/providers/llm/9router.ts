import { LlmProvider, LlmMessage } from '@open-video/config';

export interface LlmProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class NineRouterLlmProvider implements LlmProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: LlmProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async complete(
    messages: LlmMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM request failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async completeJson<T>(messages: LlmMessage[], _schema?: unknown): Promise<T> {
    // Add JSON mode instruction
    const jsonMessages: LlmMessage[] = [
      {
        role: 'system',
        content: 'You must respond with valid JSON only. No markdown, no explanations.',
      },
      ...messages,
    ];

    const response = await this.complete(jsonMessages, { temperature: 0.3 });

    try {
      // Try to extract JSON from response (in case model wraps it)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return JSON.parse(response) as T;
    } catch (error) {
      throw new Error(`Failed to parse LLM JSON response: ${response}`);
    }
  }
}
