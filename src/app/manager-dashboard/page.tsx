import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import ManagerDashboardInteractive from './components/ManagerDashboardInteractive';

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: 'Dashboard do Gerente - MultiTenant CRM',
  description: 'Visão geral completa de desempenho, métricas da equipe, funil de vendas e análises para gerentes de vendas no CRM multi-tenant.',
};

export default function ManagerDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="manager" companyName="Empresa Demo" />
      <Header 
        userRole="manager" 
        companyName="Empresa Demo" 
        userName="Gerente Silva"
      />
      
      <main className="lg:ml-60 pt-20">
        <div className="p-4 lg:p-8">
          <ManagerDashboardInteractive />
        </div>
      </main>
    </div>
  );
}
