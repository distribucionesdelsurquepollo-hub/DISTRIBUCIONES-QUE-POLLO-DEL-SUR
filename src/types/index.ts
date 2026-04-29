export enum Unit {
  KG = 'kg',
  UNIT = 'unit'
}

export enum Role {
  ADMIN = 'admin',
  SELLER = 'seller'
}

export interface BusinessConfig {
  name: string;
  nit: string;
  phone1: string;
  phone2: string;
  addressMain: string;
  addressWarehouse: string;
  email: string;
  manager: string;
  logoUrl?: string;
}

export interface Product {
  id?: string;
  name: string;
  unit: Unit;
  stock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  category: string;
}

export interface Provider {
  id?: string;
  name: string;
  phone: string;
}

export interface CartItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  unit: Unit;
}

export interface Purchase {
  id?: string;
  providerId: string;
  providerName: string;
  date: any; // Firestore Timestamp
  items: CartItem[];
  total: number;
  paymentMethod: string;
  advance: number;
  isDeboned?: boolean;
}

export interface Sale {
  id?: string;
  customerName: string;
  date: any; // Firestore Timestamp
  items: CartItem[];
  total: number;
  paymentMethod: string;
  advance: number;
}

export interface Deboning {
  id?: string;
  date: any;
  purchaseId?: string;
  sourceProductId: string;
  sourceQty: number;
  resultItems: {
    productId: string;
    name: string;
    qty: number;
  }[];
}

export interface CashSession {
  id?: string;
  date: string; // YYYY-MM-DD
  initialBase: number;
  status: 'open' | 'closed';
  totalSales: number;
  totalPurchases: number;
  totalEntries: number;
  totalExits: number;
  closingBalance: number;
}

export interface CashMovement {
  id?: string;
  type: 'entry' | 'exit';
  amount: number;
  reason: string;
  date: any;
  userId: string;
}

export interface Employee {
  id?: string;
  name: string;
  salary: number;
  active: boolean;
}

export interface Attendance {
  id?: string;
  employeeId: string;
  date: string;
  checkIn: any;
  checkOut?: any;
  novedades?: string;
}

export interface EmployeeAdvance {
  id?: string;
  employeeId: string;
  amount: number;
  date: any;
  reason: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  name: string;
}
