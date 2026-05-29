// ============================================================
// MacLaren's PC Store – Core TypeScript Interfaces
// ============================================================

// ---- Categorii Produse ----
export type ProductCategory =
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'Motherboard'
  | 'PSU'
  | 'Storage'
  | 'Case'
  | 'Cooling'
  | 'Monitor'
  | 'Peripherals';

// ---- Socket-uri CPU/MB ----
export type CPUSocket =
  | 'LGA1700'
  | 'LGA1851'
  | 'AM4'
  | 'AM5'
  | 'sTRX5';

// ---- Tip memorie RAM ----
export type RAMType = 'DDR4' | 'DDR5';

// ---- Form Factor placa de bază ----
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';

// ---- Tip stocare ----
export type StorageType = 'SSD' | 'HDD' | 'NVMe';

// ============================================================
// Product & Atribute specifice per categorie
// ============================================================

export interface CPUSpecs {
  socket: CPUSocket;
  cores: number;
  threads: number;
  baseClock: number;   // GHz
  boostClock: number;  // GHz
  tdp: number;         // W
  integratedGraphics: boolean;
}

export interface GPUSpecs {
  vram: number;        // GB
  vramType: string;    // GDDR6X, etc.
  tdp: number;         // W
  length: number;      // mm
  slots: number;       // 2, 2.5, 3
}

export interface RAMSpecs {
  type: RAMType;
  speed: number;       // MHz
  capacity: number;    // GB per module
  modules: number;     // ex: 2 (kit of 2)
  latency: string;     // ex: CL36
}

export interface MotherboardSpecs {
  socket: CPUSocket;
  formFactor: FormFactor;
  chipset: string;
  ramType: RAMType;
  ramSlots: number;
  maxRam: number;      // GB
  m2Slots: number;
  pciSlots: number;
}

export interface PSUSpecs {
  wattage: number;
  efficiency: string;  // 80+ Gold, etc.
  modular: 'Full' | 'Semi' | 'Non';
}

export interface StorageSpecs {
  storageType: StorageType;
  capacity: number;    // GB
  readSpeed: number;   // MB/s
  writeSpeed: number;  // MB/s
  interface: string;   // NVMe PCIe 4.0, SATA III, etc.
}

export interface CaseSpecs {
  formFactor: FormFactor[];
  maxGPULength: number;    // mm
  maxCoolerHeight: number; // mm
  fans: number;
}

export interface CoolingSpecs {
  coolingType: 'Air' | 'AIO Liquid';
  height?: number;         // mm (for air)
  radiatorSize?: number;   // mm (for AIO: 120, 240, 280, 360)
  socket: CPUSocket[];
  tdpRating: number;       // W
}

// Specs map per category
export type ProductSpecs =
  | { category: 'CPU'; specs: CPUSpecs }
  | { category: 'GPU'; specs: GPUSpecs }
  | { category: 'RAM'; specs: RAMSpecs }
  | { category: 'Motherboard'; specs: MotherboardSpecs }
  | { category: 'PSU'; specs: PSUSpecs }
  | { category: 'Storage'; specs: StorageSpecs }
  | { category: 'Case'; specs: CaseSpecs }
  | { category: 'Cooling'; specs: CoolingSpecs }
  | { category: 'Monitor'; specs: Record<string, unknown> }
  | { category: 'Peripherals'; specs: Record<string, unknown> };

// ============================================================
// Review (recenzii produse)
// ============================================================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;          // 1-5
  comment: string;
  createdAt: string;       // ISO date string
}

// ============================================================
// Product (entitatea principală)
// ============================================================

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;          // RON
  stock: number;
  image: string;
  description: string;
  specs: ProductSpecs['specs'];
  rating: number;          // 1-5
  reviewCount: number;
  featured: boolean;
  createdAt: string;       // ISO date string
  reviews?: Review[];
}

// ============================================================
// User & Auth
// ============================================================

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: Address;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  county: string;     // Județ
  postalCode: string;
  country: string;
}

// ============================================================
// Cart
// ============================================================

export interface CartItem {
  product: Product;
  quantity: number;
}

// ============================================================
// Order
// ============================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: 'card' | 'ramburs';
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PC Build (Configurator)
// ============================================================

export interface Build {
  id: string;
  userId: string;
  name: string;
  cpu?: Product;
  gpu?: Product;
  motherboard?: Product;
  ram?: Product;
  storage?: Product[];     // pot fi multiple
  psu?: Product;
  case?: Product;
  cooling?: Product;
  totalPrice: number;
  isCompatible: boolean;
  compatibilityIssues: string[];
  createdAt: string;
  savedAt?: string;
}

// ============================================================
// Compatibility Validation Result
// ============================================================

export interface CompatibilityResult {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  severity: 'error' | 'warning';
  component1: string;
  component2: string;
  message: string;
}

// ============================================================
// UI / Filter state
// ============================================================

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'rating-desc'
  | 'newest';

export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: SortOption;
}
