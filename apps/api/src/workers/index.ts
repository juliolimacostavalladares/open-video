import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '@open-video/database';

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

// =============================================================================
// Queues
// =============================================================================

export const ttsQueue = new Queue('tts', { connection });
export const mediaFetchQueue = new Queue('media-fetch', { connection });
export const renderQueue = new Queue('render', { connection });

// =============================================================================
// Job Types
// =============================================================================

export interface TtsJobData {
  sceneId: string;
  projectId: string;
  text: string;
  voiceProfileId: string;
}

export interface MediaFetchJobData {
  sceneId: string;
  projectId: string;
  mediaId: string;
  type: 'image' | 'video';
  url: string;
  attribution: {
    author: string;
    source: string;
    sourceUrl: string;
  };
}

export interface RenderJobData {
  projectId: string;
  renderJobId: string;
}

// =============================================================================
// Workers
// =============================================================================

export function createTtsWorker(ttsProvider: any) {
  return new Worker<TtsJobData>(
    'tts',
    async (job: Job<TtsJobData>) => {
      const { sceneId, text, voiceProfileId } = job.data;

      try {
        // Update status to running
        await prisma.scene.update({
          where: { id: sceneId },
          data: { status: 'tts_pending' },
        });

        // Synthesize speech
        const result = await ttsProvider.synthesize(text, voiceProfileId);

        // Update scene with audio
        await prisma.scene.update({
          where: { id: sceneId },
          data: {
            audioPath: result.audioPath,
            audioMimeType: result.mimeType,
            audioDurationSeconds: result.durationSeconds,
            status: 'tts_ready',
          },
        });

        return result;
      } catch (error) {
        await prisma.scene.update({
          where: { id: sceneId },
          data: { status: 'error' },
        });
        throw error;
      }
    },
    { connection }
  );
}

export function createMediaFetchWorker(mediaProvider: any) {
  return new Worker<MediaFetchJobData>(
    'media-fetch',
    async (job: Job<MediaFetchJobData>) => {
      const { sceneId, projectId, mediaId, type, url, attribution } = job.data;

      try {
        // Update status
        await prisma.scene.update({
          where: { id: sceneId },
          data: { status: 'media_pending' },
        });

        // Download media
        const key = `media/${projectId}/${mediaId}.${type === 'image' ? 'jpg' : 'mp4'}`;
        const storageUrl = await mediaProvider.download(url, key);

        // Create asset
        const asset = await prisma.asset.create({
          data: {
            projectId,
            kind: type === 'image' ? 'image' : 'video',
            source: 'external',
            path: storageUrl,
            mimeType: type === 'image' ? 'image/jpeg' : 'video/mp4',
            status: 'ready',
            attributionAuthor: attribution.author,
            attributionSource: attribution.source,
            attributionSourceUrl: attribution.sourceUrl,
          },
        });

        // Update scene
        await prisma.scene.update({
          where: { id: sceneId },
          data: {
            assetId: asset.id,
            status: 'media_ready',
          },
        });

        return { assetId: asset.id, storageUrl };
      } catch (error) {
        await prisma.scene.update({
          where: { id: sceneId },
          data: { status: 'error' },
        });
        throw error;
      }
    },
    { connection }
  );
}

export function createRenderWorker() {
  return new Worker<RenderJobData>(
    'render',
    async (job: Job<RenderJobData>) => {
      const { projectId, renderJobId } = job.data;

      try {
        // Update job status
        await prisma.renderJob.update({
          where: { id: renderJobId },
          data: {
            status: 'running',
            startedAt: new Date(),
          },
        });

        // Get project with scenes
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            scenes: {
              include: { asset: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        });

        if (!project) {
          throw new Error('Project not found');
        }

        // TODO: Implement actual rendering with FreeCut/Remotion
        // For now, simulate rendering
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mark as completed
        const outputPath = `renders/${projectId}/${renderJobId}.mp4`;

        await prisma.renderJob.update({
          where: { id: renderJobId },
          data: {
            status: 'succeeded',
            outputPath,
            completedAt: new Date(),
          },
        });

        // Update project status
        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'ready_for_review' },
        });

        return { outputPath };
      } catch (error) {
        await prisma.renderJob.update({
          where: { id: renderJobId },
          data: {
            status: 'failed',
            errorMessage: (error as Error).message,
          },
        });

        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'error' },
        });

        throw error;
      }
    },
    { connection }
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

export async function addTtsJob(data: TtsJobData) {
  return await ttsQueue.add('synthesize', data);
}

export async function addMediaFetchJob(data: MediaFetchJobData) {
  return await mediaFetchQueue.add('fetch', data);
}

export async function addRenderJob(data: RenderJobData) {
  return await renderQueue.add('render', data);
}
