import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import SellerDashboardInteractive from './components/SellerDashboardInteractive';

export const metadata: Metadata = {
  title: 'Dashboard do Vendedor - MultiTenant CRM',
  description: 'Gerencie seus leads, acompanhe seu desempenho de vendas e acesse métricas pessoais em tempo real no dashboard do vendedor.',
};

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="seller" companyName="Empresa Demo" />
      <Header
        userRole="seller"
        companyName="Empresa Demo"
        userName="Carlos Vendedor"
      />
      <main className="lg:ml-60 pt-20">
        <div className="p-4 lg:p-8">
          <SellerDashboardInteractive />
        </div>
      </main>
    </div>
  );
}