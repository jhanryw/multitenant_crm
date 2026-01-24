'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import ManagerDashboardInteractive from './components/ManagerDashboardInteractive';

import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ManagerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (error || !profile || profile.role !== 'manager') {
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="manager" companyName="Empresa Demo" />
      <Header userRole="manager" companyName="Empresa Demo" userName="Gerente Silva" />

      <main className="lg:ml-60 pt-20">
        <div className="p-4 lg:p-8">
          <ManagerDashboardInteractive />
        </div>
      </main>
    </div>
  );
}
