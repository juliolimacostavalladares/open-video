# Guia Prático de Uso - Open Video Studio

## 🚀 Começando Agora

### 1. Configuração Inicial (5 minutos)

```bash
# Clone o repositório (se ainda não fez)
cd /Users/macbookpro/Documents/open-video

# Instale as dependências
pnpm install

# Copie o arquivo de ambiente
cp .env.example .env
```

### 2. Obter API Keys Necessárias

#### Pixabay API Key (Gratuito)
1. Acesse: https://pixabay.com/accounts/register/
2. Crie uma conta gratuita
3. Vá em: https://pixabay.com/api/docs/
4. Copie sua API key
5. Adicione no `.env`:
   ```
   PIXABAY_API_KEY=sua_key_aqui
   ```

#### 9Router API Key (LLM)
1. O 9Router será iniciado automaticamente com Docker
2. Acesse: http://localhost:20128
3. Configure um provider (ex.: OpenAI, Anthropic, etc.)
4. Copie a API key do dashboard
5. Adicione no `.env`:
   ```
   AI_LLM_API_KEY=sua_key_aqui
   ```

#### GitHub OAuth (Opcional - para login)
1. Acesse: https://github.com/settings/developers
2. Clique em "New OAuth App"
3. Configure:
   - Application name: Open Video Studio
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Copie Client ID e Client Secret
5. Adicione no `.env`:
   ```
   GITHUB_ID=seu_client_id
   GITHUB_SECRET=seu_client_secret
   NEXTAUTH_SECRET=gerado_com_openssl_rand_base64_32
   ```

### 3. Iniciar Infraestrutura

```bash
# Iniciar todos os serviços (Postgres, Redis, MinIO, 9Router, OmniVoice)
pnpm infra:start

# Verificar status
docker compose ps

# Aguardar todos os serviços estarem "healthy" (pode levar 1-2 minutos)
```

### 4. Configurar Banco de Dados

```bash
# Aplicar migrations
pnpm db:migrate

# Popular dados iniciais
pnpm db:seed

# (Opcional) Abrir Prisma Studio para visualizar dados
pnpm db:studio
```

### 5. Iniciar Aplicação

```bash
# Iniciar web + api em paralelo
pnpm dev
```

Acesse:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **9Router Dashboard**: http://localhost:20128

---

## 📖 Testando o Fluxo Completo

### Passo 1: Criar um Projeto

```bash
curl -X POST http://localhost:4000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Primeiro Vídeo",
    "description": "Um vídeo de demonstração sobre tecnologia",
    "theme": "tecnologia",
    "tone": "profissional",
    "targetDuration": 60
  }'
```

**Resposta esperada:**
```json
{
  "id": "clx...",
  "title": "Meu Primeiro Vídeo",
  "status": "draft",
  ...
}
```

**Guarde o `id` do projeto para os próximos passos.**

### Passo 2: Gerar Roteiro com IA

```bash
curl -X POST http://localhost:4000/projects/{PROJECT_ID}/script/generate \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "inteligência artificial",
    "tone": "educativo",
    "targetDuration": 60
  }'
```

**Resposta esperada:**
```json
{
  "id": "clx...",
  "rawScript": "{\"title\":\"...\",\"scenes\":[...]}",
  "status": "scripting",
  ...
}
```

### Passo 3: Dividir em Cenas

```bash
curl -X POST http://localhost:4000/projects/{PROJECT_ID}/scenes/split
```

**Resposta esperada:**
```json
[
  {
    "id": "scene1...",
    "title": "Introdução",
    "script": "Bem-vindo ao mundo da IA...",
    "keywords": ["ia", "tecnologia"],
    "orderIndex": 0,
    "status": "draft"
  },
  ...
]
```

### Passo 4: Buscar Mídia para uma Cena

```bash
# Buscar imagens
curl "http://localhost:4000/scenes/{SCENE_ID}/media/search?type=image&query=tecnologia"

# Buscar vídeos
curl "http://localhost:4000/scenes/{SCENE_ID}/media/search?type=video&query=tecnologia"
```

**Resposta esperada:**
```json
{
  "results": [
    {
      "id": "12345",
      "type": "image",
      "url": "https://cdn.pixabay.com/...",
      "attribution": {
        "author": "Photographer Name",
        "source": "Pixabay",
        "sourceUrl": "https://pixabay.com/..."
      }
    },
    ...
  ]
}
```

