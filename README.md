# 🐦 SABIU

> **Aprender do seu jeito.**

Aplicação web para registrar e visualizar sua evolução profissional através de itens de aprendizado (cursos, vídeos, livros, certificações), com sistema de dependências, múltiplas visualizações (Lista, Kanban, Fluxograma) e dashboard de progresso.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Design System](#design-system)
- [Providers Globais](#providers-globais)

---

## 🎯 Sobre o Projeto

SABIU (sabiá + sábio) é uma plataforma para você organizar e acompanhar sua jornada de aprendizado. Registre cursos, livros, certificações e visualize seu progresso de forma clara e objetiva.

### Principais diferenciais:

- 📊 **Dashboard com KPIs** - Acompanhe seu progresso geral
- 🔗 **Sistema de Dependências** - Defina pré-requisitos entre itens
- 📋 **Lista Completa** - Filtros avançados e ordenação
- 📌 **Kanban Board** - Drag-and-drop entre status
- 🌐 **Fluxograma de Dependências** - Visualize o grafo de aprendizado
- 🎨 **Tema Claro/Escuro** - Personalize sua experiência
- 📝 **Markdown Support** - Descrições ricas com formatação

---

## ✨ Funcionalidades

### Autenticação

- ✅ Cadastro com email/senha
- ✅ Login com NextAuth
- ✅ Reset de senha via email

### Gestão de Itens

- ✅ CRUD completo de itens de aprendizado
- ✅ Organização por categorias
- ✅ Tags para classificação
- ✅ Módulos/capítulos com progresso individual
- ✅ Descrições em Markdown
- ✅ Prazos e status (Backlog, Em Andamento, Pausado, Concluído)

### Visualizações

- ✅ **Lista**: Tabela com filtros e ordenação
- ✅ **Kanban**: Arrastar e soltar entre colunas
- ✅ **Fluxograma**: Grafo interativo de dependências

### Dashboard

- ✅ Total de itens por categoria
- ✅ Distribuição por status
- ✅ Progresso médio geral
- ✅ Itens próximos de concluir

---

## 🚀 Stack Tecnológica

### Frontend

- **Framework**: Next.js 15 (App Router) + React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Estado**: React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **Markdown**: react-markdown + remark-gfm
- **Drag-and-Drop**: @dnd-kit
- **Fluxograma**: React Flow
- **Tema**: next-themes
- **Ícones**: Material UI Icons

### Backend

- **Runtime**: Bun
- **API**: Next.js Route Handlers
- **Autenticação**: NextAuth.js v4
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 16
- **Email**: Resend
- **Upload**: UploadThing

### DevEx e Qualidade

- **Lint**: ESLint + eslint-plugin-jsx-a11y
- **Format**: Prettier
- **Testes**: Vitest + Testing Library
- **Type Check**: TypeScript (strict mode)

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Bun** v1.3.1 ou superior
- **Docker** (para PostgreSQL)
- **Git**

---

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sabiu-app.git
cd sabiu-app
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://sabiu:sabiu123@localhost:5432/sabiu_dev"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Resend (Email Service)
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# UploadThing (File Upload)
UPLOADTHING_SECRET="sk_your_secret_here"
UPLOADTHING_APP_ID="your_app_id_here"
```

### 4. Suba o banco de dados

```bash
docker-compose up -d
```

### 5. Execute as migrations do Prisma

```bash
bun run db:push
```

### 6. Inicie o servidor de desenvolvimento

```bash
bun run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🎮 Como Usar

### Primeiro acesso

1. Crie uma conta em `/sign-up`
2. Faça login em `/sign-in`
3. Comece adicionando suas categorias e itens de aprendizado

### Criar um Item de Aprendizado

1. Navegue para a página de Itens
2. Clique em "Novo Item"
3. Preencha: título, descrição (Markdown), categoria, prazo
4. Adicione módulos/capítulos
5. Defina dependências (pré-requisitos) se necessário
6. Salve

### Visualizações

- **Dashboard**: Visão geral do progresso
- **Lista**: Todos os itens com filtros
- **Kanban**: Arraste cards entre status
- **Fluxograma**: Visualize a ordem de aprendizado

---

## 📁 Estrutura do Projeto

```
sabiu-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas públicas (sign-in, sign-up)
│   │   ├── (protected)/       # Rotas autenticadas
│   │   │   ├── dashboard/
│   │   │   ├── items/
│   │   │   ├── kanban/
│   │   │   └── graph/
│   │   └── api/               # Route Handlers
│   ├── components/            # Componentes React
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Formulários
│   │   ├── layouts/          # Layouts
│   │   └── features/         # Features específicas
│   ├── core/                 # Clean Architecture - Domínio
│   │   ├── entities/         # Entidades
│   │   ├── use-cases/        # Casos de uso
│   │   └── interfaces/       # Contratos
│   ├── infra/                # Infraestrutura
│   │   ├── repositories/     # Prisma repositories
│   │   ├── clients/          # Clients externos
│   │   └── mappers/          # DTOs
│   └── lib/                  # Utilitários
│       ├── schemas/          # Zod schemas
│       ├── auth.ts
│       ├── prisma.ts
│       └── utils.ts
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   └── migrations/
├── public/
└── documentos/              # Docs privadas (não versionadas)
```

Para mais detalhes sobre a arquitetura, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
bun run dev           # Inicia o servidor de desenvolvimento
bun run build         # Build de produção
bun run start         # Inicia o servidor de produção
```

### Qualidade de Código

```bash
bun run lint          # Executa ESLint
bun run lint:fix      # Corrige problemas do ESLint automaticamente
bun run format        # Formata código com Prettier
bun run format:check  # Verifica formatação
bun run type-check    # Verifica tipos TypeScript
```

### Testes

```bash
bun run test          # Executa testes
bun run test:watch    # Executa testes em modo watch
```

### Banco de Dados

```bash
bun run db:generate   # Gera Prisma Client
bun run db:push       # Sincroniza schema com o banco (dev)
bun run db:migrate    # Cria nova migration
bun run db:studio     # Abre Prisma Studio
bun run db:seed       # Executa seed
```

---

## 🔐 Variáveis de Ambiente

| Variável             | Descrição                                                 | Obrigatória |
| -------------------- | --------------------------------------------------------- | ----------- |
| `DATABASE_URL`       | URL de conexão do PostgreSQL                              | ✅          |
| `NEXTAUTH_SECRET`    | Secret para NextAuth (gerador: `openssl rand -base64 32`) | ✅          |
| `NEXTAUTH_URL`       | URL da aplicação                                          | ✅          |
| `RESEND_API_KEY`     | API Key do Resend                                         | ✅          |
| `RESEND_FROM_EMAIL`  | Email remetente                                           | ✅          |
| `UPLOADTHING_SECRET` | Secret do UploadThing                                     | ⚠️          |
| `UPLOADTHING_APP_ID` | App ID do UploadThing                                     | ⚠️          |

⚠️ = Opcional para desenvolvimento inicial

---

## 🎨 Design System

O projeto utiliza o **Design System SABIU** com as seguintes cores:

- **Primária (Brand)**: `#3B82F6` - Azul Sabiá
- **Secundária (Accent)**: `#F5A524` - Dourado Canto
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`
- **Info**: `#38BDF8`

Suporta tema claro e escuro com alternância automática.

---

## 🔌 Providers Globais

O projeto utiliza três providers principais que gerenciam estado global, autenticação e tema:

### AuthProvider

Gerencia a sessão de autenticação usando NextAuth.

**Funcionalidades:**

- Refresh automático de sessão
- Estado de sessão acessível via `useSession()` hook
- Atualizações otimistas de sessão

**Exemplo de uso:**

```tsx
'use client'
import { useSession } from 'next-auth/react'

export function UserProfile() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Carregando...</div>
  if (status === 'unauthenticated') return <div>Não autenticado</div>

  return <div>Bem-vindo {session?.user?.name}</div>
}
```

### QueryProvider

Configura React Query (TanStack Query) para cache e gerenciamento de estado do servidor.

**Configuração:**

- Stale time: 5 minutos (dados considerados frescos)
- Cache time: 10 minutos (dados mantidos em cache)
- Refetch on window focus: apenas em produção
- Retry: 1 tentativa

**Exemplo de uso:**

```tsx
'use client'
import { useQuery } from '@tanstack/react-query'

export function ItemsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items')
      return res.json()
    },
  })

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return <div>{/* renderizar itens */}</div>
}
```

### ThemeProvider

Permite alternância entre temas claro e escuro com persistência.

**Funcionalidades:**

- Detecção de preferência do sistema
- Persistência em localStorage
- Sem flash de conteúdo não estilizado
- Transições suaves desabilitadas por padrão

**Exemplo de uso:**

```tsx
'use client'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

### Uso Combinado

Todos os providers são combinados no componente `Providers`:

```tsx
import { Providers } from '@/components/providers'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Ordem dos providers:**

1. **AuthProvider** - Mais externo (sessão necessária em toda parte)
2. **QueryProvider** - No meio (precisa de auth para queries protegidas)
3. **ThemeProvider** - Mais interno (apenas visual, sem dependências)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](https://github.com/seu-usuario/sabiu-app/issues).

---

**Feito com ❤️ e TypeScript**
