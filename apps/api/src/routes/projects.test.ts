import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { prisma } from '@open-video/database';

describe('Projects API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    
    // Register routes
    await app.register(async (fastify) => {
      fastify.get('/projects', async () => {
        return prisma.project.findMany();
      });

      fastify.post('/projects', async (request) => {
        const { title, description } = request.body as any;
        return prisma.project.create({
          data: { title, description },
        });
      });

      fastify.get('/projects/:id', async (request) => {
        const { id } = request.params as any;
        return prisma.project.findUnique({ where: { id } });
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a project', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        title: 'Test Project',
        description: 'Test Description',
      },
    });

    expect(response.statusCode).toBe(200);
    const project = JSON.parse(response.payload);
    expect(project.title).toBe('Test Project');
    expect(project.id).toBeDefined();
  });

  it('should list projects', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/projects',
    });

    expect(response.statusCode).toBe(200);
    const projects = JSON.parse(response.payload);
    expect(Array.isArray(projects)).toBe(true);
  });

  it('should get project by id', async () => {
    // Create a project first
    const createResponse = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        title: 'Test Project 2',
        description: 'Test Description 2',
      },
    });

    const created = JSON.parse(createResponse.payload);

    const response = await app.inject({
      method: 'GET',
      url: `/projects/${created.id}`,
    });

    expect(response.statusCode).toBe(200);
    const project = JSON.parse(response.payload);
    expect(project.id).toBe(created.id);
  });
});
