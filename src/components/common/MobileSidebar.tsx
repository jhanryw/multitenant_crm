'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface MobileSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: 'manager' | 'seller';
  companyName?: string;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roleAccess: ('manager' | 'seller')[];
  tooltip: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/manager-dashboard',
    icon: 'ChartBarIcon',
    roleAccess: ['manager'],
    tooltip: 'Visão geral de desempenho e métricas',
  },
  {
    label: 'Dashboard',
    path: '/seller-dashboard',
    icon: 'ChartBarIcon',
    roleAccess: ['seller'],
    tooltip: 'Seu desempenho e metas',
  },
  {
    label: 'Leads',
    path: '/lead-management',
    icon: 'UserGroupIcon',
    roleAccess: ['manager', 'seller'],
    tooltip: 'Gerenciamento completo de leads',
  },
  {
    label: 'Inbox',
    path: '/inbox-system',
    icon: 'InboxIcon',
    roleAccess: ['manager', 'seller'],
    tooltip: 'Mensagens do WhatsApp e Instagram',
  },
  {
    label: 'Configurações',
    path: '/settings-and-integrations',
    icon: 'CogIcon',
    roleAccess: ['manager'],
    tooltip: 'Integrações e configurações do sistema',
  },
];

export default function MobileSidebar({
  isOpen = false,
  onClose,
  userRole = 'seller',
  companyName = 'Empresa Demo',
}: MobileSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredNavigation = navigationItems.filter((item) =>
    item.roleAccess.includes(userRole)
  );

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getRoleBadgeColor = () => {
    return userRole === 'manager' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground';
  };

  const getRoleLabel = () => {
    return userRole === 'manager' ? 'Gerente' : 'Vendedor';
  };

  const handleNavClick = () => {
    onClose?.();
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background z-mobile-nav animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-card border-r border-border z-mobile-nav transition-transform duration-smooth ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-border">
            <Link
              href={userRole === 'manager' ? '/manager-dashboard' : '/seller-dashboard'}
              className="flex items-center gap-3"
              onClick={handleNavClick}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
                >
                  <path
                    d="M20 8L8 14V26L20 32L32 26V14L20 8Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M20 8V20M20 20L8 14M20 20L32 14M20 20V32"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-heading font-semibold text-foreground leading-tight">
                  MultiTenant
                </span>
                <span className="text-xs font-caption text-muted-foreground leading-tight">
                  CRM
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
              aria-label="Fechar menu"
            >
              <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
            </button>
          </div>

          {/* Role Context */}
          <div className="px-6 py-4 border-b border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-caption text-muted-foreground">Empresa</span>
                <span className={`text-xs font-caption px-2 py-1 rounded ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground truncate" title={companyName}>
                {companyName}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-custom py-4 px-4">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-smooth ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-warm-sm'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon
                        name={item.icon as any}
                        size={24}
                        className={active ? 'text-primary-foreground' : 'text-muted-foreground'}
                      />
                      <span className="text-base font-medium font-caption">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            <div className="text-xs font-caption text-muted-foreground text-center">
              v1.0.0 • 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}