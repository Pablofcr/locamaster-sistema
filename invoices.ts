import { 
  generateId, 
  randomBetween, 
  randomFromArray, 
  randomDate,
} from './types';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerType: 'individual' | 'corporate';
  rentalId?: string;
  contractNumber?: string;
  issueDate: Date;
  dueDate: Date;
  paymentDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    type: 'rental' | 'delivery' | 'fee' | 'deposit' | 'damage';
  }[];
  subtotal: number;
  discounts: number;
  taxes: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod?: 'cash' | 'pix' | 'credit_card' | 'bank_transfer' | 'check';
  observations?: string;
  bankSlipUrl?: string;
  pixCode?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PaymentHistory {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'pix' | 'credit_card' | 'bank_transfer' | 'check';
  date: Date;
  reference?: string;
  observations?: string;
  createdBy: string;
}

// Mock customers for invoices
const invoiceCustomers = [
  { id: '1', name: 'Construtora Alpha Ltda', document: '12.345.678/0001-90', type: 'corporate' as const },
  { id: '2', name: 'João Silva Santos', document: '123.456.789-00', type: 'individual' as const },
  { id: '3', name: 'Beta Engenharia S/A', document: '98.765.432/0001-10', type: 'corporate' as const },
  { id: '4', name: 'Maria Oliveira Costa', document: '987.654.321-00', type: 'individual' as const },
  { id: '5', name: 'Gamma Construções', document: '11.222.333/0001-44', type: 'corporate' as const },
  { id: '6', name: 'Carlos Eduardo Ferreira', document: '456.789.123-00', type: 'individual' as const },
  { id: '7', name: 'Delta Empreiteira Ltda', document: '55.666.777/0001-88', type: 'corporate' as const },
  { id: '8', name: 'Ana Paula Rodrigues', document: '321.654.987-00', type: 'individual' as const },
];

// Mock rental equipment items for invoices
const invoiceItems = [
  { description: 'Locação Betoneira 400L Industrial', type: 'rental' as const, unitPrice: 120 },
  { description: 'Locação Escavadeira Hidráulica 20 Ton', type: 'rental' as const, unitPrice: 800 },
  { description: 'Locação Empilhadeira Elétrica 2.5 Ton', type: 'rental' as const, unitPrice: 400 },
  { description: 'Locação Gerador Diesel 50kVA', type: 'rental' as const, unitPrice: 300 },
  { description: 'Locação Martelo Demolidor 20kg', type: 'rental' as const, unitPrice: 80 },
  { description: 'Locação Compressor Parafuso 100HP', type: 'rental' as const, unitPrice: 350 },
  { description: 'Locação Retroescavadeira JCB', type: 'rental' as const, unitPrice: 650 },
  { description: 'Locação Guindaste 25 Toneladas', type: 'rental' as const, unitPrice: 1200 },
  { description: 'Taxa de Entrega', type: 'delivery' as const, unitPrice: 150 },
  { description: 'Taxa de Retirada', type: 'delivery' as const, unitPrice: 150 },
  { description: 'Caução de Equipamento', type: 'deposit' as const, unitPrice: 1000 },
  { description: 'Taxa de Limpeza', type: 'fee' as const, unitPrice: 50 },
  { description: 'Reparo por Danos', type: 'damage' as const, unitPrice: 500 }
];

function createInvoice(customer: typeof invoiceCustomers[0]): Invoice {
  const issueDate = randomDate(new Date(2024, 0, 1), new Date());
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + randomBetween(7, 30));
  
  const statusOptions = ['sent', 'paid', 'paid', 'overdue', 'sent', 'partial'];
  const status = randomFromArray(statusOptions) as Invoice['status'];
  
  // Create invoice items
  const numItems = randomBetween(1, 4);
  const selectedItems = invoiceItems
    .sort(() => Math.random() - 0.5)
    .slice(0, numItems)
    .map(item => {
      const quantity = item.type === 'rental' ? randomBetween(3, 15) : 1; // days for rental
      const totalPrice = item.unitPrice * quantity;
      
      return {
        id: generateId(),
        description: item.description,
        quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        type: item.type
      };
    });

  const subtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discounts = Math.random() > 0.7 ? Math.round(subtotal * randomBetween(0.05, 0.15)) : 0;
  const taxes = Math.round((subtotal - discounts) * 0.1); // 10% tax
  const totalAmount = subtotal - discounts + taxes;
  
  let paidAmount = 0;
  let paymentDate: Date | undefined;
  let paymentMethod: Invoice['paymentMethod'] | undefined;
  
  if (status === 'paid') {
    paidAmount = totalAmount;
    paymentDate = new Date(dueDate.getTime() - randomBetween(1, 10) * 24 * 60 * 60 * 1000);
    paymentMethod = randomFromArray(['pix', 'bank_transfer', 'credit_card', 'cash']);
  } else if (status === 'partial') {
    paidAmount = Math.round(totalAmount * randomBetween(0.3, 0.7));
    paymentDate = new Date(issueDate.getTime() + randomBetween(1, 5) * 24 * 60 * 60 * 1000);
    paymentMethod = randomFromArray(['pix', 'bank_transfer', 'credit_card']);
  }
  
  const remainingAmount = totalAmount - paidAmount;

  return {
    id: generateId(),
    invoiceNumber: `FAT-${new Date().getFullYear()}-${String(randomBetween(1000, 9999)).padStart(4, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    customerDocument: customer.document,
    customerType: customer.type,
    rentalId: Math.random() > 0.3 ? generateId() : undefined,
    contractNumber: Math.random() > 0.3 ? `LM-${new Date().getFullYear()}-${randomBetween(1000, 9999)}` : undefined,
    issueDate,
    dueDate,
    paymentDate,
    status,
    items: selectedItems,
    subtotal,
    discounts,
    taxes,
    totalAmount,
    paidAmount,
    remainingAmount,
    paymentMethod,
    observations: Math.random() > 0.8 ? 
      randomFromArray([
        'Pagamento antecipado - desconto aplicado',
        'Cliente solicitou parcelamento',
        'Equipamento devolvido em perfeito estado',
        'Faturamento referente ao contrato de locação'
      ]) : undefined,
    bankSlipUrl: status === 'sent' ? `https://bank.example.com/boleto/${generateId()}` : undefined,
    pixCode: status === 'sent' && Math.random() > 0.5 ? generateId().toUpperCase() : undefined,
    createdAt: new Date(issueDate.getTime() - randomBetween(0, 2) * 24 * 60 * 60 * 1000),
    updatedAt: paymentDate || new Date(),
    createdBy: 'admin'
  };
}

