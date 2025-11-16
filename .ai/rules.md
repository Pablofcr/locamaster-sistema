# Regras para Assistentes de IA

## Contexto do Projeto
LocaMaster Pro V2 - Sistema completo de gestão para locadoras de equipamentos desenvolvido com Next.js 15, TypeScript, Shadcn/ui e segurança OWASP Top 10.

## Regras Obrigatórias

### 1. Segurança (OWASP Top 10) - PRIORIDADE MÁXIMA
- **SEMPRE** validar inputs com Zod antes de qualquer processamento
- **NUNCA** expor dados sensíveis em logs, console.log ou respostas de erro
- **SEMPRE** usar prepared statements/ORM (Prisma) para queries
- **IMPLEMENTAR** rate limiting em todas APIs (100 req/min por IP)
- **VALIDAR** permissões RBAC antes de qualquer ação crítica
- **SANITIZAR** outputs para prevenir XSS usando DOMPurify
- **USAR** HTTPS obrigatório em produção
- **CONFIGURAR** CSP headers apropriados
- **IMPLEMENTAR** audit logs para ações de alta criticidade

### 2. Padrões de Código TypeScript
- **USE** TypeScript strict mode SEMPRE
- **SIGA** convenções de nomenclatura do projeto rigorosamente
- **IMPLEMENTE** error boundaries em todos componentes críticos
- **USE** async/await ao invés de .then/.catch
- **MANTENHA** componentes pequenos (< 150 linhas) e focados
- **DOCUMENTE** interfaces complexas com JSDoc
- **USE** tipos genéricos quando apropriado
- **EVITE** any - sempre tipifique corretamente

### 3. Performance e Otimização
- **IMPLEMENTE** lazy loading para componentes pesados
- **USE** React.memo() para componentes que re-renderizam frequentemente
- **OTIMIZE** bundle size - analise imports desnecessários
- **IMPLEMENTE** virtualization para listas grandes (react-window)
- **USE** Next.js Image component para todas imagens
- **CONFIGURE** caching estratégico (SWR/React Query)
- **MINIMIZE** calls à API - batch requests quando possível
- **MONITORE** Core Web Vitals (LCP < 2.5s, FID < 100ms)

### 4. Documentação e Comentários
- **COMENTE** lógica de negócio complexa (especialmente faturamento)
- **ATUALIZE** docs ao modificar APIs ou fluxos críticos
- **MANTENHA** README.md atualizado com setup instructions
- **DOCUMENTE** decisões arquiteturais no código
- **USE** TypeScript interfaces como documentação viva
- **EXPLIQUE** regras de negócio específicas de locadoras
- **DOCUMENTE** formulas de cálculo (preços, multas, descontos)

### 5. Git e Versionamento
- **Commits**: Atomic e descritivos seguindo Conventional Commits
- **Branch naming**: 
  - `feature/LOCA-123-equipment-qr-code`
  - `bugfix/LOCA-456-invoice-calculation`
  - `hotfix/LOCA-789-security-patch`
- **SEMPRE** criar PR antes de merge para main
- **EXECUTAR** todos testes antes de push
- **CODE REVIEW** obrigatório para alterações críticas
- **SQUASH** commits antes do merge

### 6. Estrutura de Features (Domain-Driven)
Organize código por domínio de negócio:
```
src/components/features/
├── equipment/     # Gestão de equipamentos
├── rentals/       # Locações e contratos  
├── billing/       # Faturamento e financeiro
├── customers/     # CRM e relacionamento
├── inventory/     # Estoque e logística
├── reports/       # Relatórios e analytics
└── settings/      # Configurações do sistema
```

### 7. Validação e Tratamento de Erros
- **TODAS** as APIs devem retornar envelope padrão:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```
- **IMPLEMENTAR** error boundaries globais
- **LOGAR** erros com contexto suficiente para debug
- **NUNCA** vazar stack traces para usuário final

### 8. APIs e Endpoints

#### Endpoints Públicos (Portal do Cliente)
Configurar CORS apropriadamente:
```typescript
// Para endpoints públicos
const publicCorsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
```

#### Endpoints Privados (Dashboard)
```typescript
// Middleware de autenticação obrigatório
export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new UnauthorizedError();
  
  const session = await validateToken(token);
  if (!session) throw new UnauthorizedError();
  
  return session;
}
```

### 9. Regras de Negócio Específicas
- **Equipamentos**: Sempre validar disponibilidade antes de locar
- **Contratos**: Verificar crédito do cliente antes da aprovação
- **Faturamento**: Implementar regras de corte mensais configuráveis
- **Manutenção**: Alertas automáticos baseados em horas de uso
- **Preços**: Suportar tabelas dinâmicas por cliente/período
- **Multas**: Calcular automaticamente por atraso na devolução

### 10. Testes Obrigatórios
```typescript
// Para cada feature, implementar:
describe('FeatureName', () => {
  describe('Unit Tests', () => {
    // Testes de função pura
  });
  
  describe('Integration Tests', () => {
    // Testes de API endpoints
  });
  
  describe('Security Tests', () => {
    // Testes de validação e sanitização
  });
});
```

## Checklist Antes de Commit

- [ ] **Segurança**: Código passou em scan de vulnerabilidades
- [ ] **TypeScript**: Zero erros de tipagem (`npm run type-check`)
- [ ] **Linting**: Código formatado corretamente (`npm run lint`)
- [ ] **Testes**: Todos testes passando (`npm run test`)
- [ ] **Performance**: Bundle size analisado (< 500KB inicial)
- [ ] **Documentação**: README e docs técnicos atualizados
- [ ] **Validação**: Inputs validados com Zod
- [ ] **Error Handling**: Tratamento adequado de erros
- [ ] **Logs**: Audit logs implementados para ações críticas
- [ ] **RBAC**: Permissões verificadas para funcionalidades sensíveis

## Padrões de Resposta da IA

### Ao Criar Componentes
1. Começar sempre com TypeScript interface/types
2. Implementar validação Zod se houver inputs
3. Adicionar error boundaries apropriadas
4. Incluir loading states e fallbacks
5. Implementar accessibility (a11y) básica
6. Adicionar comentários para lógica de negócio

### Ao Criar APIs
1. Definir schema de validação Zod primeiro
2. Implementar middleware de autenticação/autorização
3. Adicionar rate limiting
4. Implementar audit logging
5. Retornar envelope de resposta padronizado
6. Adicionar testes unitários e de integração

### Ao Implementar Funcionalidades
1. Analisar impacto na segurança (OWASP)
2. Considerar performance desde o início
3. Planejar estados de erro e loading
4. Documentar regras de negócio no código
5. Implementar logs para auditoria
6. Validar permissões de acesso (RBAC)

## Ferramentas de Qualidade
- **ESLint**: Configurado com regras específicas do projeto
- **Prettier**: Formatação automática de código
- **Husky**: Pre-commit hooks para qualidade
- **Jest**: Testes unitários com coverage > 80%
- **Playwright**: Testes E2E para fluxos críticos
- **Lighthouse CI**: Auditoria automática de performance
