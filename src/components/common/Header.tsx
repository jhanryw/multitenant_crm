'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import MobileSidebar from './MobileSidebar';

interface HeaderProps {
  userRole?: 'manager' | 'seller';
  companyName?: string;
  userName?: string;
  userAvatar?: string;
}

export default function Header({
  userRole = 'seller',
  companyName = 'Empresa Demo',
  userName = 'Usuário',
  userAvatar,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Novo lead atribuído',
      message: 'João Silva foi atribuído a você',
      time: '5 min atrás',
      unread: true,
    },
    {
      id: 2,
      title: 'Meta atingida',
      message: 'Você atingiu 80% da meta mensal',
      time: '1 hora atrás',
      unread: true,
    },
    {
      id: 3,
      title: 'Mensagem recebida',
      message: 'Nova mensagem no WhatsApp',
      time: '2 horas atrás',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-border z-sidebar lg:left-60">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
            aria-label="Abrir menu"
          >
            <Icon name="Bars3Icon" size={24} className="text-foreground" />
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Icon
                name="MagnifyingGlassIcon"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar leads, conversas..."
                className="w-full h-12 pl-12 pr-4 bg-muted border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Search Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
              aria-label="Buscar"
            >
              <Icon name="MagnifyingGlassIcon" size={24} className="text-foreground" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
                aria-label="Notificações"
              >
                <Icon name="BellIcon" size={24} className="text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-error text-error-foreground text-xs font-caption font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-dropdown"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-warm-lg z-dropdown animate-fade-in">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-sm font-heading font-semibold text-foreground">
                        Notificações
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto scrollbar-custom">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          className="w-full p-4 text-left hover:bg-muted transition-smooth border-b border-border last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.unread ? 'bg-primary' : 'bg-muted-foreground'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-border">
                      <button className="w-full text-sm font-caption font-medium text-primary hover:text-primary/80 transition-smooth">
                        Ver todas as notificações
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-border">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {userRole === 'manager' ? 'Gerente' : 'Vendedor'}
                </p>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-semibold text-sm hover:opacity-90 transition-smooth focus-ring">
                {userName.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={userRole}
        companyName={companyName}
      />
    </>
  );
}