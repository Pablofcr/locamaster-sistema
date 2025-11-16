# Documentação Técnica - LocaMaster Pro V2

## Arquitetura

### Frontend
- **Framework**: Next.js 15 com App Router e Turbopack
- **Estilização**: Tailwind CSS v4 + Shadcn/ui (tema Zinc)
- **Estado**: Zustand para estado global + React Query para server state
- **Validação**: Zod + React Hook Form com resolvers
- **Gráficos**: Recharts para dashboards
- **Iconografia**: Lucide React

### Backend
- **API Routes**: Next.js Route Handlers com middleware
- **Validação**: Middleware Zod para todos endpoints
- **Autenticação**: NextAuth.js v5 com JWT + Session
- **Rate Limiting**: Implementado com Redis/Memory store
- **Dados**: 
  - **Fase 1**: LocalForage (IndexedDB) + Mock data
  - **Fase 2**: PostgreSQL + Prisma ORM
- **Files**: Upload para S3-compatible storage

### Segurança
- CSP Headers configurados no middleware
- CORS com whitelist específica por endpoint
- Input sanitization com DOMPurify
- SQL injection prevention (Prisma + validação)
- XSS protection com CSP strict
- Rate limiting por IP e usuário
- Audit logs para ações críticas

## Padrões de Código

### Estrutura de Pastas
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Grupo de rotas privadas
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Shadcn components
│   ├── features/         # Componentes específicos
│   │   ├── equipment/    # Gestão de equipamentos
│   │   ├── rentals/      # Locações e contratos
│   │   ├── billing/      # Faturamento
│   │   ├── customers/    # Clientes e fornecedores
│   │   └── dashboard/    # Dashboard e relatórios
│   └── layout/           # Layout components
├── lib/                  # Utilidades e configurações
│   ├── auth/             # Configuração autenticação
│   ├── db/               # Database/Storage layer
│   ├── security/         # Funções de segurança
│   ├── mock-data/        # Dados mockados
│   ├── validations/      # Schemas Zod
│   ├── utils/            # Utilidades gerais
│   └── constants.ts      # Constantes da aplicação
├── hooks/                # Custom hooks
├── types/                # TypeScript types
└── middleware.ts         # Next.js middleware
```

### Convenções de Nomenclatura
- **Componentes**: PascalCase (`EquipmentCard`, `RentalForm`)
- **Funções utilitárias**: camelCase (`formatCurrency`, `generateId`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_UPLOAD_SIZE`)
- **Arquivos**: kebab-case (`equipment-service.ts`, `rental-types.ts`)
- **Hooks**: camelCase com prefixo `use` (`useEquipment`, `useAuth`)
- **Types/Interfaces**: PascalCase (`Equipment`, `RentalContract`)

## APIs e Endpoints

### Estrutura de API
- **Versionamento**: `/api/v1/`
- **Autenticação**: Bearer token (JWT)
- **Rate limiting**: 100 req/min por IP, 500 req/min autenticado
- **CORS**: Configurado por endpoint específico
- **Formato**: JSON com envelope padrão

### Endpoints Core

#### Equipamentos
```typescript
GET    /api/v1/equipment        # Listar equipamentos (paginado)
POST   /api/v1/equipment        # Criar equipamento
GET    /api/v1/equipment/:id    # Buscar equipamento
PUT    /api/v1/equipment/:id    # Atualizar equipamento
DELETE /api/v1/equipment/:id    # Remover equipamento
POST   /api/v1/equipment/:id/photo # Upload foto
```

#### Locações
```typescript
GET    /api/v1/rentals          # Listar locações
POST   /api/v1/rentals          # Criar locação
GET    /api/v1/rentals/:id      # Buscar locação
PUT    /api/v1/rentals/:id      # Atualizar locação
POST   /api/v1/rentals/:id/checkin  # Check-in
POST   /api/v1/rentals/:id/checkout # Check-out
```

#### Faturamento
```typescript
GET    /api/v1/billing/invoices    # Listar faturas
POST   /api/v1/billing/generate    # Gerar faturas automáticas
GET    /api/v1/billing/:id         # Buscar fatura
POST   /api/v1/billing/:id/send    # Enviar fatura por email
```

### Endpoints Públicos (Futuro)
Endpoints que precisarão de CORS aberto para portal do cliente:
```typescript
POST   /api/public/v1/quotes      # Solicitar orçamento
GET    /api/public/v1/availability # Consultar disponibilidade
POST   /api/public/v1/contact     # Formulário de contato
```

## Mock Data Strategy

### Estrutura de Dados Mock
Dados iniciais estruturados para desenvolvimento e demonstração:

```typescript
// src/lib/mock-data/
├── equipment.ts          # 50+ equipamentos variados
├── customers.ts          # 30+ clientes (PF/PJ)
├── suppliers.ts          # 15+ fornecedores
├── rentals.ts           # 100+ locações históricas
├── contracts.ts         # 50+ contratos ativos/finalizados
├── invoices.ts          # 200+ faturas (pagas/pendentes)
├── maintenance.ts       # Histórico de manutenções
└── seed.ts              # Função para popular dados
```

### Simulação Realística
- **Network delays**: 300-1500ms para simular API real
- **Paginação**: Implementada em todas listagens
- **Filtros**: Busca e filtros funcionais
- **Relacionamentos**: FK consistentes entre entidades
- **Estados**: Dados em diferentes estados (ativo, inativo, etc.)

## Segurança Implementada

### Middleware de Segurança
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Security headers
  // CORS configuration
  // Rate limiting
  // Auth validation
  // Audit logging
}
```

### Headers HTTP Obrigatórios
```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
  `.replace(/\s+/g, ' ').trim()
}
```

### Validação Universal
Todos os inputs são validados com Zod:
```typescript
// Exemplo de schema de validação
const EquipmentSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.enum(['construction', 'industrial', 'automotive']),
  dailyPrice: z.number().positive(),
  serialNumber: z.string().regex(/^[A-Z0-9-]+$/),
  status: z.enum(['available', 'rented', 'maintenance', 'retired'])
})
```

## Performance

### Otimizações Implementadas
- **Code Splitting**: Componentes lazy-loaded
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Caching Strategy**: 
  - Static: 1 ano
  - API: 5 minutos
  - Images: 30 dias
- **Database Queries**: Índices otimizados, paginação eficiente

### Métricas Alvo
- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1
- **TTI**: < 3.5s
- **Bundle Size**: < 500KB initial

## Testes

### Estratégia de Testes
- **Unit**: Jest + Testing Library (80% coverage)
- **Integration**: API tests com supertest
- **E2E**: Playwright para fluxos críticos
- **Security**: OWASP ZAP + Snyk
- **Performance**: Lighthouse CI

### Ambientes
- **Development**: Mock data + hot reload
- **Staging**: Replica de produção com dados de teste
- **Production**: Monitoramento 24/7 + alertas

## Deploy e Infraestrutura

### Containerização
```dockerfile
# Dockerfile otimizado para produção
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
- Security scan (Snyk)
- Tests (Unit + Integration)
- Build & Deploy to staging
- E2E tests
- Deploy to production
- Post-deployment verification
```

## Monitoramento

### Observabilidade
- **Logs**: Structured JSON com OpenTelemetry
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger para request tracing
- **Alerting**: PagerDuty para incidentes críticos
- **Uptime**: Pingdom + StatusPage

### Backup Strategy
- **Database**: Backup completo diário + incremental 4/4h
- **Files**: Replicação S3 cross-region
- **Configuration**: GitOps com Terraform
- **Recovery**: RTO < 4h, RPO < 1h
