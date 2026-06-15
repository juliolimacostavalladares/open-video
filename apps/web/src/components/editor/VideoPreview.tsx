'use client';

import { Player } from '@remotion/player';
import { VideoComposition } from './VideoComposition';
import { useEditorStore } from '@/lib/store';

export const VideoPreview: React.FC = () => {
  const { project, currentTime, setCurrentTime, isPlaying, setIsPlaying } = useEditorStore();

  if (!project || project.scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p>Nenhuma cena adicionada</p>
      </div>
    );
  }

  // Calcular duração total do vídeo
  const fps = 30;
  const totalDuration = project.scenes.reduce((acc, scene) => {
    const sceneDuration = scene.audioDurationSeconds || 5;
    return acc + sceneDuration;
  }, 0);

  const durationInFrames = Math.round(totalDuration * fps);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <Player
          component={VideoComposition}
          inputProps={{ scenes: project.scenes }}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={fps}
          controls
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
};
