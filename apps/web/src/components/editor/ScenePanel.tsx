'use client';

import { useEditorStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';

export const ScenePanel: React.FC = () => {
  const { project, currentSceneId, updateScene, removeScene } = useEditorStore();

  const currentScene = project?.scenes.find((s) => s.id === currentSceneId);

  if (!currentScene) {
    return (
      <div className="h-full bg-gray-800 border-l border-gray-700 p-4">
        <p className="text-gray-400 text-center">Selecione uma cena</p>
      </div>
    );
  }

  const handleUpdateTitle = (title: string) => {
    updateScene(currentScene.id, { title });
  };

  const handleUpdateScript = (script: string) => {
    updateScene(currentScene.id, { script });
  };

  const handleRemove = () => {
    if (confirm('Tem certeza que deseja remover esta cena?')) {
      removeScene(currentScene.id);
    }
  };

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Editar Cena</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Título</label>
          <input
            type="text"
            value={currentScene.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Roteiro</label>
          <textarea
            value={currentScene.script}
            onChange={(e) => handleUpdateScript(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Palavras-chave</label>
          <div className="flex flex-wrap gap-2">
            {currentScene.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Status</label>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-sm rounded ${
                currentScene.status === 'ready'
                  ? 'bg-green-600/20 text-green-400'
                  : currentScene.status === 'media_ready'
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-gray-600/20 text-gray-400'
              }`}
            >
              {currentScene.status}
            </span>
          </div>
        </div>

        {currentScene.asset && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mídia</label>
            <div className="p-2 bg-gray-700 rounded-lg">
              <p className="text-sm text-white">{currentScene.asset.kind}</p>
              <p className="text-xs text-gray-400 truncate">{currentScene.asset.path}</p>
            </div>
          </div>
        )}

        {currentScene.audioPath && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Áudio TTS</label>
            <div className="p-2 bg-gray-700 rounded-lg">
              <p className="text-sm text-white">
                Duração: {currentScene.audioDurationSeconds?.toFixed(1)}s
              </p>
              <audio controls className="w-full mt-2" src={currentScene.audioPath} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
