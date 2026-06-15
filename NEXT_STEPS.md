# Próximos Passos - Open Video Studio

## ✅ O que já foi implementado

### Fase 0 — Fundação do Monorepo
- ✅ `pnpm-workspace.yaml` configurado
- ✅ `package.json` raiz com scripts
- ✅ `tsconfig.base.json` compartilhado
- ✅ `.env.example` com todas as variáveis
- ✅ `docker-compose.yml` (Postgres, Redis, MinIO, 9Router, OmniVoice)
- ✅ `.gitignore`, `.prettierrc`, `.eslintrc.json`

### Fase 1 — packages/config
- ✅ Validação de env com zod
- ✅ Interfaces: `StorageDriver`, `LlmProvider`, `TtsProvider`, `MediaProvider`
- ✅ `LocalStorageDriver` e `S3StorageDriver` (MinIO)
- ✅ `NineRouterLlmProvider` (9Router)
- ✅ `OmniVoiceTtsProvider` (OmniVoice)
- ✅ `PixabayMediaProvider` (Pixabay)

### Fase 2 — packages/database
- ✅ Schema Prisma completo com enums
- ✅ Models: User, Project, Scene, VoiceProfile, Asset, RenderJob, YoutubeChannel, ApprovalLog
- ✅ Migration inicial
- ✅ Seed script

### Fase 3 — Storage Abstrato
- ✅ `LocalStorageDriver` (filesystem)
- ✅ `S3StorageDriver` (MinIO/S3)
- ✅ Seleção via `STORAGE_DRIVER`

### Fase 4 — Camada de IA/Mídia
- ✅ `NineRouterLlmProvider` (LLM via 9Router)
- ✅ `OmniVoiceTtsProvider` (TTS/voz via OmniVoice)
- ✅ `PixabayMediaProvider` (busca de mídia via Pixabay)

### Fase 5 — API Fastify
- ✅ Bootstrap Fastify com CORS, multipart, logger
- ✅ Rotas de Projects (CRUD + geração de roteiro)
- ✅ Rotas de Scenes (CRUD + busca de mídia + TTS)
- ✅ Rotas de VoiceProfiles (CRUD + upload de amostra)
- ✅ Rotas de Assets (upload + listagem)
- ✅ Rotas de Renders (criar job + retry)

### Fase 6 — Fila BullMQ + Workers
- ✅ Filas: `tts`, `media-fetch`, `render`
- ✅ Workers com atualização de status no Prisma
- ✅ Tratamento de erros e retry

### Fase 8 — Web (Next.js App Router)
- ✅ Setup Next.js 14 com App Router
- ✅ Tailwind CSS configurado
- ✅ NextAuth com GitHub OAuth
- ✅ Página inicial (landing page)
- ✅ Dashboard básico
- ✅ Componente Button (UI)

## 🚧 Próximos Passos

### 1. Configurar Ambiente de Desenvolvimento

```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env com suas credenciais:
# - PIXABAY_API_KEY (obter em https://pixabay.com/api/docs/)
# - GITHUB_ID e GITHUB_SECRET (criar OAuth App em https://github.com/settings/developers)
# - NEXTAUTH_SECRET (gerar com: openssl rand -base64 32)
# - AI_LLM_API_KEY (obter no dashboard do 9Router)

# Iniciar infraestrutura
pnpm infra:start

# Aguardar serviços estarem prontos (verificar com: docker compose ps)

# Aplicar migrations e seed
pnpm db:migrate
pnpm db:seed

# Iniciar serviços
pnpm dev
```

### 2. Configurar 9Router

1. Acesse http://localhost:20128
2. Configure um provider (ex.: Kiro AI para uso gratuito)
3. Copie a API key do dashboard
4. Configure no `.env`: `AI_LLM_API_KEY`

### 3. Configurar OmniVoice

1. OmniVoice roda em Docker na porta 8000
2. Para GPU (recomendado), descomente a seção `deploy` no `docker-compose.yml`
3. Configure modelos via dashboard do OmniVoice

### 4. Integrar FreeCut Editor

O FreeCut ainda não foi integrado. Próximos passos:

1. Clonar o repositório do FreeCut:
   ```bash
   git clone https://github.com/walterlow/freecut.git
   cd freecut
   npm install
   ```

2. Integrar como componente React no `apps/web`:
   - Copiar componentes necessários do FreeCut
   - Adaptar para receber dados das cenas (mídia Pixabay + áudio TTS)
   - Pré-preencher a timeline automaticamente

3. Alternativa: Usar o FreeCut como aplicação separada e integrar via iframe ou API

### 5. Implementar Renderização de Vídeo

Atualmente o worker de render apenas simula o processo. Implementar:

1. Integração com FreeCut para exportar vídeo
2. Ou usar Remotion diretamente para render server-side
3. Salvar output no storage (MinIO/local)
4. Atualizar `RenderJob.outputPath`

### 6. Implementar Publicação no YouTube

1. Configurar OAuth2 YouTube
2. Implementar rotas:
   - `GET /youtube/oauth/url`
   - `GET /youtube/oauth/callback`
   - `POST /projects/:id/publish`
3. Upload do vídeo renderizado
4. Agendamento de publicação

### 7. Implementar Fluxo de Aprovação

1. Rotas:
   - `POST /projects/:id/approve`
   - `POST /projects/:id/reject`
   - `GET /projects/:id/approval-logs`
2. Interface de review no web

### 8. Melhorar UI/UX

1. Editor Studio completo:
   - Timeline interativa
   - Preview de cenas
   - Busca de mídia Pixabay integrada
   - Geração de TTS por cena
2. Biblioteca de Vozes
3. Review de vídeo
4. Configurações YouTube

### 9. Testes

1. Testes unitários (Vitest):
   - Providers de IA
   - Storage drivers
   - Rotas da API
2. Testes de integração:
   - Fluxo completo de geração de vídeo
3. Testes E2E (Playwright):
   - Fluxo do usuário

### 10. CI/CD

1. GitHub Actions:
   - Lint + typecheck
   - Testes unit + integração
   - Build
   - Deploy para Coolify

## 📝 Notas Importantes

### Licenças

- **FreeCut**: MIT (permissivo)
- **OmniVoice**: AGPL-3.0 (usado como serviço externo via API, não contamina código)
- **9Router**: MIT (permissivo)
- **Pixabay API**: Gratuito (requer atribuição)

### Segurança

- API keys e tokens OAuth **apenas em variáveis de ambiente**
- Tokens do YouTube devem ser armazenados criptografados no banco
- Validação de input em todas as rotas (zod)

### Performance

- Cache de 24h para buscas no Pixabay
- Fila BullMQ para tarefas assíncronas (TTS, download de mídia, render)
- Storage plugável (local em dev, S3/MinIO em produção)

## 🎯 MVP Checklist

- [ ] Setup local funcionando (Docker + .env)
- [ ] Criar projeto
- [ ] Gerar roteiro com IA (9Router)
- [ ] Dividir em cenas
- [ ] Buscar mídia (Pixabay)
- [ ] Gerar TTS (OmniVoice)
- [ ] Editar no FreeCut
- [ ] Exportar vídeo
- [ ] Review e aprovação
- [ ] Publicar no YouTube (opcional)

## 📚 Recursos

- [PRD.md](./PRD.md) - Product Requirements Document
- [README.md](./README.md) - Documentação principal
- [Docker Compose](./docker-compose.yml) - Infraestrutura
- [Schema Prisma](./packages/database/prisma/schema.prisma) - Modelo de dados
