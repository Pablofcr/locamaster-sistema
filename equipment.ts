import { 
  Equipment, 
  generateId, 
  randomBetween, 
  randomFromArray, 
  randomDate, 
  addDays,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_SUBCATEGORIES,
  EQUIPMENT_BRANDS 
} from './types';

// Generate realistic equipment data
function createEquipment(
  name: string,
  category: string,
  subcategory: string,
  brand: string,
  model: string,
  basePrice: number
): Equipment {
  const id = generateId();
  const acquisitionDate = randomDate(
    new Date(2020, 0, 1),
    new Date(2024, 11, 31)
  );
  
  const lastMaintenance = Math.random() > 0.3 
    ? randomDate(acquisitionDate, new Date()) 
    : null;
  
  const nextMaintenance = lastMaintenance 
    ? addDays(lastMaintenance, randomBetween(30, 180))
    : addDays(acquisitionDate, randomBetween(90, 365));

  return {
    id,
    name,
    category,
    subcategory,
    brand,
    model,
    serialNumber: `${brand.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}${randomBetween(100, 999)}`,
    status: randomFromArray(['available', 'available', 'available', 'rented', 'maintenance']),
    condition: randomFromArray(['new', 'good', 'good', 'fair']),
    dailyPrice: basePrice,
    weeklyPrice: basePrice * 6, // Desconto semanal
    monthlyPrice: basePrice * 24, // Desconto mensal
    acquisitionDate,
    lastMaintenanceDate: lastMaintenance,
    nextMaintenanceDate: nextMaintenance,
    specifications: generateSpecifications(category, subcategory),
    photos: [
      `/images/equipment/${category.toLowerCase()}/${subcategory.toLowerCase()}-1.jpg`,
      `/images/equipment/${category.toLowerCase()}/${subcategory.toLowerCase()}-2.jpg`,
    ],
    qrCode: `QR${id.split('-')[0].toUpperCase()}`,
    location: randomFromArray(['Depósito A', 'Depósito B', 'Em Trânsito', 'Cliente']),
    notes: Math.random() > 0.7 ? 'Equipamento em excelente estado' : undefined,
    createdAt: acquisitionDate,
    updatedAt: new Date(),
  };
}

function generateSpecifications(category: string, subcategory: string): Record<string, any> {
  const base = {
    peso: `${randomBetween(10, 500)}kg`,
    dimensões: `${randomBetween(50, 300)}x${randomBetween(30, 200)}x${randomBetween(40, 150)}cm`,
    anoFabricação: randomBetween(2018, 2024),
  };

  switch (category) {
    case 'Construção Civil':
      return {
        ...base,
        potência: `${randomBetween(1, 50)}HP`,
        capacidade: `${randomBetween(100, 2000)}L`,
        voltagem: randomFromArray(['110V', '220V', '380V']),
        consumo: `${randomBetween(500, 3000)}W`,
      };
    
    case 'Industrial':
      return {
        ...base,
        potência: `${randomBetween(5, 100)}HP`,
        capacidadeCarga: `${randomBetween(500, 5000)}kg`,
        alcanceMaximo: `${randomBetween(3, 20)}m`,
        voltagem: randomFromArray(['220V', '380V', '440V']),
        certificacao: 'ISO 9001',
      };
    
    case 'Ferramentas':
      return {
        ...base,
        potência: `${randomBetween(500, 2500)}W`,
        velocidade: `${randomBetween(1000, 25000)}rpm`,
        mandril: randomFromArray(['6mm', '10mm', '13mm']),
        voltagem: randomFromArray(['110V', '220V']),
        tipoBateria: Math.random() > 0.5 ? '18V Li-ion' : undefined,
      };
    
    default:
      return base;
  }
}