// Generate all invoices
export const mockInvoices: Invoice[] = Array.from({ length: 120 }, (_, index) => {
  const customer = invoiceCustomers[index % invoiceCustomers.length];
  return createInvoice(customer);
});

// Generate payment history
export const mockPaymentHistory: PaymentHistory[] = mockInvoices
  .filter(invoice => invoice.paidAmount > 0)
  .flatMap(invoice => {
    const numPayments = invoice.status === 'partial' ? randomBetween(1, 3) : 1;
    return Array.from({ length: numPayments }, () => ({
      id: generateId(),
      invoiceId: invoice.id,
      amount: invoice.status === 'paid' ? invoice.totalAmount : Math.round(invoice.paidAmount / numPayments),
      method: invoice.paymentMethod!,
      date: invoice.paymentDate!,
      reference: `REF-${generateId().substr(0, 8).toUpperCase()}`,
      observations: Math.random() > 0.8 ? 'Pagamento confirmado automaticamente' : undefined,
      createdBy: 'system'
    }));
  });

// Utility functions
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockInvoices.find(invoice => invoice.id === id) || null;
}

export async function getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockInvoices.filter(invoice => invoice.customerId === customerId);
}

export async function getOverdueInvoices(): Promise<Invoice[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockInvoices.filter(invoice => invoice.status === 'overdue');
}

export async function getPendingInvoices(): Promise<Invoice[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockInvoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'partial');
}

export async function getAllInvoices(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: Invoice['status'];
    customerType?: 'individual' | 'corporate';
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): Promise<{
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = mockInvoices;

  if (filters) {
    if (filters.status) {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }
    if (filters.customerType) {
      filtered = filtered.filter(invoice => invoice.customerType === filters.customerType);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerDocument.includes(query)
      );
    }
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(invoice => invoice.issueDate >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(invoice => invoice.issueDate <= endDate);
    }
  }

  // Sort by issue date (newest first)
  filtered.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return { data, pagination: { page, limit, total, totalPages } };
}

// Invoice analytics
export interface InvoiceAnalytics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  avgTicket: number;
  avgPaymentDays: number;
  monthlyRevenue: { month: string; revenue: number; invoices: number; }[];
  paymentMethods: { method: string; amount: number; percentage: number; }[];
}

export async function getInvoiceAnalytics(): Promise<InvoiceAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const totalInvoices = mockInvoices.length;
  const paidInvoices = mockInvoices.filter(i => i.status === 'paid').length;
  const pendingInvoices = mockInvoices.filter(i => i.status === 'sent' || i.status === 'partial').length;
  const overdueInvoices = mockInvoices.filter(i => i.status === 'overdue').length;
  
  const totalRevenue = mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const receivedRevenue = mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const pendingRevenue = mockInvoices
    .filter(i => i.status === 'sent' || i.status === 'partial')
    .reduce((sum, i) => sum + i.remainingAmount, 0);
  const overdueRevenue = mockInvoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + i.remainingAmount, 0);
  
  const avgTicket = totalRevenue / totalInvoices || 0;
  
  // Calculate avg payment days
  const paidInvoicesWithDays = mockInvoices
    .filter(i => i.status === 'paid' && i.paymentDate)
    .map(i => {
      const days = Math.ceil((i.paymentDate!.getTime() - i.issueDate.getTime()) / (1000 * 60 * 60 * 24));
      return days;
    });
  const avgPaymentDays = paidInvoicesWithDays.reduce((sum, days) => sum + days, 0) / paidInvoicesWithDays.length || 0;

  // Monthly revenue
  const monthlyStats: { [key: string]: { revenue: number; invoices: number; } } = {};
  mockInvoices.forEach(invoice => {
    const month = invoice.issueDate.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
    if (!monthlyStats[month]) {
      monthlyStats[month] = { revenue: 0, invoices: 0 };
    }
    monthlyStats[month].revenue += invoice.totalAmount;
    monthlyStats[month].invoices += 1;
  });

  const monthlyRevenue = Object.entries(monthlyStats)
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // Payment methods
  const methodStats: { [key: string]: number } = {};
  mockPaymentHistory.forEach(payment => {
    methodStats[payment.method] = (methodStats[payment.method] || 0) + payment.amount;
  });

  const totalPaid = Object.values(methodStats).reduce((sum, amount) => sum + amount, 0);
  const paymentMethods = Object.entries(methodStats)
    .map(([method, amount]) => ({
      method,
      amount,
      percentage: Math.round((amount / totalPaid) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue,
    receivedRevenue,
    pendingRevenue,
    overdueRevenue,
    avgTicket,
    avgPaymentDays,
    monthlyRevenue,
    paymentMethods
  };
}
