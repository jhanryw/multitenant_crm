import type { Metadata } from 'next';
import ManagerDashboardClient from './ManagerDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Dashboard do Gerente - MultiTenant CRM',
  description:
    'Visão geral completa de desempenho, métricas da equipe, funil de vendas e análises para gerentes de vendas no CRM multi-tenant.',
};

export default function ManagerDashboardPage() {
  return <ManagerDashboardClient />;
}
