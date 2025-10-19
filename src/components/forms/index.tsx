import React from 'react';
import { cn } from '@/lib/utils';
import { DESIGN_SYSTEM } from '@/design-system';

// 🎨 COMPONENTE DE INPUT PADRONIZADO
interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
}

export const StandardInput: React.FC<StandardInputProps> = ({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  className,
  ...props
}) => {
  const inputClass = cn(
    DESIGN_SYSTEM.DESIGN_UTILS.createButton('base', 'outline'),
    'w-full px-3 py-2',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    icon && 'pl-10',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.small,
          'font-medium text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={inputClass}
          {...props}
        />
      </div>
      
      {error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-red-500'
        )}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// 🎨 COMPONENTE DE SELECT PADRONIZADO
interface StandardSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const StandardSelect: React.FC<StandardSelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  ...props
}) => {
  const selectClass = cn(
    DESIGN_SYSTEM.DESIGN_UTILS.createButton('base', 'outline'),
    'w-full px-3 py-2',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.small,
          'font-medium text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}
      
      <select className={selectClass} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-red-500'
        )}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// 🎨 COMPONENTE DE TEXTAREA PADRONIZADO
interface StandardTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const StandardTextarea: React.FC<StandardTextareaProps> = ({
  label,
  error,
  helperText,
  resize = 'vertical',
  className,
  ...props
}) => {
  const textareaClass = cn(
    DESIGN_SYSTEM.DESIGN_UTILS.createButton('base', 'outline'),
    'w-full px-3 py-2 min-h-[100px]',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    `resize-${resize}`,
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.small,
          'font-medium text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}
      
      <textarea className={textareaClass} {...props} />
      
      {error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-red-500'
        )}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={cn(
          DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
          'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// 🎨 COMPONENTE DE FORM PADRONIZADO
interface StandardFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  loading?: boolean;
}

export const StandardForm: React.FC<StandardFormProps> = ({
  children,
  onSubmit,
  className,
  loading = false
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-6',
        loading && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {children}
    </form>
  );
};

// 🎨 COMPONENTE DE FIELD GROUP
interface FieldGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  children,
  title,
  description,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              DESIGN_SYSTEM.TYPOGRAPHY.heading.h6,
              'text-gray-900 dark:text-white'
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              DESIGN_SYSTEM.TYPOGRAPHY.body.small,
              'text-gray-600 dark:text-gray-400'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export {
  StandardInput,
  StandardSelect,
  StandardTextarea,
  StandardForm,
  FieldGroup
};

