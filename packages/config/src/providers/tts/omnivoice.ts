import { TtsProvider, VoiceProfile, TtsResult } from '@open-video/config';
import { StorageDriver } from '@open-video/config';

export interface TtsProviderConfig {
  baseUrl: string;
  storage: StorageDriver;
}

/**
 * OmniVoice TTS Provider — uses the OpenAI-compatible /v1/audio/speech endpoint.
 * Voice IDs: alloy | echo | fable | nova | onyx | shimmer
 * or any profile ID registered in OmniVoice.
 */
export class OmniVoiceTtsProvider implements TtsProvider {
  private baseUrl: string;
  private storage: StorageDriver;

  constructor(config: TtsProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.storage = config.storage;
  }

  async cloneVoice(name: string, samplePath: string): Promise<VoiceProfile> {
    // Read sample audio from storage
    const sampleData = await this.storage.get(samplePath);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('audio', new Blob([new Uint8Array(sampleData)], { type: 'audio/wav' }), 'sample.wav');

    // OmniVoice: upload as a profile via /profiles or gallery
    const response = await fetch(`${this.baseUrl}/profiles`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voice cloning failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      id: data.id || data.profile_id || name,
      name,
      samplePath,
    };
  }

  async synthesize(text: string, voiceId: string): Promise<TtsResult> {
    // OpenAI-compatible endpoint
    const response = await fetch(`${this.baseUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        // If voiceId looks like a DB id (cuid), fall back to "alloy"
        voice: voiceId.length > 20 ? 'alloy' : voiceId,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TTS synthesis failed: ${response.status} - ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);

    // Save to storage
    const audioKey = `tts/${voiceId}/${Date.now()}.mp3`;
    await this.storage.put(audioKey, audioData, 'audio/mpeg');

    const audioUrl = await this.storage.getUrl(audioKey);

    // Estimate duration (~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const durationSeconds = (wordCount / 150) * 60;

    return {
      audioPath: audioUrl,
      mimeType: 'audio/mpeg',
      durationSeconds,
    };
  }

  async listVoices(): Promise<VoiceProfile[]> {
    const response = await fetch(`${this.baseUrl}/v1/audio/voices`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.voices || []).map((v: { voice_id: string; name: string }) => ({
      id: v.voice_id,
      name: v.name,
      samplePath: undefined,
    }));
  }
}
