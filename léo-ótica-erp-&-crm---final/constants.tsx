import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, ClipboardList, Package, DollarSign, Wallet } from 'lucide-react';
import { Client, ServiceOrder, OrderStatus, Product, Transaction, TransactionType, PaymentMethod } from './types';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'pos', label: 'Nova Venda / O.S.', icon: <ShoppingCart size={20} /> },
  { id: 'cashflow', label: 'Lançar Caixa', icon: <Wallet size={20} /> },
  { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} /> },
  { id: 'crm', label: 'Clientes (CRM)', icon: <Users size={20} /> },
  { id: 'orders', label: 'Ordens de Serviço', icon: <ClipboardList size={20} /> },
  { id: 'inventory', label: 'Estoque', icon: <Package size={20} /> },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 1, name: 'Ana Silva', phone: '(11) 99876-5432', address: 'Rua das Palmeiras, 45, Centro', lastVisit: '2023-01-15', npsScore: 9 },
  { id: 2, name: 'Carlos Oliveira', phone: '(11) 98765-4321', address: 'Av. Paulista, 1000, apt 402', lastVisit: '2024-02-10', npsScore: 10 },
  { id: 3, name: 'Roberto Santos', phone: '(11) 91234-5678', address: 'Rua Augusta, 500, Jardins', lastVisit: '2022-11-05', npsScore: 8 },
  { id: 4, name: 'Mariana Costa', phone: '(11) 97777-6666', address: 'Al. Lorena, 300, Casa 2', lastVisit: '2024-03-01', npsScore: undefined },
  { id: 5, name: 'Fernanda Lima', phone: '(11) 95555-4444', address: 'Rua Oscar Freire, 100, Pinheiros', lastVisit: '2024-03-15', npsScore: 10 },
];

export const MOCK_ORDERS: ServiceOrder[] = [
  { id: 1023, clientId: 1, clientName: 'Ana Silva', totalValue: 1250.00, status: OrderStatus.ASSEMBLY, createdAt: '2024-03-10', deliveryDate: '2024-03-18', items: ['Ray-Ban Aviator', 'Lente Varilux'] },
  { id: 1024, clientId: 2, clientName: 'Carlos Oliveira', totalValue: 890.00, status: OrderStatus.PENDING, createdAt: '2024-03-12', deliveryDate: '2024-03-20', items: ['Oakley Holbrook', 'Lente Hoya'] },
  { id: 1025, clientId: 3, clientName: 'Roberto Santos', totalValue: 2100.00, status: OrderStatus.READY, createdAt: '2024-03-05', deliveryDate: '2024-03-12', items: ['Armação Armani', 'Lente Zeiss'] },
  { id: 1026, clientId: 4, clientName: 'Mariana Costa', totalValue: 450.00, status: OrderStatus.LAB_SENT, createdAt: '2024-03-11', deliveryDate: '2024-03-19', items: ['Lente de Contato Acuvue'] },
  { id: 1027, clientId: 5, clientName: 'Fernanda Lima', totalValue: 3200.00, status: OrderStatus.QA, createdAt: '2024-03-13', deliveryDate: '2024-03-21', items: ['Prada Sunglasses', 'Lente Transitions'] },
  { id: 1028, clientId: 1, clientName: 'Ana Silva', totalValue: 150.00, status: OrderStatus.DELIVERED, createdAt: '2024-02-01', deliveryDate: '2024-02-05', items: ['Ajuste Armação'] },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Ray-Ban Aviator', sku: 'RB3025', type: 'FRAME', brand: 'Ray-Ban', price: 750.00, costPrice: 350.00, stock: 12, minStock: 5 },
  { id: 2, name: 'Oakley Holbrook', sku: 'OK9102', type: 'FRAME', brand: 'Oakley', price: 680.00, costPrice: 300.00, stock: 3, minStock: 5 },
  { id: 3, name: 'Lente Multifocal Premium', sku: 'LMP-167', type: 'LENS', brand: 'Varilux', price: 1200.00, costPrice: 500.00, stock: 100, minStock: 20 },
  { id: 4, name: 'Lente Anti-Blue Simples', sku: 'LAB-159', type: 'LENS', brand: 'Hoya', price: 350.00, costPrice: 100.00, stock: 100, minStock: 20 },
  { id: 5, name: 'Solução Limpeza 50ml', sku: 'ACC-001', type: 'ACCESSORY', brand: 'CleanView', price: 25.00, costPrice: 8.00, stock: 45, minStock: 50 },
  { id: 6, name: 'Acuvue Oasys', sku: 'LC-002', type: 'CONTACT_LENS', brand: 'J&J', price: 180.00, costPrice: 90.00, stock: 8, minStock: 10 },
  { id: 7, name: 'Vogue Eyewear', sku: 'VG-2023', type: 'FRAME', brand: 'Vogue', price: 550.00, costPrice: 220.00, stock: 15, minStock: 5 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, description: 'Venda O.S. #1023', amount: 1250.00, type: TransactionType.INCOME, category: 'Vendas', date: '2024-03-10', paymentMethod: PaymentMethod.CREDIT_CARD, status: 'Pago' },
  { id: 2, description: 'Compra de Estoque (Luxottica)', amount: 4500.00, type: TransactionType.EXPENSE, category: 'Fornecedores', date: '2024-03-11', paymentMethod: PaymentMethod.BOLETO, status: 'Pago' },
  { id: 3, description: 'Venda O.S. #1024', amount: 890.00, type: TransactionType.INCOME, category: 'Vendas', date: '2024-03-12', paymentMethod: PaymentMethod.PIX, status: 'Pago' },
  { id: 4, description: 'Conta de Energia', amount: 320.50, type: TransactionType.EXPENSE, category: 'Custos Fixos', date: '2024-03-15', paymentMethod: PaymentMethod.BOLETO, status: 'Pendente' },
  { id: 5, description: 'Venda Balcão', amount: 150.00, type: TransactionType.INCOME, category: 'Acessórios', date: '2024-03-15', paymentMethod: PaymentMethod.CASH, status: 'Pago' },
  { id: 6, description: 'Aluguel Loja', amount: 2800.00, type: TransactionType.EXPENSE, category: 'Custos Fixos', date: '2024-03-05', paymentMethod: PaymentMethod.BOLETO, status: 'Pago' },
];

