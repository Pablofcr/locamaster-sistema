export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao LocaMaster Pro</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total de Orçamentos</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">23</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Valor Total</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">R$ 127.500</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Taxa de Conversão</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">78%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Tempo Médio</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">2.3 dias</p>
        </div>
      </div>
    </div>
  )
}