// Equipment definitions with realistic names, categories, and prices
const equipmentDefinitions = [
  // Construção Civil
  { name: 'Betoneira 400L Industrial', category: 'Construção Civil', subcategory: 'Betoneiras', brand: 'Makita', model: 'BT-400', price: 120 },
  { name: 'Escavadeira Hidráulica 20 Ton', category: 'Construção Civil', subcategory: 'Escavadeiras', brand: 'Caterpillar', model: 'CAT-320', price: 800 },
  { name: 'Compactador de Solo Vibratório', category: 'Construção Civil', subcategory: 'Compactadores', brand: 'JCB', model: 'VMT-400', price: 200 },
  { name: 'Gerador Diesel 50kVA', category: 'Construção Civil', subcategory: 'Geradores', brand: 'Volvo', model: 'GEN-50D', price: 300 },
  { name: 'Andaime Fachadeiro 2m x 1m', category: 'Construção Civil', subcategory: 'Andaimes', brand: 'Stanley', model: 'AND-2x1', price: 25 },
  { name: 'Furadeira de Impacto Industrial', category: 'Construção Civil', subcategory: 'Furadeiras', brand: 'DeWalt', model: 'DI-1500', price: 45 },
  { name: 'Serra Circular 1800W', category: 'Construção Civil', subcategory: 'Serras', brand: 'Makita', model: 'SC-1800', price: 35 },
  { name: 'Martelo Demolidor 20kg', category: 'Construção Civil', subcategory: 'Martelos', brand: 'Bosch', model: 'MD-20K', price: 80 },

  // Industrial
  { name: 'Empilhadeira Elétrica 2.5 Ton', category: 'Industrial', subcategory: 'Empilhadeiras', brand: 'Komatsu', model: 'EMP-2.5E', price: 400 },
  { name: 'Guindaste Móvel 15 Ton', category: 'Industrial', subcategory: 'Guindastes', brand: 'Volvo', model: 'GM-15T', price: 1200 },
  { name: 'Soldador MIG 250A', category: 'Industrial', subcategory: 'Soldadores', brand: 'Ingersoll Rand', model: 'SOL-250M', price: 180 },
  { name: 'Compressor Parafuso 100HP', category: 'Industrial', subcategory: 'Compressores', brand: 'Atlas Copco', model: 'CP-100HP', price: 350 },
  { name: 'Bomba Centrífuga 500GPM', category: 'Industrial', subcategory: 'Bombas', brand: 'Gardner Denver', model: 'BC-500', price: 250 },
  { name: 'Motor Elétrico 75HP', category: 'Industrial', subcategory: 'Motores', brand: 'Caterpillar', model: 'ME-75HP', price: 280 },
  { name: 'Transformador 150kVA', category: 'Industrial', subcategory: 'Transformadores', brand: 'Volvo', model: 'TR-150K', price: 600 },
  { name: 'Prensa Hidráulica 200 Ton', category: 'Industrial', subcategory: 'Prensas', brand: 'JCB', model: 'PH-200T', price: 500 },

  // Automotivo
  { name: 'Elevador Automotivo 4 Ton', category: 'Automotivo', subcategory: 'Elevadores', brand: 'Bosch', model: 'EL-4T', price: 300 },
  { name: 'Macaco Hidráulico 20 Ton', category: 'Automotivo', subcategory: 'Macaco Hidráulico', brand: 'Stanley', model: 'MH-20T', price: 60 },
  { name: 'Compressor de Ar 100L', category: 'Automotivo', subcategory: 'Compressor de Ar', brand: 'Atlas Copco', model: 'CA-100L', price: 90 },
  { name: 'Scanner Automotivo OBD2', category: 'Automotivo', subcategory: 'Equipamento de Diagnóstico', brand: 'Bosch', model: 'SC-OBD2', price: 50 },
  { name: 'Lavadora de Pressão 2200PSI', category: 'Automotivo', subcategory: 'Lavadora de Pressão', brand: 'Black & Decker', model: 'LP-2200', price: 75 },

  // Jardinagem
  { name: 'Cortador de Grama 5HP', category: 'Jardinagem', subcategory: 'Cortadores de Grama', brand: 'Honda', model: 'CG-5HP', price: 40 },
  { name: 'Motosserra 18" Profissional', category: 'Jardinagem', subcategory: 'Motosserras', brand: 'Husqvarna', model: 'MS-18P', price: 55 },
  { name: 'Roçadeira Costal 52cc', category: 'Jardinagem', subcategory: 'Roçadeiras', brand: 'Stihl', model: 'RC-52CC', price: 35 },
  { name: 'Pulverizador Costal 20L', category: 'Jardinagem', subcategory: 'Pulverizadores', brand: 'Yamaha', model: 'PU-20L', price: 25 },
  { name: 'Soprador de Folhas 65cc', category: 'Jardinagem', subcategory: 'Sopradores', brand: 'Kawasaki', model: 'SF-65CC', price: 30 },

  // Limpeza
  { name: 'Aspirador Industrial 80L', category: 'Limpeza', subcategory: 'Aspiradores Industriais', brand: 'Black & Decker', model: 'AI-80L', price: 85 },
  { name: 'Enceradeira Industrial 510mm', category: 'Limpeza', subcategory: 'Enceradeiras', brand: 'Makita', model: 'EN-510', price: 70 },
  { name: 'Lavadora de Alta Pressão 1800PSI', category: 'Limpeza', subcategory: 'Lavadoras de Pressão', brand: 'Bosch', model: 'LAP-1800', price: 65 },
  { name: 'Aspirador Pó e Água 1600W', category: 'Limpeza', subcategory: 'Aspiradores de Pó e Água', brand: 'DeWalt', model: 'APA-1600', price: 55 },

  // Eventos
  { name: 'Tenda Piramidal 10x10m', category: 'Eventos', subcategory: 'Tendas', brand: 'Stanley', model: 'TP-10x10', price: 150 },
  { name: 'Cadeira Plástica Branca', category: 'Eventos', subcategory: 'Cadeiras', brand: 'Stanley', model: 'CP-001', price: 5 },
  { name: 'Mesa Redonda 1,60m', category: 'Eventos', subcategory: 'Mesas', brand: 'Stanley', model: 'MR-160', price: 15 },
  { name: 'Sistema de Som 500W', category: 'Eventos', subcategory: 'Som e Iluminação', brand: 'Yamaha', model: 'SS-500W', price: 120 },
  { name: 'Gerador Silencioso 10kVA', category: 'Eventos', subcategory: 'Geradores', brand: 'Honda', model: 'GS-10KVA', price: 200 },
  { name: 'Ar Condicionado Portátil 18kBTU', category: 'Eventos', subcategory: 'Ar Condicionado', brand: 'Volvo', model: 'ACP-18K', price: 100 },

  // Ferramentas
  { name: 'Furadeira de Bancada 1/2"', category: 'Ferramentas', subcategory: 'Furadeiras', brand: 'DeWalt', model: 'FB-12', price: 40 },
  { name: 'Parafusadeira Impacto 1/2"', category: 'Ferramentas', subcategory: 'Parafusadeiras', brand: 'Makita', model: 'PI-12', price: 35 },
  { name: 'Serra Tico-Tico Profissional', category: 'Ferramentas', subcategory: 'Serras', brand: 'Bosch', model: 'STP-001', price: 30 },
  { name: 'Lixadeira Orbital 1/4"', category: 'Ferramentas', subcategory: 'Lixadeiras', brand: 'Black & Decker', model: 'LO-14', price: 25 },
  { name: 'Plaina Elétrica 82mm', category: 'Ferramentas', subcategory: 'Plainas', brand: 'Makita', model: 'PE-82', price: 45 },
  { name: 'Tupia 1200W com Base', category: 'Ferramentas', subcategory: 'Tupias', brand: 'DeWalt', model: 'TU-1200', price: 50 },

  // Transporte
  { name: 'Carrinho de Carga 500kg', category: 'Transporte', subcategory: 'Carrinhos de Carga', brand: 'Stanley', model: 'CC-500K', price: 20 },
  { name: 'Empilhadeira Manual 2T', category: 'Transporte', subcategory: 'Empilhadeiras', brand: 'JCB', model: 'EM-2T', price: 80 },
  { name: 'Palete PBR 1,20x1,00m', category: 'Transporte', subcategory: 'Paletes', brand: 'Stanley', model: 'PP-120x100', price: 12 },
  { name: 'Container 20 Pés', category: 'Transporte', subcategory: 'Containers', brand: 'Caterpillar', model: 'CT-20P', price: 150 },
  { name: 'Guindaste Torre 8 Ton', category: 'Transporte', subcategory: 'Guindastes', brand: 'Komatsu', model: 'GT-8T', price: 900 },
];

