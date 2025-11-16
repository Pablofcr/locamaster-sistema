import { v4 as uuidv4 } from 'uuid';

// Utility functions for mock data
export const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const randomDelay = (min: number = 300, max: number = 1500) =>
  simulateDelay(Math.floor(Math.random() * (max - min + 1)) + min);

export const generateId = (): string => uuidv4();

export const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomFromArray = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('pt-BR').format(date);

// Base types for mock data
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment extends BaseEntity {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  condition: 'new' | 'good' | 'fair' | 'needs_repair';
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  acquisitionDate: Date;
  lastMaintenanceDate: Date | null;
  nextMaintenanceDate: Date | null;
  specifications: Record<string, any>;
  photos: string[];
  qrCode: string;
  location: string;
  notes?: string;
}

export interface Customer extends BaseEntity {
  type: 'individual' | 'corporate';
  name: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'active' | 'inactive' | 'blocked';
  creditLimit: number;
  currentDebt: number;
  notes?: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  categories: string[];
  status: 'active' | 'inactive';
  notes?: string;
}

export interface RentalContract extends BaseEntity {
  contractNumber: string;
  customerId: string;
  equipmentIds: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  totalAmount: number;
  paymentTerms: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerId: string;
  contractId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  paymentDate?: Date;
  notes?: string;
}

export interface MaintenanceRecord extends BaseEntity {
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  description: string;
  cost: number;
  supplierId?: string;
  technician: string;
  notes?: string;
}

// Sample categories and data constants
export const EQUIPMENT_CATEGORIES = [
  'Construção Civil',
  'Industrial',
  'Automotivo',
  'Jardinagem',
  'Limpeza',
  'Eventos',
  'Ferramentas',
  'Transporte'
] as const;

export const EQUIPMENT_SUBCATEGORIES: Record<string, string[]> = {
  'Construção Civil': [
    'Escavadeiras', 'Betoneiras', 'Andaimes', 'Compactadores',
    'Geradores', 'Furadeiras', 'Serras', 'Martelos'
  ],
  'Industrial': [
    'Empilhadeiras', 'Guindastes', 'Soldadores', 'Compressores',
    'Bombas', 'Motores', 'Transformadores', 'Prensas'
  ],
  'Automotivo': [
    'Elevadores', 'Macaco Hidráulico', 'Compressor de Ar',
    'Equipamento de Diagnóstico', 'Lavadora de Pressão'
  ],
  'Jardinagem': [
    'Cortadores de Grama', 'Motosserras', 'Roçadeiras',
    'Pulverizadores', 'Sopradores'
  ],
  'Limpeza': [
    'Aspiradores Industriais', 'Enceradeiras', 'Lavadoras de Pressão',
    'Aspiradores de Pó e Água'
  ],
  'Eventos': [
    'Tendas', 'Cadeiras', 'Mesas', 'Som e Iluminação',
    'Geradores', 'Ar Condicionado'
  ],
  'Ferramentas': [
    'Furadeiras', 'Parafusadeiras', 'Serras', 'Lixadeiras',
    'Plainas', 'Tupias'
  ],
  'Transporte': [
    'Carrinhos de Carga', 'Empilhadeiras', 'Paletes',
    'Containers', 'Guindastes'
  ]
};

export const EQUIPMENT_BRANDS = [
  'Caterpillar', 'Komatsu', 'JCB', 'Bobcat', 'Volvo',
  'Makita', 'DeWalt', 'Bosch', 'Black & Decker', 'Stanley',
  'Husqvarna', 'Stihl', 'Honda', 'Yamaha', 'Kawasaki',
  'Atlas Copco', 'Ingersoll Rand', 'Gardner Denver'
] as const;

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const CITIES_BY_STATE = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
  // Add more as needed
} as const;
