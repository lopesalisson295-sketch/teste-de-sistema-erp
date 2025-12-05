// Enums
export enum OrderStatus {
  PENDING = 'Aguardando Lente',
  LAB_SENT = 'Envio Lab',
  ASSEMBLY = 'Montagem',
  QA = 'Conferência',
  READY = 'Pronto p/ Entrega',
  DELIVERED = 'Entregue'
}

export enum PaymentMethod {
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  CASH = 'Dinheiro',
  PIX = 'PIX',
  BOLETO = 'Boleto'
}

export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída'
}

// Interfaces
export interface Client {
  id: number;
  name: string;
  phone: string;
  address: string;
  lastVisit: string;
  npsScore?: number;
}

export interface Prescription {
  eye: 'OD' | 'OE';
  spherical: number;
  cylindrical: number;
  axis: number;
  add: number;
  pd: number; // Pupillary Distance
}

export interface Exam {
  id: number;
  clientId: number;
  date: string;
  od: Prescription;
  oe: Prescription;
  doctorName: string;
}

export interface Product {
  id: number;
  name: string;
  type: 'FRAME' | 'LENS' | 'CONTACT_LENS' | 'ACCESSORY';
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string;
}

export interface ServiceOrder {
  id: number;
  clientId: number;
  clientName: string;
  totalValue: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string;
  items?: string[];
}

export interface FinancialMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  status: 'Pago' | 'Pendente';
}