/**
 * 🎴 LoginCard Component
 *
 * Card principal do formulário de login
 * Design glassmorphism moderno
 */

import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Key } from 'lucide-react';

interface LoginCardProps {
  children: ReactNode;
}

export function LoginCard({ children }: LoginCardProps) {
  return (
    <Card className='w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl'>
      <CardHeader className='text-center space-y-4 pb-8'>
        {/* Ícone */}
        <div className='mx-auto w-fit p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-2xl shadow-inner'>
          <Key className='h-10 w-10 text-blue-600 dark:text-blue-400' />
        </div>

        {/* Texto */}
        <div>
          <CardTitle className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Bem-vindo de Volta
          </CardTitle>
          <CardDescription className='text-base text-gray-600 dark:text-gray-400'>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className='pb-8'>{children}</CardContent>
    </Card>
  );
}



