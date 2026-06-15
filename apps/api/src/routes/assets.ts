import { FastifyPluginAsync } from 'fastify';

export const assetRoutes: FastifyPluginAsync = async (fastify) => {
  // List assets for project
  fastify.get<{ Params: { projectId: string } }>('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params;

    const assets = await fastify.prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return assets;
  });

  // Upload asset
  fastify.post<{ Params: { projectId: string } }>('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const key = `uploads/${projectId}/${Date.now()}-${data.filename}`;

    await fastify.storage.put(key, buffer, data.mimetype);
    const url = await fastify.storage.getUrl(key);

    // Determine asset kind from mimetype
    let kind: 'image' | 'video' | 'audio' = 'image';
    if (data.mimetype.startsWith('video/')) {
      kind = 'video';
    } else if (data.mimetype.startsWith('audio/')) {
      kind = 'audio';
    }

    const asset = await fastify.prisma.asset.create({
      data: {
        projectId,
        kind,
        source: 'upload',
        path: url,
        mimeType: data.mimetype,
        size: buffer.length,
        status: 'ready',
      },
    });

    return reply.status(201).send(asset);
  });

  // Delete asset
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const asset = await fastify.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return reply.status(404).send({ error: 'Asset not found' });
    }

    // Delete from storage
    try {
      await fastify.storage.delete(asset.path);
    } catch (error) {
      // Ignore if file doesn't exist
    }

    // Delete from database
    await fastify.prisma.asset.delete({
      where: { id },
    });

    return reply.status(204).send();
  });
};
