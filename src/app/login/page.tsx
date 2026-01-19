'use client';

import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import CredentialsInfo from './components/CredentialsInfo';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement?.classList?.add('dark');
      }
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (typeof window !== 'undefined') {
      if (newTheme) {
        document.documentElement?.classList?.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement?.classList?.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg border border-border shadow-warm-lg">
          <div className="animate-pulse space-y-6">
            <div className="h-16 w-16 bg-muted rounded-lg mx-auto" />
            <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-primary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
        <CredentialsInfo />
      </div>
    </div>
  );
}