import React from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options, className, ...props }) => {
  return (
    <select
      className={cn(
        'bg-dark-700 border border-white/10 rounded-lg px-4 py-2',
        'focus:outline-none focus:border-accent-blue/50 transition-colors',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value} className='bg-gray-950 text-gray-500'>
          {option.label}
        </option>
      ))}
    </select>
  );
};