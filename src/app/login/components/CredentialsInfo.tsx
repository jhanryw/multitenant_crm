'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function CredentialsInfo() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const credentials = [
    {
      role: 'Gerente',
      email: 'gerente@empresa.com',
      password: 'Gerente@2026',
      description: 'Acesso completo ao dashboard de gerente com todas as funcionalidades',
    },
    {
      role: 'Vendedor',
      email: 'vendedor@empresa.com',
      password: 'Vendedor@2026',
      description: 'Acesso ao dashboard de vendedor com funcionalidades limitadas',
    },
  ];

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-smooth flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Icon name="InformationCircleIcon" size={20} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            Credenciais de Demonstração
          </span>
        </div>
        <Icon
          name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
          size={20}
          className="text-muted-foreground"
        />
      </button>
      {isExpanded && (
        <div className="mt-2 p-4 bg-card rounded-lg border border-border shadow-warm-md space-y-4 animate-fade-in">
          {credentials?.map((cred, index) => (
            <div
              key={index}
              className="p-4 bg-muted/30 rounded-lg border border-border space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon
                    name={cred?.role === 'Gerente' ? 'UserIcon' : 'UserCircleIcon'}
                    size={18}
                    className="text-primary"
                  />
                </div>
                <h3 className="text-sm font-heading font-semibold text-foreground">
                  {cred?.role}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="EnvelopeIcon" size={16} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-caption text-muted-foreground mb-1">E-mail</p>
                    <p className="text-sm font-caption text-foreground font-medium data-text">
                      {cred?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="LockClosedIcon" size={16} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-caption text-muted-foreground mb-1">Senha</p>
                    <p className="text-sm font-caption text-foreground font-medium data-text">
                      {cred?.password}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs font-caption text-muted-foreground leading-relaxed">
                {cred?.description}
              </p>
            </div>
          ))}

          <div className="pt-3 border-t border-border">
            <div className="flex items-start gap-2">
              <Icon name="ShieldCheckIcon" size={16} className="text-success mt-0.5" />
              <p className="text-xs font-caption text-muted-foreground leading-relaxed">
                Estas são credenciais de demonstração para teste do sistema. Em produção, use suas
                próprias credenciais fornecidas pelo administrador.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}