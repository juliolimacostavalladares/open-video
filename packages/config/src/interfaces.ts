// =============================================================================
// Storage Driver Interface
// =============================================================================

export interface StorageDriver {
  /**
   * Upload a file to storage
   */
  put(key: string, data: Buffer | Uint8Array, contentType?: string): Promise<string>;

  /**
   * Download a file from storage
   */
  get(key: string): Promise<Buffer>;

  /**
   * Get a public/signed URL for a file
   */
  getUrl(key: string): Promise<string>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;
}

// =============================================================================
// LLM Provider Interface
// =============================================================================

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmProvider {
  /**
   * Generate text completion
   */
  complete(messages: LlmMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string>;

  /**
   * Generate structured JSON output
   */
  completeJson<T>(messages: LlmMessage[], schema: unknown): Promise<T>;
}

// =============================================================================
// TTS Provider Interface
// =============================================================================

export interface VoiceProfile {
  id: string;
  name: string;
  samplePath?: string;
}

export interface TtsResult {
  audioPath: string;
  mimeType: string;
  durationSeconds: number;
}

export interface TtsProvider {
  /**
   * Clone a voice from a sample audio
   */
  cloneVoice(name: string, samplePath: string): Promise<VoiceProfile>;

  /**
   * Synthesize speech from text
   */
  synthesize(text: string, voiceId: string): Promise<TtsResult>;

  /**
   * List available voices
   */
  listVoices(): Promise<VoiceProfile[]>;
}

// =============================================================================
// Media Provider Interface
// =============================================================================

export interface MediaSearchResult {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  attribution: {
    author: string;
    source: string;
    sourceUrl: string;
  };
}

export interface MediaProvider {
  /**
   * Search for images
   */
  searchImages(query: string, options?: { page?: number; perPage?: number }): Promise<MediaSearchResult[]>;

  /**
   * Search for videos
   */
  searchVideos(query: string, options?: { page?: number; perPage?: number }): Promise<MediaSearchResult[]>;

  /**
   * Download media to storage
   */
  download(url: string, key: string): Promise<string>;
}
