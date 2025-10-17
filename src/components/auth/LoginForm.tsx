/**
 * 🔐 LoginForm Component
 *
 * Formulário de login isolado e reutilizável
 * Separado da página para melhor manutenibilidade
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(email, password);
    },
    [email, password, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Email Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='email'
          className='text-sm font-semibold text-gray-700 dark:text-gray-200'
        >
          Email
        </Label>
        <div className='relative group'>
          <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
          <Input
            id='email'
            type='email'
            placeholder='seu@email.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all'
            required
            disabled={isLoading}
            autoComplete='email'
            autoFocus
          />
        </div>
      </div>

      {/* Password Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='password'
          className='text-sm font-semibold text-gray-700 dark:text-gray-200'
        >
          Senha
        </Label>
        <div className='relative group'>
          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='••••••••'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='pl-10 pr-12 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all'
            required
            disabled={isLoading}
            autoComplete='current-password'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute right-1 top-1/2 -translate-y-1/2 h-10 hover:bg-gray-100 dark:hover:bg-gray-700'
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className='h-4 w-4 text-gray-500' />
            ) : (
              <Eye className='h-4 w-4 text-gray-500' />
            )}
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type='submit'
        className='w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
        disabled={isLoading}
        size='lg'
      >
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span>Entrando...</span>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <span>Entrar no Sistema</span>
            <ArrowRight className='h-5 w-5' />
          </div>
        )}
      </Button>
    </form>
  );
}



