import { z } from 'zod';

// =============================================================================
// Environment Schema
// =============================================================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_PATH: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),

  // AI - LLM (9Router)
  AI_LLM_BASE_URL: z.string().url(),
  AI_LLM_API_KEY: z.string(),
  AI_LLM_MODEL: z.string().default('kr/claude-sonnet-4.5'),

  // AI - TTS (OmniVoice)
  OMNIVOICE_BASE_URL: z.string().url(),

  // Media - Pixabay
  PIXABAY_API_KEY: z.string(),

  // Authentication (NextAuth)
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),

  // YouTube OAuth
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_REDIRECT_URI: z.string().url().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  WEB_PORT: z.coerce.number().default(3000),
  API_PORT: z.coerce.number().default(4000),
});

export type Env = z.infer<typeof envSchema>;

// =============================================================================
// Environment Parser
// =============================================================================

export function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}

// =============================================================================
// Storage Configuration
// =============================================================================

export interface StorageConfig {
  driver: 'local' | 's3';
  local?: {
    path: string;
  };
  s3?: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
}

export function getStorageConfig(env: Env): StorageConfig {
  if (env.STORAGE_DRIVER === 's3') {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_BUCKET) {
      throw new Error('S3 storage requires S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET');
    }
    return {
      driver: 's3',
      s3: {
        endpoint: env.S3_ENDPOINT,
        accessKey: env.S3_ACCESS_KEY,
        secretKey: env.S3_SECRET_KEY,
        bucket: env.S3_BUCKET,
        region: env.S3_REGION || 'us-east-1',
      },
    };
  }

  return {
    driver: 'local',
    local: {
      path: env.LOCAL_STORAGE_PATH || './storage',
    },
  };
}

// =============================================================================
// AI Configuration
// =============================================================================

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface TtsConfig {
  baseUrl: string;
}

export interface MediaConfig {
  pixabayApiKey: string;
}

export function getLlmConfig(env: Env): LlmConfig {
  return {
    baseUrl: env.AI_LLM_BASE_URL,
    apiKey: env.AI_LLM_API_KEY,
    model: env.AI_LLM_MODEL,
  };
}

export function getTtsConfig(env: Env): TtsConfig {
  return {
    baseUrl: env.OMNIVOICE_BASE_URL,
  };
}

export function getMediaConfig(env: Env): MediaConfig {
  return {
    pixabayApiKey: env.PIXABAY_API_KEY,
  };
}
