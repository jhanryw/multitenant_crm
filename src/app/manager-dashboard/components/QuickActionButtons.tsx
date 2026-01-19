'use client';

import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface QuickAction {
  label: string;
  icon: string;
  href: string;
  color: 'primary' | 'secondary' | 'accent';
}

interface QuickActionButtonsProps {
  actions: QuickAction[];
}

export default function QuickActionButtons({ actions }: QuickActionButtonsProps) {
  const getColorClasses = (color: QuickAction['color']) => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:opacity-90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:opacity-90';
      case 'accent':
        return 'bg-accent text-accent-foreground hover:opacity-90';
      default:
        return 'bg-primary text-primary-foreground hover:opacity-90';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className={`flex items-center gap-3 p-4 rounded-lg transition-smooth focus-ring ${getColorClasses(action.color)}`}
        >
          <Icon name={action.icon as any} size={24} />
          <span className="text-sm font-caption font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}