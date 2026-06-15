# Open Video Studio

Plataforma web open-source para criação automatizada de vídeos com IA.

## 🚀 Funcionalidades

- **Geração de Roteiro com IA**: Use LLM (via 9Router) para gerar roteiros estruturados
- **Busca de Mídia Inteligente**: Encontre imagens e vídeos royalty-free via Pixabay
- **Síntese de Voz**: Clone vozes e gere narração com OmniVoice
- **Editor de Vídeo Profissional**: Timeline interativa com FreeCut (MIT)
- **Publicação no YouTube**: Upload direto com agendamento
- **Fluxo de Aprovação**: Review e aprovação de vídeos

## 🏗️ Arquitetura

```
open-video-studio/
├── apps/
│   ├── web/        # Frontend Next.js (App Router)
│   └── api/        # Backend Fastify
└── packages/
    ├── config/     # Configuração, interfaces e providers
    └── database/   # Schema Prisma e migrations
```

### Stack Técnica

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + NextAuth
- **Backend**: Fastify + TypeScript + BullMQ
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Storage**: MinIO (S3) ou filesystem local
- **Editor**: FreeCut (MIT) - render no browser via WebCodecs
- **LLM**: 9Router (OpenAI-compatible)
- **TTS**: OmniVoice Studio (clonagem de voz)
- **Mídia**: Pixabay API (imagens + vídeos)

## 📋 Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker e Docker Compose

## 🛠️ Setup Local

### 1. Clone o repositório

```bash
git clone <your-repo-url>
cd open-video-studio
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e configure:

- **Database**: `DATABASE_URL` (PostgreSQL)
- **Redis**: `REDIS_URL`
- **Storage**: `STORAGE_DRIVER` (local ou s3)
- **9Router**: `AI_LLM_BASE_URL`, `AI_LLM_API_KEY`, `AI_LLM_MODEL`
- **OmniVoice**: `OMNIVOICE_BASE_URL`
- **Pixabay**: `PIXABAY_API_KEY`
- **GitHub OAuth**: `GITHUB_ID`, `GITHUB_SECRET`
- **NextAuth**: `NEXTAUTH_SECRET` (gere com `openssl rand -base64 32`)

### 4. Inicie a infraestrutura

```bash
pnpm infra:start
```

Isso inicia:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- MinIO (porta 9000, console em 9001)
- 9Router (porta 20128)
- OmniVoice (porta 8000)

### 5. Configure o banco de dados

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Inicie os serviços

```bash
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **9Router Dashboard**: http://localhost:20128

## 📚 Scripts

```bash
pnpm dev              # Inicia web + api em paralelo
pnpm build            # Build de todos os packages
pnpm test             # Roda testes
pnpm lint             # Lint de todos os packages
pnpm typecheck        # Type check de todos os packages

pnpm db:start         # Inicia PostgreSQL
pnpm db:stop          # Para PostgreSQL
pnpm db:migrate       # Aplica migrations
pnpm db:seed          # Popula dados iniciais
pnpm db:studio        # Abre Prisma Studio

pnpm infra:start      # Inicia toda a infraestrutura (Postgres, Redis, MinIO, 9Router, OmniVoice)
pnpm infra:stop       # Para toda a infraestrutura
pnpm infra:logs       # Logs da infraestrutura
```

## 🔧 Configuração dos Providers

### 9Router (LLM)

1. Acesse http://localhost:20128
2. Configure um provider (ex.: Kiro AI para uso gratuito)
3. Copie a API key do dashboard
4. Configure no `.env`: `AI_LLM_API_KEY`

### OmniVoice (TTS)

1. OmniVoice roda em Docker na porta 8000
2. Para GPU (recomendado), descomente a seção `deploy` no `docker-compose.yml`
3. Configure modelos via dashboard do OmniVoice

### Pixabay

1. Crie uma conta em https://pixabay.com
2. Gere uma API key em https://pixabay.com/api/docs/
3. Configure no `.env`: `PIXABAY_API_KEY`

### GitHub OAuth

1. Crie um OAuth App em https://github.com/settings/developers
2. Configure a callback URL: `http://localhost:3000/api/auth/callback/github`
3. Configure no `.env`: `GITHUB_ID` e `GITHUB_SECRET`

## 📖 Fluxo de Trabalho

1. **Criar Projeto**: Defina título, tema, tom e duração
2. **Gerar Roteiro**: Use IA para gerar roteiro estruturado
3. **Dividir em Cenas**: O roteiro é dividido automaticamente em cenas
4. **Buscar Mídia**: Para cada cena, busque imagens/vídeos no Pixabay
5. **Gerar Narração**: Sintetize voz para cada cena com OmniVoice
6. **Editar**: Ajuste a timeline no editor FreeCut
7. **Exportar**: Renderize o vídeo final
8. **Publicar**: Envie para o YouTube (opcional)

## 🧪 Testes

```bash
pnpm test              # Todos os testes
pnpm --filter @open-video/api test      # Testes da API
pnpm --filter @open-video/config test   # Testes do config
```

## 📝 Licença

Este projeto está em desenvolvimento. A licença será definida após a escolha final das dependências.

### Licenças das Dependências

- **FreeCut**: MIT
- **OmniVoice**: AGPL-3.0 (usado como serviço externo)
- **9Router**: MIT
- **Pixabay API**: Gratuito (requer atribuição)

## 🤝 Contribuindo

Este projeto está em desenvolvimento ativo. Contribuições são bem-vindas!

## 📞 Suporte

- Issues: [GitHub Issues](https://github.com/your-org/open-video-studio/issues)
- Documentação: [Wiki](https://github.com/your-org/open-video-studio/wiki)
