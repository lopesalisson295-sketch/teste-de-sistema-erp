import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NewSale } from './components/NewSale';
import { CustomerRecall } from './components/CustomerRecall';
import { ServiceOrders } from './components/ServiceOrders';
import { Inventory } from './components/Inventory';
import { Financial } from './components/Financial';
import { CashFlowEntry } from './components/CashFlowEntry';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'pos':
        return <NewSale onNavigate={setActiveTab} />;
      case 'cashflow':
        return <CashFlowEntry />;
      case 'crm':
        return <CustomerRecall />;
      case 'orders':
        return <ServiceOrders />;
      case 'inventory':
        return <Inventory />;
      case 'financial':
        return <Financial />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-6xl mb-4 font-light opacity-20">🚧</div>
            <h2 className="text-xl font-medium">Módulo em Desenvolvimento</h2>
            <p className="text-sm">Selecione "Dashboard", "Nova Venda" ou "CRM" para ver o protótipo.</p>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;