import { FastifyPluginAsync } from 'fastify';

export const voiceProfileRoutes: FastifyPluginAsync = async (fastify) => {
  // List voice profiles
  fastify.get('/', async (request, reply) => {
    const profiles = await fastify.prisma.voiceProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return profiles;
  });

  // Get voice profile by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const profile = await fastify.prisma.voiceProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return reply.status(404).send({ error: 'Voice profile not found' });
    }

    return profile;
  });

  // Create voice profile
  fastify.post('/', async (request, reply) => {
    const { name, provider = 'omnivoice' } = request.body as any;

    const profile = await fastify.prisma.voiceProfile.create({
      data: {
        name,
        provider,
        status: 'active',
      },
    });

    return reply.status(201).send(profile);
  });

  // Upload voice sample
  fastify.post<{ Params: { id: string } }>('/:id/sample', async (request, reply) => {
    const { id } = request.params;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const key = `voice-samples/${id}/${Date.now()}-${data.filename}`;

    await fastify.storage.put(key, buffer, data.mimetype);
    const url = await fastify.storage.getUrl(key);

    // Clone voice using OmniVoice
    const voiceProfile = await fastify.tts.cloneVoice(`profile-${id}`, key);

    // Update profile
    const profile = await fastify.prisma.voiceProfile.update({
      where: { id },
      data: {
        samplePath: url,
        sampleMimeType: data.mimetype,
      },
    });

    return profile;
  });

  // Update voice profile
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, status } = request.body as any;

    const profile = await fastify.prisma.voiceProfile.update({
      where: { id },
      data: {
        name,
        status,
      },
    });

    return profile;
  });

  // Delete voice profile
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    await fastify.prisma.voiceProfile.delete({
      where: { id },
    });

    return reply.status(204).send();
  });
};
