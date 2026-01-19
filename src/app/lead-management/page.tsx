import type { Metadata } from 'next';
import LeadManagementInteractive from './components/LeadManagementInteractive';

export const metadata: Metadata = {
  title: 'Gerenciamento de Leads - MultiTenant CRM',
  description: 'Gerencie seus leads através de um funil de vendas Kanban com distribuição automática, tags personalizadas e automações via WhatsApp.',
};

export default function LeadManagementPage() {
  return <LeadManagementInteractive />;
}