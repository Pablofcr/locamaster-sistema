export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📊 Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema de locação</p>
      </div>
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          🚀 Sistema LocaMaster Pro
        </h2>
        <p className="text-gray-600">
          Dashboard principal será implementado aqui com métricas e gráficos.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Por enquanto, acesse <strong>Orçamentos</strong> para ver o sistema completo funcionando!
        </p>
      </div>
    </div>
  )
}
