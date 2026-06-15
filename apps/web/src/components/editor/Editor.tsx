'use client';

import { useState } from 'react';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { ScenePanel } from './ScenePanel';
import { MediaSearch } from './MediaSearch';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/lib/store';
import { Sparkles, Mic, Download, Play } from 'lucide-react';

export const Editor: React.FC = () => {
  const { project, currentSceneId } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'scenes' | 'media' | 'tts'>('scenes');
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');

  const handleGenerateScript = async () => {
    setGeneratingStep('');
    if (!project) return;
    
    setGenerating(true);
    setGeneratingStep('Gerando roteiro com IA...');
    try {
      // 1. Generate the raw script
      const genRes = await fetch(`/api/projects/${project.id}/script/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: project.theme,
          tone: project.tone,
          targetDuration: project.targetDuration,
        }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${genRes.status} ao gerar roteiro`);
      }

      // 2. Split into scenes
      const splitRes = await fetch(`/api/projects/${project.id}/scenes/split`, {
        method: 'POST',
      });

      if (!splitRes.ok) {
        const err = await splitRes.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${splitRes.status} ao dividir cenas`);
      }

      const scenes: { id: string; keywords: string[] }[] = await splitRes.json();
      setGeneratingStep(`Buscando imagens para ${scenes.length} cenas...`);

      // 3. Auto-attach Pixabay image for each scene (best effort, don't block on failure)
      await Promise.allSettled(
        scenes.map(async (scene) => {
          try {
            const query = encodeURIComponent(scene.keywords.slice(0, 3).join(' '));
            const searchRes = await fetch(
              `/api/scenes/${scene.id}/media/search?type=image&query=${query}`
            );
            if (!searchRes.ok) return;
            const { results } = await searchRes.json();
            const best = results?.[0];
            if (!best) return;

            await fetch(`/api/scenes/${scene.id}/media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mediaId: best.id,
                type: 'image',
                url: best.url,
                attribution: best.attribution,
              }),
            });
          } catch {
            // silent — user can manually pick later
          }
        })
      );

      // 4. Reload project with updated scenes + assets
      setGeneratingStep('Finalizando...');
      const projectRes = await fetch(`/api/projects/${project.id}`);
      if (projectRes.ok) {
        const updatedProject = await projectRes.json();
        useEditorStore.getState().setProject(updatedProject);
        // Auto-select first scene
        if (updatedProject.scenes.length > 0) {
          useEditorStore.getState().setCurrentScene(updatedProject.scenes[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao gerar roteiro');
    } finally {
      setGenerating(false);
      setGeneratingStep('');
    }
  };

  const handleGenerateTTS = async () => {
    if (!currentSceneId) return;

    setGenerating(true);
    try {
      const response = await fetch(`/api/scenes/${currentSceneId}/tts`, {
        method: 'POST',
      });

      if (response.ok) {
        // Recarregar para ver atualizações
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao gerar TTS:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleRender = async () => {
    if (!project) return;

    setGenerating(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/render`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Renderização iniciada! Você pode acompanhar o progresso no dashboard.');
      }
    } catch (error) {
      console.error('Erro ao iniciar render:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Carregando projeto...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-gray-400">{project.scenes.length} cenas</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateScript}
            disabled={generating}
            variant="outline"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating && generatingStep ? generatingStep : 'Gerar Roteiro'}
          </Button>

          <Button
            onClick={handleGenerateTTS}
            disabled={generating || !currentSceneId}
            variant="outline"
          >
            <Mic className="w-4 h-4 mr-2" />
            Gerar TTS
          </Button>

          <Button
            onClick={handleRender}
            disabled={generating}
          >
            <Download className="w-4 h-4 mr-2" />
            Renderizar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scene Editor */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('scenes')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'scenes'
                  ? 'text-white bg-gray-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cenas
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'media'
                  ? 'text-white bg-gray-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mídia
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'scenes' && <ScenePanel />}
            {activeTab === 'media' && <MediaSearch />}
          </div>
        </div>

        {/* Center - Video Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <VideoPreview />
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-gray-700">
            <Timeline />
          </div>
        </div>
      </div>
    </div>
  );
};
