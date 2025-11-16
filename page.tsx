import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LocaMaster Pro</h1>
                <p className="text-sm text-slate-500">V2.0 - Sistema de Gestão Profissional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/dashboard" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Sistema Completo para 
            <span className="text-blue-600"> Locadoras de Equipamentos</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Gerencie equipamentos, contratos, faturamento e muito mais com segurança enterprise 
            e tecnologia de ponta. Migrado do seu projeto original com melhorias significativas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Acessar Sistema
            </Link>
            <Link 
              href="/demo" 
              className="px-8 py-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-lg font-semibold"
            >
              Ver Demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Funcionalidades Principais
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Gestão de Equipamentos",
              description: "Controle completo do seu inventário com QR codes, manutenção preventiva e rastreamento em tempo real.",
              icon: "🏗️"
            },
            {
              title: "Contratos Inteligentes",
              description: "Criação automática de contratos com cálculos precisos de preços e prazos personalizáveis.",
              icon: "📄"
            },
            {
              title: "Faturamento Automático",
              description: "Geração automática de faturas baseada em contratos com regras de negócio configuráveis.",
              icon: "💰"
            },
            {
              title: "Dashboard Analítico",
              description: "Relatórios em tempo real com KPIs essenciais para tomada de decisão estratégica.",
              icon: "📊"
            },
            {
              title: "Gestão de Clientes",
              description: "CRM integrado com controle de crédito, histórico de relacionamento e portal self-service.",
              icon: "👥"
            },
            {
              title: "Segurança OWASP",
              description: "Implementação completa dos padrões OWASP Top 10 com auditoria e monitoramento.",
              icon: "🔒"
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Migration Notice */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              🚀 Migração do LocaMaster Pro Original
            </h3>
            <p className="text-slate-700 mb-6">
              Este é o <strong>LocaMaster Pro V2</strong>, uma versão completamente reescrita do seu projeto original,
              mantendo todas as funcionalidades existentes e adicionando:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">✅ Melhorias Técnicas:</h4>
                <ul className="text-slate-600 space-y-1">
                  <li>• Next.js 15 + TypeScript</li>
                  <li>• Shadcn/ui + Tailwind v4</li>
                  <li>• Middleware de segurança robusto</li>
                  <li>• Arquitetura escalável</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">✅ Funcionalidades:</h4>
                <ul className="text-slate-600 space-y-1">
                  <li>• Todos os dados migrados</li>
                  <li>• Interface moderna e responsiva</li>
                  <li>• Performance otimizada</li>
                  <li>• Documentação completa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LM</span>
              </div>
              <span className="text-slate-600">LocaMaster Pro V2 - Sistema Profissional</span>
            </div>
            <div className="text-sm text-slate-500">
              Desenvolvido com Next.js 15 + TypeScript + Shadcn/ui
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
