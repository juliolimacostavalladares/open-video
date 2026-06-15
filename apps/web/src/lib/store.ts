import { create } from 'zustand';

export interface Scene {
  id: string;
  orderIndex: number;
  title: string;
  script: string;
  keywords: string[];
  status: string;
  assetId?: string;
  asset?: {
    id: string;
    kind: 'image' | 'video' | 'audio';
    path: string;
    mimeType?: string;
  };
  audioPath?: string;
  audioMimeType?: string;
  audioDurationSeconds?: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  theme?: string;
  tone?: string;
  targetDuration?: number;
  status: string;
  scenes: Scene[];
}

interface EditorState {
  project: Project | null;
  currentSceneId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  setProject: (project: Project) => void;
  setCurrentScene: (sceneId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  addScene: (scene: Scene) => void;
  removeScene: (sceneId: string) => void;
  reorderScenes: (scenes: Scene[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  currentSceneId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,

  setProject: (project) => set({ project }),
  
  setCurrentScene: (sceneId) => set({ currentSceneId: sceneId }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  updateScene: (sceneId, updates) =>
    set((state) => {
      if (!state.project) return state;
      
      const updatedScenes = state.project.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      );
      
      return {
        project: {
          ...state.project,
          scenes: updatedScenes,
        },
      };
    }),
  
  addScene: (scene) =>
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          scenes: [...state.project.scenes, scene],
        },
      };
    }),
  
  removeScene: (sceneId) =>
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          scenes: state.project.scenes.filter((s) => s.id !== sceneId),
        },
      };
    }),
  
  reorderScenes: (scenes) =>
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          scenes,
        },
      };
    }),
}));
