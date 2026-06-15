'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Search, Image, Video } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  attribution: {
    author: string;
    source: string;
    sourceUrl: string;
  };
}

export const MediaSearch: React.FC = () => {
  const { project, currentSceneId, updateScene } = useEditorStore();
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const currentScene = project?.scenes.find((s) => s.id === currentSceneId);

  const handleSearch = async () => {
    if (!query.trim() || !currentScene) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/scenes/${currentScene.id}/media/search?type=${mediaType}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar mídia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedia = async (media: MediaItem) => {
    if (!currentScene) return;

    try {
      const response = await fetch(`/api/scenes/${currentScene.id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: media.id,
          type: media.type,
          url: media.url,
          attribution: media.attribution,
        }),
      });

      if (response.ok) {
        const updatedScene = await response.json();
        updateScene(currentScene.id, updatedScene);
        setResults([]);
        setQuery('');
      }
    } catch (error) {
      console.error('Erro ao selecionar mídia:', error);
    }
  };

  if (!currentScene) {
    return (
      <div className="h-full bg-gray-800 border-l border-gray-700 p-4">
        <p className="text-gray-400 text-center">Selecione uma cena</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-white font-semibold mb-4">Buscar Mídia</h3>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant={mediaType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMediaType('image')}
            className="flex-1"
          >
            <Image className="w-4 h-4 mr-1" />
            Imagem
          </Button>
          <Button
            variant={mediaType === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMediaType('video')}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-1" />
            Vídeo
          </Button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-400">Buscando...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {results.map((media) => (
              <div
                key={media.id}
                onClick={() => handleSelectMedia(media)}
                className="cursor-pointer rounded-lg overflow-hidden border-2 border-gray-600 hover:border-blue-500 transition-all"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt="Media"
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-700 flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="p-2 bg-gray-700">
                  <p className="text-xs text-gray-400 truncate">
                    Por: {media.attribution.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-4">
            <p className="text-gray-400">Nenhum resultado encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
