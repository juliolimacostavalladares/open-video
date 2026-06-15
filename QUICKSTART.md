# Guia de Uso Rápido - Open Video Studio

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/open_video_studio?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Storage (local ou s3)
STORAGE_DRIVER="local"
LOCAL_STORAGE_PATH="./storage"

# 9Router (LLM)
AI_LLM_BASE_URL="http://localhost:20128/v1"
AI_LLM_API_KEY="sua-api-key-do-9router"
AI_LLM_MODEL="kr/claude-sonnet-4.5"

# OmniVoice (TTS)
OMNIVOICE_BASE_URL="http://localhost:8000"

# Pixabay (mídia)
PIXABAY_API_KEY="sua-api-key-do-pixabay"

# GitHub OAuth
GITHUB_ID="seu-github-oauth-id"
GITHUB_SECRET="seu-github-oauth-secret"

# NextAuth
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Obter API Keys

#### Pixabay API Key
1. Acesse https://pixabay.com/accounts/register/
2. Crie uma conta gratuita
3. Vá em https://pixabay.com/api/docs/
4. Copie sua API key

#### 9Router API Key
1. Inicie o 9Router: `pnpm infra:start`
2. Acesse http://localhost:20128
3. Configure um provider (ex.: Kiro AI - gratuito)
4. Copie a API key do dashboard

#### GitHub OAuth
1. Acesse https://github.com/settings/developers
2. Clique em "New OAuth App"
3. Configure:
   - Application name: Open Video Studio
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Copie Client ID e Client Secret

#### Gerar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 4. Iniciar Infraestrutura

```bash
# Iniciar todos os serviços (Postgres, Redis, MinIO, 9Router, OmniVoice)
pnpm infra:start

# Verificar status
docker compose ps

# Aguardar todos os serviços estarem "healthy"
```

### 5. Configurar Banco de Dados

```bash
# Aplicar migrations
pnpm db:migrate

# Popular dados iniciais
pnpm db:seed

# (Opcional) Abrir Prisma Studio para visualizar dados
pnpm db:studio
```

### 6. Iniciar Aplicação

```bash
# Iniciar web + api em paralelo
pnpm dev
```

Acesse:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **9Router Dashboard**: http://localhost:20128

## 📖 Fluxo de Trabalho

### 1. Criar Projeto

```bash
curl -X POST http://localhost:4000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Primeiro Vídeo",
    "description": "Um vídeo de demonstração",
    "theme": "tecnologia",
    "tone": "profissional",
    "targetDuration": 60
  }'
```

### 2. Gerar Roteiro com IA

```bash
curl -X POST http://localhost:4000/projects/{projectId}/script/generate \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "inteligência artificial",
    "tone": "educativo",
    "targetDuration": 60
  }'
```

### 3. Dividir em Cenas

```bash
curl -X POST http://localhost:4000/projects/{projectId}/scenes/split
```

### 4. Buscar Mídia para Cena

```bash
# Buscar imagens
curl "http://localhost:4000/scenes/{sceneId}/media/search?type=image&query=tecnologia"

# Buscar vídeos
curl "http://localhost:4000/scenes/{sceneId}/media/search?type=video&query=tecnologia"
```

### 5. Anexar Mídia à Cena

```bash
curl -X POST http://localhost:4000/scenes/{sceneId}/media \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": "12345",
    "type": "image",
    "url": "https://cdn.pixabay.com/...",
    "attribution": {
      "author": "Photographer Name",
      "source": "Pixabay",
      "sourceUrl": "https://pixabay.com/..."
    }
  }'
```

### 6. Gerar Narração (TTS)

```bash
curl -X POST http://localhost:4000/scenes/{sceneId}/tts
```

### 7. Criar Job de Render

```bash
curl -X POST http://localhost:4000/renders/project/{projectId}
```

### 8. Verificar Status do Render

```bash
curl http://localhost:4000/renders/{renderJobId}
```

## 🎨 Interface Web

### Dashboard
- Acesse http://localhost:3000/dashboard
- Veja todos os seus projetos
- Crie novos projetos

### Editor Studio (em desenvolvimento)
- Timeline interativa
- Preview de cenas
- Busca de mídia integrada
- Geração de TTS

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia web + api
pnpm build                  # Build de todos os packages
pnpm typecheck              # Verifica tipos TypeScript
pnpm lint                   # Lint de código

# Banco de Dados
pnpm db:start               # Inicia PostgreSQL
pnpm db:stop                # Para PostgreSQL
pnpm db:migrate             # Aplica migrations
pnpm db:seed                # Popula dados iniciais
pnpm db:studio              # Abre Prisma Studio

# Infraestrutura
pnpm infra:start            # Inicia Postgres, Redis, MinIO, 9Router, OmniVoice
pnpm infra:stop             # Para toda infraestrutura
pnpm infra:logs             # Logs da infraestrutura

# Limpeza
pnpm clean                  # Remove node_modules e build outputs
```

## 🐛 Troubleshooting

### Serviços não iniciam
```bash
# Verificar logs
docker compose logs -f

# Reiniciar serviços
docker compose down
pnpm infra:start
```

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Aguardar healthcheck
docker compose exec postgres pg_isready -U postgres
```

### Erro de conexão com Redis
```bash
# Verificar se Redis está rodando
docker compose ps redis

# Testar conexão
docker compose exec redis redis-cli ping
```

### 9Router não responde
```bash
# Verificar logs
docker compose logs 9router

# Acessar dashboard
open http://localhost:20128
```

### OmniVoice não responde
```bash
# Verificar logs
docker compose logs omnivoice

# Aguardar inicialização (pode demorar para baixar modelos)
docker compose logs -f omnivoice
```

## 📊 Monitoramento

### Verificar Status dos Serviços
```bash
docker compose ps
```

### Ver Logs em Tempo Real
```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f 9router
```

### Acessar MinIO Console
- URL: http://localhost:9001
- Usuário: minioadmin
- Senha: minioadmin

### Acessar 9Router Dashboard
- URL: http://localhost:20128
- Configure providers e veja uso de tokens

## 🎯 Próximos Passos

Veja [NEXT_STEPS.md](./NEXT_STEPS.md) para:
- Integrar FreeCut Editor
- Implementar renderização de vídeo
- Implementar publicação no YouTube
- Melhorar UI/UX
- Adicionar testes
- Configurar CI/CD

## 📚 Documentação

- [README.md](./README.md) - Visão geral do projeto
- [PRD.md](./PRD.md) - Product Requirements Document
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Próximos passos de desenvolvimento
