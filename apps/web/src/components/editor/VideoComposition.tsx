'use client';

import { AbsoluteFill, Img, Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene } from '@/lib/store';

interface VideoCompositionProps {
  scenes: Scene[];
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calcular duração de cada cena baseado no áudio ou tempo padrão
  const getSceneDuration = (scene: Scene): number => {
    if (scene.audioDurationSeconds) {
      return Math.round(scene.audioDurationSeconds * fps);
    }
    // Padrão: 5 segundos por cena
    return 5 * fps;
  };

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene, index) => {
        const duration = getSceneDuration(scene);
        const startFrame = currentFrame;
        currentFrame += duration;

        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={duration}>
            <AbsoluteFill>
              {/* Mídia da cena (imagem ou vídeo) */}
              {scene.asset && (
                <>
                  {scene.asset.kind === 'image' ? (
                    <Img
                      src={scene.asset.path}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <video
                      src={scene.asset.path}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </>
              )}

              {/* Overlay com título da cena */}
              <AbsoluteFill
                style={{
                  justifyContent: 'flex-end',
                  padding: '40px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {scene.title}
                </div>
              </AbsoluteFill>

              {/* Áudio da narração */}
              {scene.audioPath && (
                <Audio src={scene.audioPath} volume={1} />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
