'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface SidebarProps {
  isCollapsed?: boolean;
  userRole?: 'manager' | 'seller';
  companyName?: string;
  onCollapse?: (collapsed: boolean) => void;
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

export default function Sidebar({
  isCollapsed = false,
  userRole = 'seller',
  companyName = 'Empresa Demo',
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

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

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-smooth z-sidebar ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-border">
          {!collapsed && (
            <Link href={userRole === 'manager' ? '/manager-dashboard' : '/seller-dashboard'} className="flex items-center gap-3">
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
          )}
          <button
            onClick={handleCollapse}
            className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <Icon
              name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
              size={20}
              className="text-muted-foreground"
            />
          </button>
        </div>

        {/* Role Context Indicator */}
        <div className="px-4 py-4 border-b border-border">
          {!collapsed ? (
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
          ) : (
            <div className="flex justify-center">
              <div className={`w-8 h-8 rounded-lg ${getRoleBadgeColor()} flex items-center justify-center`}>
                <Icon
                  name={userRole === 'manager' ? 'UserIcon' : 'UserCircleIcon'}
                  size={18}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto scrollbar-custom py-4 px-2">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-smooth group relative ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-warm-sm'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={collapsed ? item.tooltip : ''}
                  >
                    <Icon
                      name={item.icon as any}
                      size={20}
                      className={active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium font-caption">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle - Placeholder for future implementation */}
        <div className="px-4 py-4 border-t border-border">
          {!collapsed ? (
            <div className="text-xs font-caption text-muted-foreground text-center">
              v1.0.0 • 2026
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-success" title="Sistema online" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}