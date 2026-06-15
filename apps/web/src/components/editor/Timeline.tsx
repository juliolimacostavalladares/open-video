'use client';

import { useEditorStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const Timeline: React.FC = () => {
  const { project, currentSceneId, setCurrentScene } = useEditorStore();

  if (!project || project.scenes.length === 0) {
    return (
      <div className="h-full bg-gray-800 border-t border-gray-700 p-4">
        <p className="text-gray-400 text-center">Nenhuma cena na timeline</p>
      </div>
    );
  }

  // Calcular duração total
  const totalDuration = project.scenes.reduce((acc, scene) => {
    return acc + (scene.audioDurationSeconds || 5);
  }, 0);

  return (
    <div className="h-full bg-gray-800 border-t border-gray-700 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-white font-semibold">Timeline</h3>
        <span className="text-gray-400 text-sm">
          Duração total: {totalDuration.toFixed(1)}s
        </span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {project.scenes.map((scene, index) => {
          const duration = scene.audioDurationSeconds || 5;
          const width = (duration / totalDuration) * 100;
          
          return (
            <div
              key={scene.id}
              onClick={() => setCurrentScene(scene.id)}
              className={cn(
                'flex-shrink-0 cursor-pointer rounded-lg p-3 transition-all',
                'border-2',
                currentSceneId === scene.id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              )}
              style={{ minWidth: '120px' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">#{index + 1}</span>
                <span className="text-white text-sm font-medium truncate">
                  {scene.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{duration.toFixed(1)}s</span>
                {scene.asset && (
                  <span className="px-1.5 py-0.5 bg-gray-600 rounded">
                    {scene.asset.kind}
                  </span>
                )}
                {scene.audioPath && (
                  <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded">
                    TTS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