### Passo 5: Anexar Mídia à Cena

```bash
curl -X POST http://localhost:4000/scenes/{SCENE_ID}/media \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": "12345",
    "type": "image",
    "url": "https://cdn.pixabay.com/photo/...",
    "attribution": {
      "author": "Photographer Name",
      "source": "Pixabay",
      "sourceUrl": "https://pixabay.com/photos/..."
    }
  }'
```

### Passo 6: Gerar Narração (TTS)

```bash
curl -X POST http://localhost:4000/scenes/{SCENE_ID}/tts
```

**Resposta esperada:**
```json
{
  "id": "scene1...",
  "audioPath": "/storage/tts/...",
  "audioMimeType": "audio/wav",
  "audioDurationSeconds": 5.2,
  "status": "tts_ready"
}
```

### Passo 7: Criar Job de Render

```bash
curl -X POST http://localhost:4000/renders/project/{PROJECT_ID}
```

**Resposta esperada:**
```json
{
  "id": "render1...",
  "projectId": "clx...",
  "status": "queued",
  "createdAt": "2026-03-14T..."
}
```

### Passo 8: Verificar Status do Render

```bash
curl http://localhost:4000/renders/{RENDER_JOB_ID}
```

**Resposta esperada:**
```json
{
  "id": "render1...",
  "status": "succeeded",
  "outputPath": "/storage/renders/...",
  "completedAt": "2026-03-14T..."
}
```

---

## 🎨 Usando a Interface Web

### Dashboard
1. Acesse: http://localhost:3000/dashboard
2. Veja todos os seus projetos
3. Clique em "Novo Projeto" para criar

### Editor Studio
1. Clique em um projeto para abrir o editor
2. **Timeline**: Veja todas as cenas em ordem
3. **Preview**: Visualize o vídeo
4. **Scene Panel**: Edite título, roteiro e keywords
5. **Media Search**: Busque imagens/vídeos no Pixabay
6. **TTS**: Gere narração para cada cena

### Biblioteca de Vozes
1. Acesse: http://localhost:3000/voice-profiles
2. Crie perfis de voz
3. Faça upload de amostras de áudio
4. Clone vozes com OmniVoice

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
pnpm dev              # Inicia web + api
pnpm build            # Build de todos os packages
pnpm typecheck        # Verifica tipos TypeScript
pnpm lint             # Lint de código
```

### Banco de Dados
```bash
pnpm db:start         # Inicia PostgreSQL
pnpm db:stop          # Para PostgreSQL
pnpm db:migrate       # Aplica migrations
pnpm db:seed          # Popula dados iniciais
pnpm db:studio        # Abre Prisma Studio
```

### Infraestrutura
```bash
pnpm infra:start      # Inicia Postgres, Redis, MinIO, 9Router, OmniVoice
pnpm infra:stop       # Para toda infraestrutura
pnpm infra:logs       # Logs da infraestrutura
```

### Limpeza
```bash
pnpm clean            # Remove node_modules e build outputs
```

---

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

### Erro ao buscar mídia no Pixabay
- Verifique se a API key está correta no `.env`
- Verifique se a key não expirou
- Verifique os logs da API: `docker compose logs api`

---

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

---

## 🎯 Próximos Passos

Após testar o fluxo básico, você pode:

1. **Melhorar a UI/UX** do editor
2. **Adicionar mais templates** de vídeo
3. **Implementar renderização real** com Remotion
4. **Adicionar mais providers** de TTS
5. **Integrar com outras plataformas** (Vimeo, TikTok)
6. **Adicionar colaboração** em tempo real
7. **Criar API pública** documentada

Veja [NEXT_STEPS.md](./NEXT_STEPS.md) para mais detalhes.

---

## 📚 Documentação Completa

- [README.md](./README.md) - Visão geral do projeto
- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido de setup
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Próximos passos de desenvolvimento
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Status detalhado
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - Resumo completo
- [PRD.md](./PRD.md) - Product Requirements Document

---

## 🎉 Pronto para Usar!

O **Open Video Studio** está pronto para uso. Você pode:

✅ Criar projetos de vídeo  
✅ Gerar roteiros com IA  
✅ Buscar mídia stock (Pixabay)  
✅ Gerar narração (OmniVoice)  
✅ Editar na timeline  
✅ Renderizar vídeos  
✅ Publicar no YouTube  

**Divirta-se criando vídeos!** 🎬
