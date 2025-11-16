import { 
  generateId, 
  randomBetween, 
  randomFromArray, 
  randomDate,
} from './types';

export interface Rental {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  customerType: 'individual' | 'corporate';
  equipments: {
    id: string;
    name: string;
    quantity: number;
    dailyPrice: number;
    totalPrice: number;
  }[];
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  totalDays: number;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
  deposit: number;
  deliveryAddress: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryType: 'pickup' | 'delivery' | 'both';
  deliveryFee: number;
  observations?: string;
  checkIn?: {
    date: Date;
    photos: string[];
    condition: string;
    responsiblePerson: string;
  };
  checkOut?: {
    date: Date;
    photos: string[];
    condition: string;
    responsiblePerson: string;
    damages?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Mock customers for rentals
const rentalCustomers = [
  { id: '1', name: 'Construtora Alpha Ltda', type: 'corporate' as const },
  { id: '2', name: 'João Silva Santos', type: 'individual' as const },
  { id: '3', name: 'Beta Engenharia S/A', type: 'corporate' as const },
  { id: '4', name: 'Maria Oliveira Costa', type: 'individual' as const },
  { id: '5', name: 'Gamma Construções', type: 'corporate' as const },
  { id: '6', name: 'Carlos Eduardo Ferreira', type: 'individual' as const },
  { id: '7', name: 'Delta Empreiteira Ltda', type: 'corporate' as const },
  { id: '8', name: 'Ana Paula Rodrigues', type: 'individual' as const },
];

// Mock equipments for rentals
const rentalEquipments = [
  { id: '1', name: 'Betoneira 400L Industrial', dailyPrice: 120 },
  { id: '2', name: 'Escavadeira Hidráulica 20 Ton', dailyPrice: 800 },
  { id: '3', name: 'Empilhadeira Elétrica 2.5 Ton', dailyPrice: 400 },
  { id: '4', name: 'Gerador Diesel 50kVA', dailyPrice: 300 },
  { id: '5', name: 'Martelo Demolidor 20kg', dailyPrice: 80 },
  { id: '6', name: 'Compressor Parafuso 100HP', dailyPrice: 350 },
  { id: '7', name: 'Retroescavadeira JCB', dailyPrice: 650 },
  { id: '8', name: 'Guindaste 25 Toneladas', dailyPrice: 1200 },
  { id: '9', name: 'Parafusadeira Industrial', dailyPrice: 45 },
  { id: '10', name: 'Serra Circular Industrial', dailyPrice: 85 },
];

function createRental(customer: typeof rentalCustomers[0]): Rental {
  const startDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 30));
  const totalDays = randomBetween(3, 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays);
  
  // Create equipment list for this rental
  const selectedEquipments = [
    {
      id: "1",
      name: randomFromArray(["Betoneira 400L", "Escavadeira CAT-320", "Gerador 50kVA"]),
      quantity: randomBetween(1, 3),
      dailyPrice: randomBetween(100, 800),
      totalPrice: 0
    }
  ];
  
  // Calculate total price for each equipment
  selectedEquipments.forEach(eq => {
    eq.totalPrice = eq.dailyPrice * eq.quantity * totalDays;
  });

  const totalValue = selectedEquipments.reduce((sum, eq) => sum + eq.totalPrice, 0);
  const deliveryFee = randomBetween(0, 500);
  const deposit = Math.round(totalValue * 0.2); // 20% de caução
  
  const statusOptions = ['active', 'completed', 'active', 'active', 'overdue', 'completed'];
  const status = randomFromArray(statusOptions) as Rental['status'];
  
  const paidPercentage = status === 'completed' ? 1 : randomBetween(0.3, 0.9);
  const paidValue = Math.round(totalValue * paidPercentage);
  const pendingValue = totalValue - paidValue;