// Generate mock equipment data
export const mockEquipment: Equipment[] = equipmentDefinitions.map(def => 
  createEquipment(def.name, def.category, def.subcategory, def.brand, def.model, def.price)
);

// Utility functions for equipment
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return mockEquipment.find(eq => eq.id === id) || null;
}

export async function getEquipmentByCategory(category: string): Promise<Equipment[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return mockEquipment.filter(eq => eq.category === category);
}

export async function getAvailableEquipment(): Promise<Equipment[]> {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
  return mockEquipment.filter(eq => eq.status === 'available');
}

export async function searchEquipment(query: string): Promise<Equipment[]> {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
  const normalizedQuery = query.toLowerCase();
  
  return mockEquipment.filter(eq => 
    eq.name.toLowerCase().includes(normalizedQuery) ||
    eq.category.toLowerCase().includes(normalizedQuery) ||
    eq.subcategory.toLowerCase().includes(normalizedQuery) ||
    eq.brand.toLowerCase().includes(normalizedQuery) ||
    eq.model.toLowerCase().includes(normalizedQuery) ||
    eq.serialNumber.toLowerCase().includes(normalizedQuery)
  );
}

export async function getAllEquipment(
  page: number = 1, 
  limit: number = 20,
  filters?: {
    category?: string;
    status?: string;
    condition?: string;
    search?: string;
  }
): Promise<{
  data: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  let filtered = mockEquipment;

  // Apply filters
  if (filters) {
    if (filters.category) {
      filtered = filtered.filter(eq => eq.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(eq => eq.status === filters.status);
    }
    if (filters.condition) {
      filtered = filtered.filter(eq => eq.condition === filters.condition);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.name.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        eq.brand.toLowerCase().includes(query)
      );
    }
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}
