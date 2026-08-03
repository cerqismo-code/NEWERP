import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Dashboard } from '@/pages/Dashboard';
import { Produtos } from '@/pages/Produtos';
import { Estoque } from '@/pages/Estoque';
import { Conferencia } from '@/pages/Conferencia';
import { Pedidos } from '@/pages/Pedidos';
import { Compras } from '@/pages/Compras';
import { Financeiro } from '@/pages/Financeiro';
import { Relatorios } from '@/pages/Relatorios';
import { Usuarios } from '@/pages/Usuarios';
import { Configuracoes } from '@/pages/Configuracoes';

export function AppShell() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'produtos':
        return <Produtos />;
      case 'estoque':
        return <Estoque />;
      case 'conferencia':
        return <Conferencia />;
      case 'pedidos':
        return <Pedidos />;
      case 'compras':
        return <Compras />;
      case 'financeiro':
        return <Financeiro />;
      case 'relatorios':
        return <Relatorios />;
      case 'usuarios':
        return <Usuarios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar currentPage={currentPage} onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto animate-fade-in" key={currentPage}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