  return {
    id: generateId(),
    contractNumber: `LM-${new Date().getFullYear()}-${String(randomBetween(1000, 9999))}`,
    customerId: customer.id,
    customerName: customer.name,
    customerType: customer.type,
    equipments: selectedEquipments,
    status,
    startDate,
    endDate,
    actualReturnDate: status === 'completed' ? 
      new Date(endDate.getTime() + randomBetween(-2, 5) * 24 * 60 * 60 * 1000) : 
      undefined,
    totalDays,
    totalValue: totalValue + deliveryFee,
    paidValue,
    pendingValue,
    deposit,
    deliveryAddress: {
      street: randomFromArray([
        'Av. Paulista, 1000', 'Rua da Consolação, 500', 'Av. Brasil, 2500',
        'Rua XV de Novembro, 800', 'Av. Faria Lima, 1500', 'Rua do Comércio, 300'
      ]),
      number: `${randomBetween(100, 9999)}`,
      city: randomFromArray(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Campinas']),
      state: randomFromArray(['SP', 'RJ', 'MG']),
      zipCode: `${randomBetween(10000, 99999)}-${randomBetween(100, 999)}`
    },
    deliveryType: randomFromArray(['pickup', 'delivery', 'both']),
    deliveryFee,
    observations: Math.random() > 0.7 ? 
      randomFromArray([
        'Cliente solicitou entrega no período da manhã',
        'Equipamento para obra em local de difícil acesso',
        'Cliente preferencial - desconto aplicado',
        'Urgente - entrega prioritária'
      ]) : undefined,
    checkIn: status !== 'draft' ? {
      date: startDate,
      photos: [`checkin_${generateId()}_1.jpg`, `checkin_${generateId()}_2.jpg`],
      condition: randomFromArray(['Excelente', 'Bom', 'Regular']),
      responsiblePerson: randomFromArray(['João Silva', 'Maria Santos', 'Carlos Lima', 'Ana Costa'])
    } : undefined,
    checkOut: status === 'completed' ? {
      date: endDate,
      photos: [`checkout_${generateId()}_1.jpg`, `checkout_${generateId()}_2.jpg`],
      condition: randomFromArray(['Excelente', 'Bom', 'Regular', 'Desgastado']),
      responsiblePerson: randomFromArray(['João Silva', 'Maria Santos', 'Carlos Lima', 'Ana Costa']),
      damages: Math.random() > 0.8 ? ['Pequeno risco na lateral', 'Desgaste normal de uso'] : undefined
    } : undefined,
    createdAt: randomDate(new Date(2024, 0, 1), startDate),
    updatedAt: new Date(),
    createdBy: 'admin'
  };
}

// Generate all mock rentals
export const mockRentals: Rental[] = Array.from({ length: 45 }, (_, index) => {
  const customer = rentalCustomers[index % rentalCustomers.length];
  return createRental(customer);
});

// Utility functions for rentals
export async function getRentalById(id: string): Promise<Rental | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRentals.find(rental => rental.id === id) || null;
}

export async function getRentalsByCustomer(customerId: string): Promise<Rental[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockRentals.filter(rental => rental.customerId === customerId);
}

export async function getActiveRentals(): Promise<Rental[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRentals.filter(rental => rental.status === 'active');
}

export async function getOverdueRentals(): Promise<Rental[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockRentals.filter(rental => rental.status === 'overdue');
}

export async function getAllRentals(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
    customerType?: 'individual' | 'corporate';
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): Promise<{
  data: Rental[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = mockRentals;

  if (filters) {
    if (filters.status) {
      filtered = filtered.filter(rental => rental.status === filters.status);
    }
    if (filters.customerType) {
      filtered = filtered.filter(rental => rental.customerType === filters.customerType);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(rental => 
        rental.customerName.toLowerCase().includes(query) ||
        rental.contractNumber.toLowerCase().includes(query) ||
        rental.equipments.some(eq => eq.name.toLowerCase().includes(query))
      );
    }
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(rental => rental.startDate >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(rental => rental.endDate <= endDate);
    }
  }

  // Sort by creation date (newest first)
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return { data, pagination: { page, limit, total, totalPages } };
}

// Rental analytics
export interface RentalAnalytics {
  totalRentals: number;
  activeRentals: number;
  completedRentals: number;
  overdueRentals: number;
  totalRevenue: number;
  avgRentalValue: number;
  avgRentalDays: number;
  popularEquipments: { name: string; count: number; revenue: number; }[];
  monthlyRevenue: { month: string; revenue: number; rentals: number; }[];
}

export async function getRentalAnalytics(): Promise<RentalAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const totalRentals = mockRentals.length;
  const activeRentals = mockRentals.filter(r => r.status === 'active').length;
  const completedRentals = mockRentals.filter(r => r.status === 'completed').length;
  const overdueRentals = mockRentals.filter(r => r.status === 'overdue').length;
  
  const totalRevenue = mockRentals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.totalValue, 0);
  
  const avgRentalValue = totalRevenue / completedRentals || 0;
  const avgRentalDays = mockRentals.reduce((sum, r) => sum + r.totalDays, 0) / totalRentals || 0;

  // Popular equipments
  const equipmentStats: { [key: string]: { count: number; revenue: number; } } = {};
  mockRentals.forEach(rental => {
    rental.equipments.forEach(eq => {
      if (!equipmentStats[eq.name]) {
        equipmentStats[eq.name] = { count: 0, revenue: 0 };
      }
      equipmentStats[eq.name].count += eq.quantity;
      if (rental.status === 'completed') {
        equipmentStats[eq.name].revenue += eq.totalPrice;
      }
    });
  });

  const popularEquipments = Object.entries(equipmentStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Monthly revenue
  const monthlyStats: { [key: string]: { revenue: number; rentals: number; } } = {};
  mockRentals
    .filter(r => r.status === 'completed')
    .forEach(rental => {
      const month = rental.startDate.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { revenue: 0, rentals: 0 };
      }
      monthlyStats[month].revenue += rental.totalValue;
      monthlyStats[month].rentals += 1;
    });

  const monthlyRevenue = Object.entries(monthlyStats)
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  return {
    totalRentals,
    activeRentals,
    completedRentals,
    overdueRentals,
    totalRevenue,
    avgRentalValue,
    avgRentalDays,
    popularEquipments,
    monthlyRevenue
  };
}
