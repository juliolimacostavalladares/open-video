'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { useEditorStore } from '@/lib/store';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setProject } = useEditorStore();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const project = await response.json();
          setProject(project);
        }
      } catch (error) {
        console.error('Erro ao carregar projeto:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, setProject]);

  return <Editor />;
}
