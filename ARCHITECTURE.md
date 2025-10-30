# Arquitetura do Projeto SABIU

Este projeto segue os princípios da **Clean Architecture**, separando as responsabilidades em camadas bem definidas.

## Estrutura de Pastas

```
sabiu-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas públicas de autenticação
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── reset/
│   │   ├── (protected)/       # Rotas protegidas (requer autenticação)
│   │   │   ├── dashboard/     # Dashboard com KPIs
│   │   │   ├── items/         # Lista e CRUD de itens
│   │   │   ├── kanban/        # Visualização Kanban
│   │   │   └── graph/         # Fluxograma de dependências
│   │   ├── api/               # Route Handlers REST
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui (Button, Card, etc)
│   │   ├── forms/            # Formulários (ItemForm, ModulesEditor, etc)
│   │   ├── layouts/          # Layouts compartilhados (Header, Sidebar, etc)
│   │   └── features/         # Componentes específicos de features
│   │
│   ├── core/                 # Camada de Domínio (Clean Architecture)
│   │   ├── entities/         # Entidades (User, LearningItem, Module, etc)
│   │   ├── use-cases/        # Casos de uso (CalculateProgress, LinkDependency, etc)
│   │   └── interfaces/       # Contratos/interfaces (repositories, services)
│   │
│   ├── infra/                # Camada de Infraestrutura
│   │   ├── repositories/     # Implementações Prisma (UserRepository, ItemRepository)
│   │   ├── clients/          # Clientes externos (ResendMailer, UploadThingStorage)
│   │   └── mappers/          # Mappers DTO <-> Domain
│   │
│   └── lib/                  # Utilitários e configurações
│       ├── schemas/          # Schemas Zod para validação
│       ├── auth.ts           # Configuração NextAuth
│       ├── prisma.ts         # Cliente Prisma
│       └── utils.ts          # Funções utilitárias
│
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Modelo do banco de dados
│   ├── migrations/           # Migrações
│   └── seed.ts              # Dados iniciais
│
├── public/                   # Arquivos estáticos
│   └── uploads/             # Uploads de usuário (certificados, etc)
│
└── documentos/              # Documentação privada (não versionada)
```

## Princípios da Clean Architecture

### 1. Core (Domínio)

Contém as **regras de negócio** da aplicação. É independente de frameworks e bibliotecas externas.

- **Entities**: Representam os conceitos principais do domínio
- **Use Cases**: Implementam a lógica de negócio específica
- **Interfaces**: Definem contratos que as camadas externas devem implementar

### 2. Infra (Infraestrutura)

Implementações concretas que interagem com o mundo externo.

- **Repositories**: Acesso ao banco de dados via Prisma
- **Clients**: Integrações com serviços externos (e-mail, storage)
- **Mappers**: Conversão entre DTOs e entidades de domínio

### 3. App (Apresentação)

Interface com o usuário através de Next.js.

- Componentes React para UI
- Route Handlers para API REST
- Server Actions para mutações
- Pages para rotas da aplicação

## Fluxo de Dados

```
User Request
    ↓
Route Handler / Server Action (app/)
    ↓
Use Case (core/use-cases/)
    ↓
Repository Interface (core/interfaces/)
    ↓
Repository Implementation (infra/repositories/)
    ↓
Prisma Client
    ↓
PostgreSQL
```

## Benefícios

1. **Testabilidade**: Use cases podem ser testados sem dependências externas
2. **Manutenibilidade**: Separação clara de responsabilidades
3. **Flexibilidade**: Fácil trocar implementações (ex: Prisma → outro ORM)
4. **Independência de Framework**: Regras de negócio não dependem do Next.js

## Convenções

- **Nomenclatura**: PascalCase para componentes e classes, camelCase para funções
- **Imports**: Usar alias `@/` para imports absolutos
- **TypeScript**: Strict mode habilitado, sempre tipar adequadamente
- **Componentes**: Separar lógica (hooks) de apresentação (JSX)
