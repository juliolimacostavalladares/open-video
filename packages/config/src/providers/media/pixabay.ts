import { MediaProvider, MediaSearchResult, StorageDriver } from '@open-video/config';

export interface PixabayConfig {
  apiKey: string;
  storage: StorageDriver;
}

interface PixabayImageHit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
}

interface PixabayVideoHit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large?: { url: string; width: number; height: number; size: number };
    medium?: { url: string; width: number; height: number; size: number };
    small?: { url: string; width: number; height: number; size: number };
    tiny?: { url: string; width: number; height: number; size: number };
  };
  user: string;
}

export class PixabayMediaProvider implements MediaProvider {
  private apiKey: string;
  private storage: StorageDriver;
  private cache: Map<string, { data: MediaSearchResult[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: PixabayConfig) {
    this.apiKey = config.apiKey;
    this.storage = config.storage;
  }

  async searchImages(
    query: string,
    options?: { page?: number; perPage?: number }
  ): Promise<MediaSearchResult[]> {
    const cacheKey = `images:${query}:${options?.page || 1}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      image_type: 'all',
      per_page: String(options?.perPage || 20),
      page: String(options?.page || 1),
      safesearch: 'true',
    });

    const response = await fetch(`https://pixabay.com/api/?${params}`);

    if (!response.ok) {
      throw new Error(`Pixabay image search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: MediaSearchResult[] = (data.hits || []).map((hit: PixabayImageHit) => ({
      id: String(hit.id),
      type: 'image' as const,
      url: hit.largeImageURL,
      thumbnailUrl: hit.previewURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
      attribution: {
        author: hit.user,
        source: 'Pixabay',
        sourceUrl: hit.pageURL,
      },
    }));

    this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  }

  async searchVideos(
    query: string,
    options?: { page?: number; perPage?: number }
  ): Promise<MediaSearchResult[]> {
    const cacheKey = `videos:${query}:${options?.page || 1}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      video_type: 'all',
      per_page: String(options?.perPage || 20),
      page: String(options?.page || 1),
      safesearch: 'true',
    });

    const response = await fetch(`https://pixabay.com/api/videos/?${params}`);

    if (!response.ok) {
      throw new Error(`Pixabay video search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: MediaSearchResult[] = (data.hits || []).map((hit: PixabayVideoHit) => {
      // Prefer medium quality, fallback to small or tiny
      const video = hit.videos.medium || hit.videos.small || hit.videos.tiny;
      if (!video) return null;

      return {
        id: String(hit.id),
        type: 'video' as const,
        url: video.url,
        width: video.width,
        height: video.height,
        duration: hit.duration,
        attribution: {
          author: hit.user,
          source: 'Pixabay',
          sourceUrl: hit.pageURL,
        },
      };
    }).filter(Boolean) as MediaSearchResult[];

    this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  }

  async download(url: string, key: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    await this.storage.put(key, buffer, contentType);
    return await this.storage.getUrl(key);
  }
}
