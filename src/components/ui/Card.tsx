import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={cn('card', className)}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-accent-blue">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};