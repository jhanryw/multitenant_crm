'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface LoginFormProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const MOCK_CREDENTIALS = {
  manager: {
    email: 'gerente@empresa.com',
    password: 'Gerente@2026',
    role: 'manager',
    name: 'Carlos Silva',
  },
  seller: {
    email: 'vendedor@empresa.com',
    password: 'Vendedor@2026',
    role: 'seller',
    name: 'Ana Santos',
  },
};

export default function LoginForm({ onThemeToggle, isDarkMode }: LoginFormProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, insira um e-mail válido';
    }

    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check credentials
    const isManager =
      formData.email === MOCK_CREDENTIALS.manager.email &&
      formData.password === MOCK_CREDENTIALS.manager.password;

    const isSeller =
      formData.email === MOCK_CREDENTIALS.seller.email &&
      formData.password === MOCK_CREDENTIALS.seller.password;

    if (isManager) {
      if (formData.rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'manager');
        localStorage.setItem('userName', MOCK_CREDENTIALS.manager.name);
      }
      router.push('/manager-dashboard');
    } else if (isSeller) {
      if (formData.rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'seller');
        localStorage.setItem('userName', MOCK_CREDENTIALS.seller.name);
      }
      router.push('/seller-dashboard');
    } else {
      setErrors({
        general: 'E-mail ou senha incorretos. Use as credenciais fornecidas na documentação.',
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg border border-border shadow-warm-lg">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-primary rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg border border-border shadow-warm-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
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
        <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-sm font-caption text-muted-foreground">
          Entre com suas credenciais para acessar o CRM
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
            <Icon name="ExclamationCircleIcon" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{errors.general}</p>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            E-mail
          </label>
          <div className="relative">
            <Icon
              name="EnvelopeIcon"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full h-12 pl-12 pr-4 bg-background border rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth ${
                errors.email ? 'border-error' : 'border-input'
              }`}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={14} />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Senha
          </label>
          <div className="relative">
            <Icon
              name="LockClosedIcon"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full h-12 pl-12 pr-12 bg-background border rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth ${
                errors.password ? 'border-error' : 'border-input'
              }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={14} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
              disabled={isLoading}
            />
            <span className="text-sm font-caption text-foreground">Lembrar-me</span>
          </label>
import { useRouter } from 'next/navigation'

// dentro do componente:
const router = useRouter()

<button
  type="button"
  className="text-sm font-caption text-primary hover:text-primary/80 transition-smooth"
  disabled={isLoading}
  onClick={() => router.push('/auth/forgot-password')}
>
  Esqueci minha senha
</button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium text-sm font-caption hover:opacity-90 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <Icon name="ArrowRightIcon" size={18} />
            </>
          )}
        </button>
      </form>

      {/* Theme Toggle */}
      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-smooth"
          aria-label="Alternar tema"
        >
          <span className="text-sm font-caption text-foreground">Tema</span>
          <div className="flex items-center gap-2">
            <Icon
              name={isDarkMode ? 'MoonIcon' : 'SunIcon'}
              size={20}
              className="text-muted-foreground"
            />
            <div
              className={`w-12 h-6 rounded-full transition-smooth relative ${
                isDarkMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  isDarkMode ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
