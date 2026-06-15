import { FastifyPluginAsync } from 'fastify';

export const renderRoutes: FastifyPluginAsync = async (fastify) => {
  // List render jobs for project
  fastify.get<{ Params: { projectId: string } }>('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params;

    const jobs = await fastify.prisma.renderJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return jobs;
  });

  // Get render job by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const job = await fastify.prisma.renderJob.findUnique({
      where: { id },
    });

    if (!job) {
      return reply.status(404).send({ error: 'Render job not found' });
    }

    return job;
  });

  // Create render job
  fastify.post<{ Params: { projectId: string } }>('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params;

    const project = await fastify.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        scenes: {
          include: { asset: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Check if all scenes are ready
    const readyScenes = project.scenes.filter((s: any) => s.status === 'tts_ready' || s.status === 'ready');
    if (readyScenes.length === 0) {
      return reply.status(400).send({ error: 'No scenes ready for rendering' });
    }

    // Create render job
    const job = await fastify.prisma.renderJob.create({
      data: {
        projectId,
        status: 'queued',
      },
    });

    // Update project status
    await fastify.prisma.project.update({
      where: { id: projectId },
      data: { status: 'rendering' },
    });

    // TODO: Add to BullMQ queue for async processing
    // For now, we'll just mark it as queued

    return reply.status(201).send(job);
  });

  // Retry render job
  fastify.post<{ Params: { id: string } }>('/:id/retry', async (request, reply) => {
    const { id } = request.params;

    const job = await fastify.prisma.renderJob.findUnique({
      where: { id },
    });

    if (!job) {
      return reply.status(404).send({ error: 'Render job not found' });
    }

    if (job.status !== 'failed') {
      return reply.status(400).send({ error: 'Can only retry failed jobs' });
    }

    const updatedJob = await fastify.prisma.renderJob.update({
      where: { id },
      data: {
        status: 'queued',
        errorMessage: null,
      },
    });

    // TODO: Re-add to BullMQ queue

    return updatedJob;
  });
};
