'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Youtube, CheckCircle, XCircle, Clock } from 'lucide-react';

interface YoutubeChannel {
  id: string;
  channelId: string;
  title: string;
  thumbnailUrl?: string;
  expiryDate: string;
}

interface YoutubePublishStatus {
  youtubePublishStatus: string;
  youtubeVideoId?: string;
  scheduledPublishAt?: string;
  youtubeChannel?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  } | null;
}

export const YoutubePublish: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [status, setStatus] = useState<YoutubePublishStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchChannels();
    fetchStatus();
  }, [projectId]);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/youtube/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/youtube/status/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/youtube/oauth/url';
  };

  const handlePublish = async () => {
    if (!selectedChannel) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/youtube/publish/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel,
          title: 'Video Title',
          description: 'Video Description',
          tags: ['open-video-studio'],
          privacyStatus: 'private',
        }),
      });

      if (res.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setPublishing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status?.youtubePublishStatus) {
      case 'published':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="w-5 h-5 text-red-500" />
        <h3 className="text-white font-semibold">Publicar no YouTube</h3>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">Nenhum canal conectado</p>
          <Button onClick={handleConnect}>
            <Youtube className="w-4 h-4 mr-2" />
            Conectar Canal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {status?.youtubePublishStatus && (
            <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
              {getStatusIcon()}
              <span className="text-white capitalize">
                Status: {status.youtubePublishStatus}
              </span>
              {status.youtubeVideoId && (
                <a
                  href={`https://youtube.com/watch?v=${status.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline ml-auto"
                >
                  Ver vídeo
                </a>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Selecionar Canal
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione um canal...</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handlePublish}
            disabled={!selectedChannel || publishing}
            className="w-full"
          >
            {publishing ? 'Publicando...' : 'Publicar Vídeo'}
          </Button>
        </div>
      )}
    </div>
  );
};
