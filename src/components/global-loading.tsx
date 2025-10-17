import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GlobalLoadingProps {
  message?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  message = 'Carregando...',
}) => {
  const [dots, setDots] = useState('');
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // ✅ Animação de dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(dotsInterval);
  }, []);

  // ✅ Mostrar aviso se demorar mais de 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowWarning(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardContent className='flex flex-col items-center justify-center p-12 space-y-6'>
          <div className='relative'>
            <Loader2 className='h-16 w-16 animate-spin text-primary' />
            <div className='absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary/20' />
          </div>

          <div className='space-y-2 text-center'>
            <p className='text-lg font-semibold text-gray-900 dark:text-white'>
              {message}
              {dots}
            </p>

            {showSlowWarning && (
              <p className='text-sm text-gray-500 dark:text-gray-400 animate-pulse'>
                Verificando conexão{dots}
              </p>
            )}
          </div>

          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[shimmer_1.5s_infinite]'
              style={{ width: '100%' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
