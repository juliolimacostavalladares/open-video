import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { prisma } from '@open-video/database';

describe('Renders API', () => {
  let app: FastifyInstance;
  let projectId: string;
  let sceneId: string;

  beforeAll(async () => {
    app = Fastify();
    
    // Create test project and scene
    const project = await prisma.project.create({
      data: {
        title: 'Test Project for Renders',
        description: 'Test Description',
      },
    });
    projectId = project.id;

    const scene = await prisma.scene.create({
      data: {
        projectId,
        title: 'Test Scene',
        script: 'Test script',
        orderIndex: 0,
        keywords: ['test'],
      },
    });
    sceneId = scene.id;

    // Register routes
    await app.register(async (fastify) => {
      fastify.post('/projects/:projectId/render', async (request) => {
        const { projectId } = request.params as any;
        
        return prisma.renderJob.create({
          data: {
            projectId,
            status: 'queued',
          },
        });
      });

      fastify.get('/renders/:id', async (request) => {
        const { id } = request.params as any;
        return prisma.renderJob.findUnique({
          where: { id },
        });
      });

      fastify.get('/projects/:projectId/renders', async (request) => {
        const { projectId } = request.params as any;
        return prisma.renderJob.findMany({
          where: { projectId },
          orderBy: { createdAt: 'desc' },
        });
      });
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.renderJob.deleteMany({ where: { projectId } });
    await prisma.scene.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    await app.close();
  });

  it('should create a render job', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/render`,
      payload: {},
    });

    expect(response.statusCode).toBe(200);
    const render = JSON.parse(response.payload);
    expect(render.projectId).toBe(projectId);
    expect(render.status).toBe('queued');
  });

  it('should get render job by id', async () => {
    // Create a render job first
    const createResponse = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/render`,
      payload: {},
    });

    const created = JSON.parse(createResponse.payload);

    const response = await app.inject({
      method: 'GET',
      url: `/renders/${created.id}`,
    });

    expect(response.statusCode).toBe(200);
    const render = JSON.parse(response.payload);
    expect(render.id).toBe(created.id);
  });

  it('should list render jobs for project', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/renders`,
    });

    expect(response.statusCode).toBe(200);
    const renders = JSON.parse(response.payload);
    expect(Array.isArray(renders)).toBe(true);
    expect(renders.length).toBeGreaterThan(0);
  });
});
