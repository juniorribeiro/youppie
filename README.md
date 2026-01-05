# Youppie

Sistema completo de criação e execução de quizzes interativos com editor de texto rico, gerenciamento de imagens e múltiplos tipos de steps. O Youppie permite criar experiências de quiz personalizadas com editor visual avançado, captura de leads, análise de resultados e muito mais.

## 📖 Sobre o Projeto

O **Youppie** é uma plataforma completa para criação e execução de quizzes interativos. Com ele, você pode:

- **Criar quizzes personalizados** com um editor de texto rico e visual
- **Gerenciar imagens** em uma biblioteca centralizada
- **Capturar leads** através de formulários integrados
- **Analisar resultados** e acompanhar o desempenho dos quizzes
- **Publicar quizzes** com URLs personalizadas e compartilháveis

### O que o Youppie faz?

O Youppie é uma ferramenta que permite criar experiências interativas de quiz para engajamento, captura de leads, educação ou entretenimento. Com um editor visual poderoso baseado em Tiptap, você pode criar conteúdo rico com formatação completa, imagens, e diferentes tipos de steps (perguntas, textos informativos, captura de dados e páginas de resultado).

A plataforma oferece um dashboard completo para gerenciar seus quizzes, visualizar estatísticas, gerenciar leads capturados e muito mais. Tudo isso com uma arquitetura moderna, escalável e containerizada.

## Estrutura do Projeto

Este é um monorepo contendo:
- `apps/api`: Backend NestJS com API REST
- `apps/web`: Frontend Next.js (App Router) com editor rico
- `packages/ui`: Componentes React compartilhados
- `prisma`: Schema do banco de dados
- `docker`: Dockerfiles para desenvolvimento e produção

## 🚀 Ambiente de Desenvolvimento

Como subir o ambiente de desenvolvimento:

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- Yarn

### Instalação

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Execute via Docker Compose:
   ```bash
   docker compose up --build
   ```

   Isso iniciará:
   - PostgreSQL na porta 5432
   - API NestJS na porta 3003
   - Frontend Next.js na porta 3002

3. Acesse a aplicação:
   - Frontend: http://localhost:3002
   - API: http://localhost:3003

### Desenvolvimento Local

- Iniciar todos os apps:
  ```bash
  yarn dev
  ```

- Build de todos os apps:
  ```bash
  yarn build
  ```

## 📦 Ambiente de Produção

Como subir o ambiente de produção:

### Configuração

1. **Copie o arquivo de exemplo de variáveis de ambiente:**
   ```bash
   cp env-example.prod .env.prod
   ```

2. **Edite o arquivo `.env.prod` com seus valores:**
   ```bash
   # Banco de Dados
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI
   POSTGRES_DB=quiz_builder

   # API
   API_URL=https://api.seudominio.com
   API_PORT=3003
   JWT_SECRET=SEU_JWT_SECRET_SUPER_SEGURO_AQUI

   # Frontend
   NEXT_PUBLIC_API_URL=https://api.seudominio.com
   WEB_PORT=3002
   ```

3. **Gere um JWT_SECRET seguro:**
   ```bash
   openssl rand -base64 32
   ```

### Deploy

1. **Inicie os serviços em produção:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

2. **Execute as migrações do banco de dados:**
   ```bash
   docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
   ```

3. **Verifique o status dos serviços:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

4. **Visualize os logs:**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

### Parar os Serviços

```bash
docker compose -f docker-compose.prod.yml down
```

### Backup do Banco de Dados

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres quiz_builder > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U postgres quiz_builder < backup.sql
```

## 🔒 Segurança em Produção

⚠️ **IMPORTANTE:**
- **NUNCA** commite o arquivo `.env.prod` no git
- Use senhas fortes e únicas para o banco de dados
- Gere um JWT_SECRET aleatório e seguro
- Configure SSL/TLS usando um proxy reverso (nginx, traefik, etc.)
- Rotacione o JWT_SECRET periodicamente
- Mantenha backups regulares do banco de dados
- Configure firewall adequadamente
- Use variáveis de ambiente seguras no seu provedor de cloud

## 🎨 Funcionalidades

### Editor de Texto Rico
- Formatação completa (negrito, itálico, títulos, listas)
- Alinhamento de texto (esquerda, centro, direita)
- Tamanho de fonte customizado (8px a 72px)
- Cor de texto personalizada
- Inserção de imagens com alinhamento
- Biblioteca de imagens com metadados
- Edição de código fonte HTML
- Drag-and-drop para reordenar conteúdo

### Tipos de Steps
- **QUESTION**: Perguntas com múltiplas opções
- **TEXT**: Texto informativo com editor rico
- **CAPTURE**: Captura de dados do usuário (nome, email)
- **RESULT**: Resultado final com conteúdo rico e CTA

### Gerenciamento de Imagens
- Upload de imagens (PNG, JPG, GIF, WebP até 5MB)
- Biblioteca de imagens com visualização
- Informações de dimensões e tamanho
- Deletar imagens da biblioteca
- Alinhamento de imagens (esquerda, centro, direita)

## 📁 Arquivos de Configuração

- `docker-compose.yml`: Configuração para desenvolvimento
- `docker-compose.prod.yml`: Configuração para produção
- `env-example.prod`: Exemplo de variáveis de ambiente para produção
- `docker/Dockerfile.api`: Dockerfile da API
- `docker/Dockerfile.web`: Dockerfile do Frontend

## 🛠️ Tecnologias

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Editor**: Tiptap
- **Containerização**: Docker, Docker Compose

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev              # Inicia todos os apps em modo desenvolvimento
yarn build            # Build de todos os apps

# Docker
docker compose up     # Inicia ambiente de desenvolvimento
docker compose down   # Para ambiente de desenvolvimento
docker compose -f docker-compose.prod.yml up -d  # Inicia produção
```

## 🐛 Troubleshooting

### Problemas comuns

1. **Erro de conexão com banco de dados:**
   - Verifique se o container do PostgreSQL está rodando
   - Confirme as credenciais no arquivo `.env.prod`

2. **Imagens não aparecem:**
   - Verifique se o volume `uploads_data_prod` está criado
   - Confirme que a variável `API_URL` está correta

3. **Health checks falhando:**
   - Aguarde alguns segundos após iniciar os containers
   - Verifique os logs: `docker compose logs api`

## 📄 Licença

Este projeto é privado e proprietário.
