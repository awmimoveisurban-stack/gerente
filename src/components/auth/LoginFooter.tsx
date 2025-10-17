/**
 * 📄 LoginFooter Component
 *
 * Rodapé informativo da página de login
 */

import { Shield, UserCheck, Users, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LoginFooter() {
  const navigate = useNavigate();

  return (
    <div className='space-y-6 mt-8'>
      {/* Cards informativos */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Acesso Controlado */}
        <Card className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardContent className='p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl'>
                <Shield className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h3 className='font-bold text-gray-900 dark:text-white text-sm mb-1'>
                  Acesso Controlado
                </h3>
                <p className='text-xs text-gray-600 dark:text-gray-400 leading-relaxed'>
                  Apenas usuários autorizados com credenciais válidas podem
                  acessar o sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Convites */}
        <Card className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardContent className='p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl'>
                <UserCheck className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <h3 className='font-bold text-gray-900 dark:text-white text-sm mb-1'>
                  Convite Necessário
                </h3>
                <p className='text-xs text-gray-600 dark:text-gray-400 leading-relaxed'>
                  Novos usuários são convidados pelo gerente do sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links para funcionalidades */}
      <div className='text-center space-y-3'>
        <Button
          variant="outline"
          onClick={() => navigate('/corretor-login')}
          className='bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800'
        >
          <Users className='mr-2 h-4 w-4' />
          Sou Corretor - Acesso Simplificado
        </Button>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Corretores usam nome de usuário, email e senha fornecidos pelo gerente
        </p>
        
        <Button
          variant="outline"
          onClick={() => navigate('/admin-test-data')}
          className='bg-white/80 dark:bg-gray-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/20 border-purple-200 dark:border-purple-800'
        >
          <Database className='mr-2 h-4 w-4' />
          Criar Dados de Teste
        </Button>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Gerencie corretores e dados fictícios para teste
        </p>
      </div>

      {/* Copyright */}
      <div className='text-center'>
        <p className='text-xs text-gray-500 dark:text-gray-500'>
          © 2024 URBAN CRM. Todos os direitos reservados.
        </p>
        <p className='text-xs text-gray-400 dark:text-gray-600 mt-1'>
          Sistema Profissional de Gestão Imobiliária
        </p>
      </div>
    </div>
  );
}

