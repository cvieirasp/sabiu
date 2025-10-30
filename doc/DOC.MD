# SABIU

Aplicação Web para registrar e visualizar sua evolução profissional, com cadastro de cursos/vídeos/livros/certificações ("Itens de Aprendizado"), seus capítulos/módulos, dependências entre itens e três visualizações (Lista, Kanban e Fluxograma). A Home mostra um Dashboard de progresso.

---

## Objetivos (do produto)

1. Registrar Itens de Aprendizado e seus capítulos/módulos.
2. Relacionar dependências entre itens (pré‑requisitos).
3. Avaliar progresso por item (com base no andamento dos módulos) e por categoria/status.
4. Visualizar o portfólio de estudos em Lista, Kanban (por status) e Fluxograma (grafo de dependências).
5. Dashboard inicial com KPIs chave.
6. Preferências de tema (Claro/Escuro).

---

# Stack Tecnológico (JavaScript/TypeScript First)

## Frontend

* **Framework**: **Next.js 15** (App Router) + **React 18**
* **Linguagem**: **TypeScript**
* **UI**: **Tailwind CSS** + **shadcn/ui** (componentes acessíveis e consistentes)
* **Estado/Server Cache**: **React Query (TanStack Query)** para dados do servidor; estado local com React Context/Zustand para preferências leves
* **Formulários**: `react-hook-form` + `zod` (validação schema‑first)
* **Markdown**: `react-markdown` + `remark-gfm` + `rehype-sanitize`
* **Kanban**: `@dnd-kit/core` (drag‑and‑drop com acessibilidade)
* **Fluxograma**: **React Flow** (grafo de dependências, zoom, pan, edges customizados)
* **Tema**: `next-themes` (toggle Claro/Escuro + persistência)
* **Icones**: **MUI Icons** (`@mui/icons-material`)

## Backend

* **Runtime**: **Node.js 20 LTS** (Edge/Serverless friendly)
* **API**: **Next.js Route Handlers** (REST) + **Server Actions** onde fizer sentido
* **Auth**: **NextAuth.js** (Credentials + Email Magic Link/Reset via Resend)
* **ORM**: **Prisma**
* **Banco**: **PostgreSQL** (Neon, Supabase ou RDS; local via Docker)
* **E‑mail**: **Resend** (reset de senha e notificações opcionais)
* **Armazenamento de Imagens/Arquivos**: **UploadThing** (anexos de certificados)

## DevEx, Qualidade e Observabilidade

* **Lint/Format**: ESLint + Prettier + TypeScript strict
* **Testes**: Vitest + Testing Library (frontend), Contract tests de rotas
* **Acessibilidade**: eslint‑plugin‑jsx‑a11y + testes manuais via axe
* **Logger**: pino + interceptador de requests (correlação `x-request-id`)
* **CI/CD**: GitHub Actions (lint, typecheck, test, build)
* **Deploy**: Vercel (frontend+api) + Neon/Supabase (Postgres)

---

# Arquitetura

## Diagrama (alto nível)

```
[Next.js (App Router)] --(Route Handlers/Server Actions)--> [Prisma] --> [PostgreSQL]
            |                              
            |-- React Query (cache)
            |-- NextAuth (sessão JWT/DB) --> [Resend] (e-mails)
            |-- React Flow / dnd-kit (UI)
            |-- UploadThing (uploads)
```

### Clean Architecture (mapeamento)

