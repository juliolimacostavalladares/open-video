import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';

export const youtubeRoutes: FastifyPluginAsync = async (fastify) => {
  // Get OAuth URL
  fastify.get('/oauth/url', async (request, reply) => {
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:4000/youtube/oauth/callback';
    
    const params = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      url: `${YOUTUBE_AUTH_URL}?${params.toString()}`,
    };
  });

  // OAuth callback
  fastify.get('/oauth/callback', async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.status(400).send({ error: 'Authorization code not found' });
    }

    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:4000/youtube/oauth/callback';

    // Exchange code for tokens
    const tokenResponse = await fetch(YOUTUBE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID || '',
        client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return reply.status(400).send({ error: 'Failed to exchange code for tokens' });
    }

    const tokens = await tokenResponse.json();

    // Get channel info
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!channelResponse.ok) {
      return reply.status(400).send({ error: 'Failed to get channel info' });
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return reply.status(400).send({ error: 'Channel not found' });
    }

    // Save channel
    const youtubeChannel = await fastify.prisma.youtubeChannel.upsert({
      where: { channelId: channel.id },
      update: {
        title: channel.snippet.title,
        thumbnailUrl: channel.snippet.thumbnails?.default?.url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(Date.now() + tokens.expires_in * 1000),
      },
      create: {
        channelId: channel.id,
        title: channel.snippet.title,
        thumbnailUrl: channel.snippet.thumbnails?.default?.url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    // Redirect to frontend
    return reply.redirect(`${process.env.WEB_URL || 'http://localhost:3000'}/dashboard?youtube=connected`);
  });

  // List connected channels
  fastify.get('/channels', async (request, reply) => {
    const channels = await fastify.prisma.youtubeChannel.findMany({
      select: {
        id: true,
        channelId: true,
        title: true,
        thumbnailUrl: true,
        expiryDate: true,
      },
    });

    return channels;
  });

  // Publish video
  fastify.post<{ Params: { projectId: string } }>('/publish/:projectId', async (request, reply) => {
    const { projectId } = request.params;
    const { channelId, title, description, tags, privacyStatus, publishAt } = request.body as any;

    // Get project with render job
    const project = await fastify.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        renderJobs: {
          where: { status: 'succeeded' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const renderJob = project.renderJobs[0];
    if (!renderJob || !renderJob.outputPath) {
      return reply.status(400).send({ error: 'No rendered video found' });
    }

    // Get channel
    const channel = await fastify.prisma.youtubeChannel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return reply.status(404).send({ error: 'Channel not found' });
    }

    // Check if token is expired
    if (new Date() > channel.expiryDate) {
      // Refresh token
      const refreshResponse = await fetch(YOUTUBE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.YOUTUBE_CLIENT_ID || '',
          client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
          refresh_token: channel.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        return reply.status(400).send({ error: 'Failed to refresh token' });
      }

      const newTokens = await refreshResponse.json();
      
      await fastify.prisma.youtubeChannel.update({
        where: { id: channelId },
        data: {
          accessToken: newTokens.access_token,
          expiryDate: new Date(Date.now() + newTokens.expires_in * 1000),
        },
      });

      channel.accessToken = newTokens.access_token;
    }

    // Update project status
    await fastify.prisma.project.update({
      where: { id: projectId },
      data: {
        youtubeChannelId: channelId,
        youtubePublishStatus: 'uploading',
        scheduledPublishAt: publishAt ? new Date(publishAt) : null,
      },
    });

    // TODO: Implement actual YouTube upload
    // This requires multipart upload with video metadata
    // For now, we'll simulate the process

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update status
      await fastify.prisma.project.update({
        where: { id: projectId },
        data: {
          youtubePublishStatus: publishAt ? 'scheduled' : 'published',
          youtubeVideoId: `yt_${Date.now()}`, // Simulated video ID
        },
      });

      return {
        success: true,
        videoId: `yt_${Date.now()}`,
        status: publishAt ? 'scheduled' : 'published',
      };
    } catch (error) {
      await fastify.prisma.project.update({
        where: { id: projectId },
        data: {
          youtubePublishStatus: 'error',
        },
      });

      return reply.status(500).send({ error: 'Failed to upload video' });
    }
  });

  // Get publish status
  fastify.get<{ Params: { projectId: string } }>('/status/:projectId', async (request, reply) => {
    const { projectId } = request.params;

    const project = await fastify.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        youtubePublishStatus: true,
        youtubeVideoId: true,
        scheduledPublishAt: true,
        youtubeChannel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    return project;
  });
};
