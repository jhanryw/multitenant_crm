import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import SettingsInteractive from './components/SettingsInteractive';

export const metadata: Metadata = {
  title: 'Configurações e Integrações - MultiTenant CRM',
  description: 'Gerencie integrações do WhatsApp, Instagram, Facebook Pixel, e-commerce, configurações de SLA, origens de leads e preferências do sistema no CRM multi-tenant.',
};

export default function SettingsAndIntegrationsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="manager" companyName="Empresa Demo" />
      
      <div className="flex-1 lg:ml-60">
        <Header
          userRole="manager"
          companyName="Empresa Demo"
          userName="Carlos Silva"
        />
        
        <main className="pt-20">
          <SettingsInteractive />
        </main>
      </div>
    </div>
  );
}