* **core/**: entidades (User, LearningItem, Module…), value objects, **use cases** (ex.: CalculateProgress, LinkDependency)
* **infra/**: implementações concretas (PrismaRepositories, ResendMailer, UploadThingStorage)
* **app (Next.js)**: *adapters de interface* (Route Handlers chamam use cases), componentes React (apresentação)
* **lib/**: glue/utilidades (schemas Zod, mappers DTO<->Domain)

> Benefício: separa regras de negócio de frameworks. Facilita testes e troca de fornecedores (ex.: trocar UploadThing por S3 sem tocar nos use cases).

## Organização de Pastas

```
app/
  (protected)/       # páginas autenticadas (layout com guard)
  (auth)/            # sign-in, sign-up, reset/request, reset/confirm
  dashboard/
  items/             # lista, create/edit, detalhes
  kanban/
  graph/
  api/               # route handlers REST (separados por recurso)
components/
lib/                 # prisma, auth, utils, schemas zod
core/                # domínio (entidades, casos de uso) – Clean Architecture
infra/               # adapters (repos/clients: prisma, resend, uploadthing)
prisma/              # schema.prisma, migrations, seed
styles/
```

## Modelagem de Domínio (ER)

```
User (id, name, email, passwordHash, createdAt)
Category (id, name, color)
LearningItem (id, title, descriptionMD, dueDate, status, progressCached, userId, categoryId, createdAt, updatedAt)
Module (id, learningItemId, title, status, order)
Dependency (id, sourceItemId, targetItemId)  # source depende de target
Tag (id, name)
LearningItemTag (learningItemId, tagId)
```

### Observações

* `status`: {Backlog, Em_Andamento, Pausado, Concluido}
* `progressCached` (0–100): mantém cálculo de progresso para leitura rápida (atualiza via trigger lógica a cada mudança de módulos)
* `Module.status`: {Pendente, Em_Andamento, Concluido}

---

# Requisitos Funcionais (como será implementado)

## Autenticação e Usuário

* Cadastro com **nome, e‑mail, senha** (hash com bcrypt).
* Login **Credentials** (NextAuth) + sessão com JWT/DB.
* **Reset de senha** via e‑mail (Resend): link de uso único com token temporário (15 min), tela para nova senha (zod rules).

## Dashboard (Home)

* Cards:

  * Total por **categoria** (gráfico donut)
  * Total por **status** (barras)
  * **Progresso médio** geral e top 5 itens mais próximos de concluir
* Lista “Recentes atualizados”
* CTA: “Criar Item de Aprendizado”

## CRUD de Itens de Aprendizado

* Campos: nome, descrição **Markdown** (preview ao vivo), prazo (date), status, categoria, **tags** (opcional), capítulos/módulos (tabela inline com ordem e status)
* Dependências: seletor multi para vincular **itens pré‑requisitos**
* Regras de progresso: `progress = (módulos concluídos / total) * 100` (ponderação opcional por ordem)

## Lista

* Tabela com filtros por categoria, status, tags, busca por texto (título/descrição)
* **Ordenação** por título, categoria, status, progresso, prazo (asc/desc)
* Ações inline (editar, arquivar, excluir)

## Kanban (por Status)

* Colunas: Backlog | Em Andamento | Pausado | Concluído
* Cartões com: título, categoria, progresso %, dueDate
* **Drag‑and‑drop** entre colunas -> atualiza `status`

## Fluxograma (Grafo de Dependências)

* Nó = Item de Aprendizado (badge de categoria, chip de status, progresso)
* Aresta `A → B` = **A depende de B** (seta para o pré‑requisito)
* Layout automático (Dagre) + pan/zoom + seleção múltipla
* Painel lateral: detalhes do nó selecionado (módulos, progresso, links)

## Tema Claro/Escuro

* Toggle com `next-themes`, persistido em `localStorage`

---

# API (REST) – exemplos de rotas

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/reset/request   # {email}
POST   /api/auth/reset/confirm   # {token, newPassword}

GET    /api/items                # ?q=&status=&category=&tag=
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id

POST   /api/items/:id/modules            # add módulo
PUT    /api/modules/:moduleId            # update módulo
DELETE /api/modules/:moduleId

POST   /api/items/:id/dependencies       # {targets: [itemId]}
DELETE /api/dependencies/:dependencyId

GET    /api/metrics/overview             # dados do dashboard
```

### Contratos (exemplo)

```json
// POST /api/items
{
  "title": "Curso React Testing",
  "descriptionMD": "Introdução a testes com RTL...",
  "dueDate": "2025-11-20",
  "status": "Em_Andamento",
  "categoryId": "cat_react",
  "tags": ["frontend", "tests"],
  "modules": [
    {"title": "Fundamentos", "status": "Concluido", "order": 1},
    {"title": "RTL Básico", "status": "Em_Andamento", "order": 2}
  ],
  "dependencies": ["item_js_basics"]
}
```

---

# Segurança e Boas Práticas

* Hash de senha (bcrypt), tokens de reset com expiração curta.
* Sanitização de Markdown com `rehype-sanitize`.
* RLS lógico por `userId` em todas as queries.
* Rate limiting básico por IP (middleware) nas rotas públicas (auth/reset).
* Logs estruturados com correlação (`x-request-id`).
* CSP/Headers seguros via `next/headers` e `@vercel/edge` quando aplicável.

---

# Experiência do Usuário (UX)

* Empty states úteis em Lista/Kanban/Grafo.
* **Indicadores de carregamento**: Skeletons para cards/tabela, spinners no Kanban e barra linear no Fluxograma enquanto o grafo é calculado.
* Acessibilidade: foco visível, atalhos de teclado (e.g., "N" para novo item), drag‑and‑drop acessível.

---

# Complementos sugeridos (Requisitos estendidos)

1. **Tags e Filtros avançados** (já previstos no modelo)
2. **Importação** de itens via CSV/JSON; **Exportação** para JSON/CSV
3. **Anexos** por item (certificados, PDFs de ementa)
4. **Pesos de módulos** (progresso ponderado)
5. **Riscos/Bloqueios** em itens (ex.: “aguardando material”)
6. **Notas rápidas** por módulo (checklist)
7. **Campos personalizados** por categoria (extensibilidade)
8. **i18n** (pt‑BR/en-US) com `next-intl`
9. **Relatórios**: evolução semanal/mensal (sparkline por item)
10. **Atividade/Auditoria**: trilha de alterações (quem/quando)

---

# Métricas (KPIs no Dashboard)

* Total por categoria/status
* % de conclusão por item e média geral
* Itens atrasados vs. no prazo
* Deltas semanais de progresso (gráfico linha)

---

# Esquema Prisma (resumo)

```prisma
model User {
  id            String  @id @default(cuid())
  name          String
  email         String  @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  items         LearningItem[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  color String
  items LearningItem[]
}

model LearningItem {
  id             String   @id @default(cuid())
  title          String
  descriptionMD  String
  dueDate        DateTime?
  status         Status
  progressCached Int       @default(0)
  user           User      @relation(fields: [userId], references: [id])
  userId         String
  category       Category? @relation(fields: [categoryId], references: [id])
  categoryId     String?
  modules        Module[]
  sourceDeps     Dependency[] @relation("source")
  targetDeps     Dependency[] @relation("target")
  tags           LearningItemTag[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum Status { Backlog Em_Andamento Pausado Concluido }

enum ModuleStatus { Pendente Em_Andamento Concluido }

model Module {
  id             String       @id @default(cuid())
  learningItem   LearningItem @relation(fields: [learningItemId], references: [id])
  learningItemId String
  title          String
  status         ModuleStatus @default(Pendente)
  order          Int          @default(0)
}

model Dependency {
  id           String       @id @default(cuid())
  sourceItem   LearningItem @relation("source", fields: [sourceItemId], references: [id])
  sourceItemId String
  targetItem   LearningItem @relation("target", fields: [targetItemId], references: [id])
  targetItemId String
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  items LearningItemTag[]
}

model LearningItemTag {
  learningItem   LearningItem @relation(fields: [learningItemId], references: [id])
  learningItemId String
  tag            Tag          @relation(fields: [tagId], references: [id])
  tagId          String
  @@id([learningItemId, tagId])
}
```

---

# Esboço de Componentes (Frontend)

* `ItemForm` (zod schema, RHF, editor Markdown com preview)
* `ModulesEditor` (lista ordenável, inline edit)
* `DependenciesPicker` (combobox multi + busca)
* `KanbanBoard` (dnd‑kit; coluna = status)
* `LearningGraph` (React Flow; layout Dagre)
* `DashboardCards` e gráficos (Recharts)
* `ThemeToggle`
* `UserMenu` (perfil, logout)

---

# Testes

* **Unit**: validações Zod, hooks utilitários
* **Component**: formulários, Kanban drag, Graph render básico
* **API**: criação item, atualização de status, cálculo de progresso

---

# Deploy e Infra

* **Vercel** (preview por PR
* domínios, env vars seguras)
* **Postgres** gerenciado (Neon/Supabase)
* **Resend** configurado para domínio (SPF/DKIM)

---

# Branding – **Sabiu**

## Essência

* **Nome**: Sabiu (sabiá + sábio) – conhecimento que canta
* **Tagline**: *Aprender do seu jeito.*
* **Personalidade**: acolhedor, claro e focado em progresso; visual leve e acessível

## Logo (conceito) – SVG

> Marca tipográfica com detalhe de bico/asa no “S” e acento estilizado como nota musical simplificada.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#F5A524"/>
      <stop offset="1" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="white"/>
  <!-- S com bico/asa -->
  <path d="M100,120 C60,120 60,60 100,60 C140,60 140,20 100,20" fill="none" stroke="url(#g)" stroke-width="18" stroke-linecap="round"/>
  <path d="M100,20 l28,-10 l-10,28" fill="#F5A524" opacity="0.9"/>
  <!-- palavra Sabiu -->
  <text x="150" y="110" font-family="'Inter', system-ui, -apple-system, Segoe UI, Roboto" font-weight="700" font-size="88" fill="#0F172A">Sabiu</text>
  <!-- acento agudo como nota -->
  <path d="M300,50 l16,-40" stroke="#3B82F6" stroke-width="6" stroke-linecap="round"/>
  <circle cx="316" cy="14" r="5" fill="#3B82F6"/>
</svg>
```

> Dicas: usar versão **mono** (100% `#0F172A`) para fundos coloridos; manter zona de respiro = altura do “S”.

## Cores

* **Primária** `--brand`: Azul Sabiá — `#3B82F6`
* **Secundária** `--accent`: Dourado Canto — `#F5A524`
* **Neutros**:

  * `--bg` Claro `#F8FAFC` | Escuro `#0B1220`
  * `--fg` Claro `#0F172A` | Escuro `#E5E7EB`
  * `--muted` `#94A3B8` (ícones/textos secundários)
* **Feedback**: Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`, Info `#38BDF8`

## Tipografia

* **Display/Headings**: Inter (700/600)
* **Texto**: Inter (400/500)
* **Escala**: xs 12, sm 14, base 16, lg 18, xl 20, 2xl 24, 3xl 30, 4xl 36

## Espaçamentos & Raios

* **Spacing**: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40
* **Radii**: `sm 6`, `md 10`, `lg 14`, `xl 20`, `2xl 24`
* **Sombras**: `sm 0 1px 2px rgba(0,0,0,.05)`, `md 0 6px 20px rgba(2,6,23,.08)`, `xl 0 18px 60px rgba(2,6,23,.10)`

## Design Tokens (JSON)

```json
{
  "color": {
    "brand": "#3B82F6",
    "accent": "#F5A524",
    "bg": { "light": "#F8FAFC", "dark": "#0B1220" },
    "fg": { "light": "#0F172A", "dark": "#E5E7EB" },
    "muted": "#94A3B8",
    "success": "#10B981",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "info": "#38BDF8"
  },
  "radius": { "sm": 6, "md": 10, "lg": 14, "xl": 20, "2xl": 24 },
  "space": [2, 4, 6, 8, 12, 16, 20, 24, 32, 40],
  "font": {
    "family": { "base": "Inter, system-ui, sans-serif" },
    "weight": { "regular": 400, "medium": 500, "semibold": 600, "bold": 700 },
    "size": { "xs": 12, "sm": 14, "base": 16, "lg": 18, "xl": 20, "2xl": 24, "3xl": 30, "4xl": 36 }
  }
}
```

## Tailwind – theme extension (exemplo)

```ts
// tailwind.config.ts (trecho)
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#3B82F6',
        accent: '#F5A524',
        bg: {
          light: '#F8FAFC',
          dark: '#0B1220'
        },
        fg: {
          light: '#0F172A',
          dark: '#E5E7EB'
        },
        muted: '#94A3B8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#38BDF8'
      },
      borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px', '2xl': '24px' },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,.05)',
        md: '0 6px 20px rgba(2,6,23,.08)',
        xl: '0 18px 60px rgba(2,6,23,.10)'
      }
    }
  }
} satisfies Config
```

## Componentização base (shadcn/ui + tokens)

* **Button**: `brand` (primário), `ghost` (muted), `danger`
* **Card**: radius `xl`, sombra `md`, borda `1px #E2E8F0` (claro) / `#1E293B` (escuro)
* **Badge**: cores por `status` (Backlog=muted, Em Andamento=brand, Pausado=warning, Concluído=success)
* **Progress**: usa `brand` para fill; `muted` para trilha

## Favicon & Ícone app

* **Favicon**: “S” estilizado (bico/asa) em `brand` sobre fundo `bg.light` (modo claro) e inverso no escuro
* **App Icon**: quadrado canto `2xl`, gradiente `brand→accent`, “S” negativo

---
