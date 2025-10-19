/**
 * 🎨 LoginHeader Component
 *
 * Cabeçalho visual da página de login
 * Design moderno e impactante
 */

import { Building2, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LoginHeader() {
  return (
    <div className='text-center space-y-6 mb-8'>
      {/* Logo animado */}
      <div className='flex justify-center'>
        <div className='relative'>
          {/* Glow effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse'></div>

          {/* Logo */}
          <div className='relative p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300'>
            <Building2 className='h-16 w-16 text-white drop-shadow-lg' />
          </div>
        </div>
      </div>

      {/* Título */}
      <div className='space-y-2'>
        <h1 className='text-5xl font-black tracking-tight'>
          <span className='bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent drop-shadow-sm'>
            URBAN CRM
          </span>
        </h1>
        <p className='text-lg text-gray-600 dark:text-gray-300 font-medium'>
          Sistema de Gestão Imobiliária
        </p>
      </div>

      {/* Badges */}
      <div className='flex items-center justify-center gap-2 flex-wrap'>
        <Badge
          variant='outline'
          className='px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium'
        >
          <Shield className='h-3.5 w-3.5 mr-1.5' />
          100% Seguro
        </Badge>
        <Badge
          variant='outline'
          className='px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium'
        >
          <Sparkles className='h-3.5 w-3.5 mr-1.5' />
          Profissional
        </Badge>
      </div>
    </div>
  );
}




