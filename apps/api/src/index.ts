import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { parseEnv, getStorageConfig, getLlmConfig, getTtsConfig, getMediaConfig } from '@open-video/config';
import { LocalStorageDriver, S3StorageDriver } from '@open-video/config';
import { NineRouterLlmProvider, OmniVoiceTtsProvider, PixabayMediaProvider } from '@open-video/config';
import { prisma } from '@open-video/database';
import { projectRoutes } from './routes/projects.js';
import { sceneRoutes } from './routes/scenes.js';
import { voiceProfileRoutes } from './routes/voice-profiles.js';
import { assetRoutes } from './routes/assets.js';
import { renderRoutes } from './routes/renders.js';
import { youtubeRoutes } from './routes/youtube.js';
import { approvalRoutes } from './routes/approval.js';

async function main() {
  // Parse environment
  const env = parseEnv();

  // Initialize storage
  const storageConfig = getStorageConfig(env);
  const storage = storageConfig.driver === 's3' && storageConfig.s3
    ? new S3StorageDriver(storageConfig.s3)
    : new LocalStorageDriver(storageConfig.local?.path || './storage');

  // Initialize providers
  const llmProvider = new NineRouterLlmProvider(getLlmConfig(env));
  const ttsProvider = new OmniVoiceTtsProvider({ ...getTtsConfig(env), storage });
  const mediaProvider = new PixabayMediaProvider({ apiKey: env.PIXABAY_API_KEY, storage });

  // Create Fastify instance
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });

  // Decorate fastify with dependencies
  fastify.decorate('prisma', prisma);
  fastify.decorate('storage', storage as any);
  fastify.decorate('llm', llmProvider);
  fastify.decorate('tts', ttsProvider);
  fastify.decorate('media', mediaProvider);

  // Register routes
  await fastify.register(projectRoutes, { prefix: '/projects' });
  await fastify.register(sceneRoutes, { prefix: '/scenes' });
  await fastify.register(voiceProfileRoutes, { prefix: '/voice-profiles' });
  await fastify.register(assetRoutes, { prefix: '/assets' });
  await fastify.register(renderRoutes, { prefix: '/renders' });
  await fastify.register(youtubeRoutes, { prefix: '/youtube' });
  await fastify.register(approvalRoutes, { prefix: '/approval' });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  try {
    await fastify.listen({ port: env.API_PORT, host: '0.0.0.0' });
    console.log(`🚀 API server running on http://localhost:${env.API_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
