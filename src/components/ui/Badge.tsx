import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'blue', className }) => {
  const variants = {
    blue: 'bg-accent-blue/20 text-accent-blue border-accent-blue/50',
    green: 'bg-accent-green/20 text-accent-green border-accent-green/50',
    red: 'bg-accent-red/20 text-accent-red border-accent-red/50',
    yellow: 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/50',
    purple: 'bg-accent-purple/20 text-accent-purple border-accent-purple/50'
  };

  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-sm font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};