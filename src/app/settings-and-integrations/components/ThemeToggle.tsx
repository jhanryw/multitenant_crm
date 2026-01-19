'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ThemeToggleProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export default function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const handleThemeToggle = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    onThemeChange(theme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          Tema da Interface
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha entre modo claro ou escuro para melhor conforto visual
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleThemeToggle('light')}
          className={`relative p-6 rounded-lg border-2 transition-smooth focus-ring ${
            currentTheme === 'light' ?'border-primary bg-primary/5' :'border-border bg-muted/50 hover:border-muted-foreground'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg shadow-warm-md flex items-center justify-center">
              <Icon name="SunIcon" size={32} className="text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">Modo Claro</p>
              <p className="text-xs text-muted-foreground">
                Interface clara e brilhante
              </p>
            </div>
          </div>
          {currentTheme === 'light' && (
            <div className="absolute top-3 right-3">
              <Icon name="CheckCircleIcon" size={24} className="text-primary" />
            </div>
          )}
        </button>

        <button
          onClick={() => handleThemeToggle('dark')}
          className={`relative p-6 rounded-lg border-2 transition-smooth focus-ring ${
            currentTheme === 'dark' ?'border-primary bg-primary/5' :'border-border bg-muted/50 hover:border-muted-foreground'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-900 rounded-lg shadow-warm-md flex items-center justify-center">
              <Icon name="MoonIcon" size={32} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">Modo Escuro</p>
              <p className="text-xs text-muted-foreground">
                Interface escura e confortável
              </p>
            </div>
          </div>
          {currentTheme === 'dark' && (
            <div className="absolute top-3 right-3">
              <Icon name="CheckCircleIcon" size={24} className="text-primary" />
            </div>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={20}
            className="text-primary flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              O tema selecionado será aplicado em todas as páginas do sistema e
              salvo automaticamente.
            </p>
            <p>
              Você pode alternar entre os temas a qualquer momento através desta
              configuração.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}