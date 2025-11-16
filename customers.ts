import { 
  Customer, 
  generateId, 
  randomBetween, 
  randomFromArray, 
  randomDate,
  BRAZILIAN_STATES,
  CITIES_BY_STATE
} from './types';

// Generate realistic customer data
function createCustomer(
  type: 'individual' | 'corporate',
  name: string,
  email: string,
  phone: string,
  document: string,
  creditLimit: number = 0
): Customer {
  const state = randomFromArray(Object.keys(CITIES_BY_STATE) as Array<keyof typeof CITIES_BY_STATE>);
  const city = randomFromArray([...CITIES_BY_STATE[state]]); // Fix: convert readonly array to mutable
  
  return {
    id: generateId(),
    type,
    name,
    email,
    phone,
    document,
    address: {
      street: randomFromArray([
        'Rua das Flores', 'Av. Brasil', 'Rua da Paz', 'Av. Paulista',
        'Rua XV de Novembro', 'Av. Independência', 'Rua do Comércio',
        'Av. Beira Mar', 'Rua dos Expedicionários', 'Av. Santos Dumont'
      ]),
      number: `${randomBetween(10, 9999)}`,
      complement: Math.random() > 0.7 ? randomFromArray(['Apto 101', 'Sala 205', 'Bloco A', 'Fundos']) : undefined,
      city,
      state,
      zipCode: `${randomBetween(10000, 99999)}-${randomBetween(100, 999)}`,
    },
    status: randomFromArray(['active', 'active', 'active', 'inactive']), // Maioria ativo
    creditLimit: creditLimit || randomBetween(5000, 100000),
    currentDebt: Math.random() > 0.6 ? randomBetween(0, creditLimit * 0.3) : 0,
    notes: Math.random() > 0.8 ? 'Cliente preferencial com histórico excelente' : undefined,
    createdAt: randomDate(new Date(2020, 0, 1), new Date()),
    updatedAt: new Date(),
  };
}

// Generate Brazilian-style names and documents
function generateCPF(): string {
  const digits = Array.from({ length: 9 }, () => randomBetween(0, 9));
  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${randomBetween(10, 99)}`;
}

function generateCNPJ(): string {
  const digits = Array.from({ length: 12 }, () => randomBetween(0, 9));
  return `${digits.slice(0, 2).join('')}.${digits.slice(2, 5).join('')}.${digits.slice(5, 8).join('')}/${digits.slice(8, 12).join('')}-${randomBetween(10, 99)}`;
}

// Individual customers data
const individualCustomers = [
  { name: 'João Silva Santos', email: 'joao.silva@email.com', phone: '(11) 99999-1234' },
  { name: 'Maria Oliveira Costa', email: 'maria.oliveira@gmail.com', phone: '(11) 98888-5678' },
  { name: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@hotmail.com', phone: '(21) 97777-9012' },
  { name: 'Ana Paula Rodrigues', email: 'ana.rodrigues@yahoo.com', phone: '(31) 96666-3456' },
  { name: 'Paulo Roberto Lima', email: 'paulo.lima@uol.com.br', phone: '(41) 95555-7890' },
  { name: 'Fernanda Alves Pereira', email: 'fernanda.alves@bol.com.br', phone: '(51) 94444-2345' },
  { name: 'Ricardo Mendes Souza', email: 'ricardo.souza@terra.com.br', phone: '(61) 93333-6789' },
  { name: 'Juliana Santos Barbosa', email: 'juliana.santos@ig.com.br', phone: '(71) 92222-0123' },
  { name: 'Anderson Costa Martins', email: 'anderson.martins@globo.com', phone: '(81) 91111-4567' },
  { name: 'Patricia Gomes Silva', email: 'patricia.gomes@r7.com', phone: '(85) 90000-8901' },
];

// Corporate customers data  
const corporateCustomers = [
  { name: 'Construtora Alpha Ltda', email: 'contato@alpha.com.br', phone: '(11) 3000-1000', creditLimit: 150000 },
  { name: 'Beta Engenharia S/A', email: 'financeiro@betaeng.com.br', phone: '(21) 3000-2000', creditLimit: 200000 },
  { name: 'Gamma Construções e Incorporações', email: 'admin@gamma.com.br', phone: '(31) 3000-3000', creditLimit: 300000 },
  { name: 'Delta Empreiteira Ltda', email: 'compras@delta.com.br', phone: '(41) 3000-4000', creditLimit: 100000 },
  { name: 'Epsilon Obras e Serviços', email: 'operacional@epsilon.com.br', phone: '(51) 3000-5000', creditLimit: 120000 },
  { name: 'Zeta Industrial S/A', email: 'suprimentos@zeta.com.br', phone: '(61) 3000-6000', creditLimit: 250000 },
  { name: 'Eta Metalúrgica Ltda', email: 'vendas@eta.com.br', phone: '(71) 3000-7000', creditLimit: 180000 },
  { name: 'Theta Transportes e Logística', email: 'frota@theta.com.br', phone: '(81) 3000-8000', creditLimit: 90000 },
  { name: 'Iota Eventos e Produção', email: 'producao@iota.com.br', phone: '(85) 3000-9000', creditLimit: 80000 },
  { name: 'Kappa Paisagismo e Jardinagem', email: 'projetos@kappa.com.br', phone: '(11) 3001-0000', creditLimit: 70000 },
];

// Generate all mock customers
export const mockCustomers: Customer[] = [
  ...individualCustomers.map(customer => 
    createCustomer('individual', customer.name, customer.email, customer.phone, generateCPF())
  ),
  ...corporateCustomers.map(customer => 
    createCustomer('corporate', customer.name, customer.email, customer.phone, generateCNPJ(), customer.creditLimit)
  ),
];

// Utility functions
export async function getCustomerById(id: string): Promise<Customer | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCustomers.find(customer => customer.id === id) || null;
}

export async function getAllCustomers(
  page: number = 1,
  limit: number = 20,
  filters?: {
    type?: 'individual' | 'corporate';
    status?: 'active' | 'inactive' | 'blocked';
    search?: string;
    hasDebt?: boolean;
  }
): Promise<{
  data: Customer[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}> {
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = mockCustomers;

  if (filters) {
    if (filters.type) {
      filtered = filtered.filter(customer => customer.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.document.includes(query)
      );
    }
    if (filters.hasDebt !== undefined) {
      filtered = filtered.filter(customer => 
        filters.hasDebt ? customer.currentDebt > 0 : customer.currentDebt === 0
      );
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return { data, pagination: { page, limit, total, totalPages } };
}
