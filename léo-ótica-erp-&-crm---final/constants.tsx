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
  { id: 'employees', label: 'Funcionários', icon: <Users size={20} /> },
];

// Mock data removed - system ready for production use
export const MOCK_CLIENTS: Client[] = [];

export const MOCK_ORDERS: ServiceOrder[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_FINANCIAL_MONTHLY = [];

export const MOCK_FINANCIAL_DAILY = [];