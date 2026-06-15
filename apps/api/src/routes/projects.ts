import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: any;
    storage: any;
    llm: any;
    tts: any;
    media: any;
  }
}

const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  theme: z.string().optional(),
  tone: z.string().optional(),
  targetDuration: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  voiceProfileId: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  // List projects
  fastify.get('/', async (request, reply) => {
    const projects = await fastify.prisma.project.findMany({
      include: {
        scenes: true,
        voiceProfile: true,
        _count: {
          select: { scenes: true, assets: true, renderJobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  });

  // Get project by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const project = await fastify.prisma.project.findUnique({
      where: { id },
      include: {
        scenes: {
          orderBy: { orderIndex: 'asc' },
          include: {
            asset: true,
          },
        },
        voiceProfile: true,
        assets: true,
        renderJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        approvalLogs: {
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    return project;
  });

  // Create project
  fastify.post('/', async (request, reply) => {
    const data = createProjectSchema.parse(request.body);

    const project = await fastify.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        theme: data.theme,
        tone: data.tone,
        targetDuration: data.targetDuration,
        tags: data.tags || [],
        voiceProfileId: data.voiceProfileId,
        status: 'draft',
      },
    });

    return reply.status(201).send(project);
  });

  // Update project
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const data = updateProjectSchema.parse(request.body);

    const project = await fastify.prisma.project.update({
      where: { id },
      data,
    });

    return project;
  });

  // Delete project
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    await fastify.prisma.project.delete({
      where: { id },
    });

    return reply.status(204).send();
  });

  // Generate script with AI
  fastify.post<{ Params: { id: string } }>('/:id/script/generate', async (request, reply) => {
    const { id } = request.params;
    const { theme, tone, targetDuration } = request.body as any;

    const project = await fastify.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Generate script using LLM
    const prompt = `Create a video script about "${theme || project.theme || 'general topic'}" with a ${tone || project.tone || 'professional'} tone. The video should be approximately ${targetDuration || project.targetDuration || 60} seconds long. Return a JSON object with "title", "description", and "scenes" array where each scene has "title", "script", and "keywords" array.`;

    const result = await fastify.llm.completeJson([
      { role: 'user', content: prompt },
    ]);

    // Update project with generated script
    const updatedProject = await fastify.prisma.project.update({
      where: { id },
      data: {
        rawScript: JSON.stringify(result),
        status: 'scripting',
      },
    });

    return updatedProject;
  });

  // Split script into scenes
  fastify.post<{ Params: { id: string } }>('/:id/scenes/split', async (request, reply) => {
    const { id } = request.params;

    const project = await fastify.prisma.project.findUnique({
      where: { id },
      include: { scenes: true },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    if (!project.rawScript) {
      return reply.status(400).send({ error: 'No script generated yet' });
    }

    const script = JSON.parse(project.rawScript);
    const scenes = script.scenes || [];

    // Delete existing scenes
    await fastify.prisma.scene.deleteMany({
      where: { projectId: id },
    });

    // Create new scenes
    const createdScenes = await Promise.all(
      scenes.map((scene: any, index: number) =>
        fastify.prisma.scene.create({
          data: {
            projectId: id,
            orderIndex: index,
            title: scene.title,
            script: scene.script,
            keywords: scene.keywords || [],
            status: 'draft',
          },
        })
      )
    );

    // Update project status
    await fastify.prisma.project.update({
      where: { id },
      data: { status: 'draft' },
    });

    return createdScenes;
  });
};
