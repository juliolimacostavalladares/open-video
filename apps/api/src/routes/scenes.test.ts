import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { prisma } from '@open-video/database';

describe('Scenes API', () => {
  let app: FastifyInstance;
  let projectId: string;

  beforeAll(async () => {
    app = Fastify();
    
    // Create test project
    const project = await prisma.project.create({
      data: {
        title: 'Test Project for Scenes',
        description: 'Test Description',
      },
    });
    projectId = project.id;

    // Register routes
    await app.register(async (fastify) => {
      fastify.get('/projects/:projectId/scenes', async (request) => {
        const { projectId } = request.params as any;
        return prisma.scene.findMany({
          where: { projectId },
          orderBy: { orderIndex: 'asc' },
        });
      });

      fastify.post('/projects/:projectId/scenes', async (request) => {
        const { projectId } = request.params as any;
        const { title, script, orderIndex, keywords } = request.body as any;
        return prisma.scene.create({
          data: {
            projectId,
            title,
            script,
            orderIndex,
            keywords,
          },
        });
      });

      fastify.get('/scenes/:id', async (request) => {
        const { id } = request.params as any;
        return prisma.scene.findUnique({
          where: { id },
          include: { asset: true },
        });
      });
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.scene.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    await app.close();
  });

  it('should create a scene', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/scenes`,
      payload: {
        title: 'Scene 1',
        script: 'This is the first scene',
        orderIndex: 0,
        keywords: ['intro', 'welcome'],
      },
    });

    expect(response.statusCode).toBe(200);
    const scene = JSON.parse(response.payload);
    expect(scene.title).toBe('Scene 1');
    expect(scene.projectId).toBe(projectId);
  });

  it('should list scenes for project', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/scenes`,
    });

    expect(response.statusCode).toBe(200);
    const scenes = JSON.parse(response.payload);
    expect(Array.isArray(scenes)).toBe(true);
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('should get scene by id', async () => {
    // Create a scene first
    const createResponse = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/scenes`,
      payload: {
        title: 'Scene 2',
        script: 'This is the second scene',
        orderIndex: 1,
        keywords: ['middle'],
      },
    });

    const created = JSON.parse(createResponse.payload);

    const response = await app.inject({
      method: 'GET',
      url: `/scenes/${created.id}`,
    });

    expect(response.statusCode).toBe(200);
    const scene = JSON.parse(response.payload);
    expect(scene.id).toBe(created.id);
  });
});