export const MOCK_FINANCIAL_MONTHLY = [
  { name: 'Jan', receitas: 45000, despesas: 32000, lucro: 13000 },
  { name: 'Fev', receitas: 52000, despesas: 34000, lucro: 18000 },
  { name: 'Mar', receitas: 48000, despesas: 31000, lucro: 17000 },
  { name: 'Abr', receitas: 51000, despesas: 42000, lucro: 9000 },
  { name: 'Mai', receitas: 58000, despesas: 38000, lucro: 20000 },
  { name: 'Jun', receitas: 62000, despesas: 39000, lucro: 23000 },
  { name: 'Jul', receitas: 59000, despesas: 36000, lucro: 23000 },
  { name: 'Ago', receitas: 65000, despesas: 41000, lucro: 24000 },
  { name: 'Set', receitas: 61000, despesas: 38000, lucro: 23000 },
  { name: 'Out', receitas: 68000, despesas: 45000, lucro: 23000 },
  { name: 'Nov', receitas: 75000, despesas: 52000, lucro: 23000 },
  { name: 'Dez', receitas: 88000, despesas: 55000, lucro: 33000 },
];

export const MOCK_FINANCIAL_DAILY = [
  { day: '01', entrada: 2500, saida: 1200 },
  { day: '02', entrada: 3200, saida: 800 },
  { day: '03', entrada: 1800, saida: 4500 },
  { day: '04', entrada: 4100, saida: 200 },
  { day: '05', entrada: 2900, saida: 2800 },
  { day: '06', entrada: 3800, saida: 1100 },
  { day: '07', entrada: 5100, saida: 900 },
  { day: '08', entrada: 2200, saida: 500 },
  { day: '09', entrada: 1500, saida: 300 },
  { day: '10', entrada: 4800, saida: 1500 },
  { day: '11', entrada: 3500, saida: 2000 },
  { day: '12', entrada: 2900, saida: 800 },
  { day: '13', entrada: 4200, saida: 1000 },
  { day: '14', entrada: 5500, saida: 4200 },
  { day: '15', entrada: 3100, saida: 600 },
];