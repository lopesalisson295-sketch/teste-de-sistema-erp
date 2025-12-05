import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NewSale } from './components/NewSale';
import { CustomerRecall } from './components/CustomerRecall';
import { ServiceOrders } from './components/ServiceOrders';
import { Inventory } from './components/Inventory';
import { Financial } from './components/Financial';
import { CashFlowEntry } from './components/CashFlowEntry';
import { Login } from './components/Login';
import { EmployeeManagement } from './components/EmployeeManagement';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; name: string; role: string } | null>(null);

  // Check authentication on mount and listen for auth changes
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({
        username: profile.username,
        name: profile.name,
        role: profile.role
      });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const handleLogin = async (username: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

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
      case 'employees':
        return <EmployeeManagement />;
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

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;