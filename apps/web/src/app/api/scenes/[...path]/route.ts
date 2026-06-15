import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function proxy(request: NextRequest, segments: string[]) {
  const path = segments.join('/');
  const url = new URL(`/scenes/${path}`, API_BASE);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

  const responseBody = await res.arrayBuffer();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

type RouteContext = { params: { path: string[] } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  return proxy(req, params.path);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  return proxy(req, params.path);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  return proxy(req, params.path);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  return proxy(req, params.path);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return proxy(req, params.path);
}
