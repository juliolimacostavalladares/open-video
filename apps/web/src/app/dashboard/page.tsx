import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Film, Clock, MoreVertical } from 'lucide-react';

export default function DashboardPage() {
  const projects = [
    {
      id: 1,
      title: 'Projeto de Exemplo',
      description: 'Um projeto de demonstração para mostrar o fluxo de trabalho.',
      status: 'draft',
      createdAt: '2 dias atrás',
      scenes: 5,
    },
    {
      id: 2,
      title: 'Vídeo de Marketing',
      description: 'Campanha de lançamento do produto Q1 2024.',
      status: 'rendering',
      createdAt: '1 semana atrás',
      scenes: 12,
    },
    {
      id: 3,
      title: 'Tutorial de Produto',
      description: 'Guia passo a passo para novos usuários.',
      status: 'approved',
      createdAt: '3 semanas atrás',
      scenes: 8,
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'rendering':
        return 'warning';
      case 'approved':
        return 'success';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Open Video Studio</h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus projetos de vídeo</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} variant="outline" className="hover:shadow-medium transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Film className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{project.scenes} cenas</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status === 'draft' && 'Rascunho'}
                      {project.status === 'rendering' && 'Renderizando'}
                      {project.status === 'approved' && 'Aprovado'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {project.createdAt}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>Abrir Projeto</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no projects) */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando seu primeiro projeto de vídeo.
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Criar Projeto
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
