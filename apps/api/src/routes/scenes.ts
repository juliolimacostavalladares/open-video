import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const updateSceneSchema = z.object({
  title: z.string().optional(),
  script: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  orderIndex: z.number().int().optional(),
});

export const sceneRoutes: FastifyPluginAsync = async (fastify) => {
  // Get scene by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const scene = await fastify.prisma.scene.findUnique({
      where: { id },
      include: {
        asset: true,
        voiceProfile: true,
        project: true,
      },
    });

    if (!scene) {
      return reply.status(404).send({ error: 'Scene not found' });
    }

    return scene;
  });

  // Update scene
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const data = updateSceneSchema.parse(request.body);

    const scene = await fastify.prisma.scene.update({
      where: { id },
      data,
    });

    return scene;
  });

  // Delete scene
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    await fastify.prisma.scene.delete({
      where: { id },
    });

    return reply.status(204).send();
  });

  // Search media for scene
  fastify.get<{ Params: { id: string }; Querystring: { type: 'image' | 'video'; query?: string } }>(
    '/:id/media/search',
    async (request, reply) => {
      const { id } = request.params;
      const { type, query } = request.query;

      const scene = await fastify.prisma.scene.findUnique({
        where: { id },
      });

      if (!scene) {
        return reply.status(404).send({ error: 'Scene not found' });
      }

      const searchQuery = query || scene.keywords.join(' ');

      if (type === 'image') {
        const results = await fastify.media.searchImages(searchQuery);
        return { results, attribution: 'Images from Pixabay' };
      } else {
        const results = await fastify.media.searchVideos(searchQuery);
        return { results, attribution: 'Videos from Pixabay' };
      }
    }
  );

  // Attach media to scene
  fastify.post<{ Params: { id: string }; Body: { mediaId: string; type: 'image' | 'video'; url: string; attribution: any } }>(
    '/:id/media',
    async (request, reply) => {
      const { id } = request.params;
      const { mediaId, type, url, attribution } = request.body;

      const scene = await fastify.prisma.scene.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!scene) {
        return reply.status(404).send({ error: 'Scene not found' });
      }

      // Download media to storage
      const key = `media/${scene.projectId}/${mediaId}.${type === 'image' ? 'jpg' : 'mp4'}`;
      const storageUrl = await fastify.media.download(url, key);

      // Create asset
      const asset = await fastify.prisma.asset.create({
        data: {
          projectId: scene.projectId,
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
      const updatedScene = await fastify.prisma.scene.update({
        where: { id },
        data: {
          assetId: asset.id,
          status: 'media_ready',
        },
      });

      return updatedScene;
    }
  );

  // Generate TTS for scene
  fastify.post<{ Params: { id: string } }>('/:id/tts', async (request, reply) => {
    const { id } = request.params;

    const scene = await fastify.prisma.scene.findUnique({
      where: { id },
      include: {
        project: {
          include: { voiceProfile: true },
        },
        voiceProfile: true,
      },
    });

    if (!scene) {
      return reply.status(404).send({ error: 'Scene not found' });
    }

    const voiceProfile = scene.voiceProfile || scene.project.voiceProfile;

    if (!voiceProfile) {
      return reply.status(400).send({ error: 'No voice profile selected' });
    }

    // Synthesize speech
    const result = await fastify.tts.synthesize(scene.script, voiceProfile.id);

    // Update scene with audio
    const updatedScene = await fastify.prisma.scene.update({
      where: { id },
      data: {
        audioPath: result.audioPath,
        audioMimeType: result.mimeType,
        audioDurationSeconds: result.durationSeconds,
        status: 'tts_ready',
      },
    });

    return updatedScene;
  });
};
