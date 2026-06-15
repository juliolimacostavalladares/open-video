import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const approvalSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  comment: z.string().optional(),
});

export const approvalRoutes: FastifyPluginAsync = async (fastify) => {
  // Approve or reject project
  fastify.post<{ Params: { projectId: string } }>('/:projectId', async (request, reply) => {
    const { projectId } = request.params;
    const { action, comment } = approvalSchema.parse(request.body);

    // Get project
    const project = await fastify.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Check if project is ready for review
    if (project.status !== 'ready_for_review') {
      return reply.status(400).send({ error: 'Project is not ready for review' });
    }

    // Get user (from auth context - for now, use first user)
    const user = await fastify.prisma.user.findFirst();
    if (!user) {
      return reply.status(500).send({ error: 'User not found' });
    }

    // Create approval log
    const approvalLog = await fastify.prisma.approvalLog.create({
      data: {
        projectId,
        userId: user.id,
        action,
        comment,
        version: 1,
      },
    });

    // Update project status
    const newStatus = action === 'approved' ? 'approved' : 'rejected';
    await fastify.prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    return {
      success: true,
      approvalLog,
      newStatus,
    };
  });

  // Get approval history
  fastify.get<{ Params: { projectId: string } }>('/:projectId/history', async (request, reply) => {
    const { projectId } = request.params;

    const logs = await fastify.prisma.approvalLog.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  });

  // Get current approval status
  fastify.get<{ Params: { projectId: string } }>('/:projectId/status', async (request, reply) => {
    const { projectId } = request.params;

    const project = await fastify.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        status: true,
        approvalLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const latestLog = project.approvalLogs[0];

    return {
      status: project.status,
      lastAction: latestLog?.action || null,
      lastComment: latestLog?.comment || null,
      lastActionBy: latestLog?.user || null,
      lastActionAt: latestLog?.createdAt || null,
    };
  });
};
