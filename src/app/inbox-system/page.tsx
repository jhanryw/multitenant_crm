import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import InboxInteractive from './components/InboxInteractive';

export const metadata: Metadata = {
  title: 'Sistema de Inbox - MultiTenant CRM',
  description: 'Centralize e gerencie todas as conversas do WhatsApp e Instagram em um único lugar com sistema de três níveis (Geral/Setor/Individual) e monitoramento de SLA.',
};

export default function InboxSystemPage() {
  const userRole: 'manager' | 'seller' = 'seller';
  const companyName = 'Empresa Demo';
  const userName = 'Carlos Vendedor';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar userRole={userRole} companyName={companyName} />
      </div>

      {/* Header */}
      <Header
        userRole={userRole}
        companyName={companyName}
        userName={userName}
      />

      {/* Main Content */}
      <main className="lg:ml-60 pt-20">
        <InboxInteractive userRole={userRole} />
      </main>
    </div>
  );
}