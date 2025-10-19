import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { UserAvatarDropdown } from './user-avatar-dropdown';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/auth-context';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout: signOut, isManager } = useAuth();
  
  // ✅ Estado local para busca
  const [searchTerm, setSearchTerm] = useState('');

  const handleSignOut = async () => {
    console.log('🔘 Botão SAIR clicado (header)');
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Erro no handleSignOut (header):', error);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('🔍 Busca realizada:', searchTerm);
    }
  };

  // ✅ FIX: Debug da detecção de roles
  console.log('🔍 [APP-LAYOUT] Verificando roles:', {
    isManager,
    userEmail: user?.email,
    userRole: user?.role,
  });

  // ✅ FIX: Verificação mais robusta para evitar gerentes sendo detectados como corretores
  const determineUserType = () => {
    if (isManager) {
      console.log('✅ [APP-LAYOUT] Usuário confirmado como GERENTE');
      return 'gerente';
    }

    // ✅ FIX: Fallback por email para evitar falsos negativos
    const emailLower = user?.email?.toLowerCase() || '';
    if (
      emailLower === 'gerente@imobiliaria.com' ||
      emailLower.includes('gerente@') ||
      emailLower === 'admin@imobiliaria.com' ||
      emailLower === 'administrador@imobiliaria.com'
    ) {
      console.log('🔧 [APP-LAYOUT] Fallback: Email indica GERENTE');
      return 'gerente';
    }

    console.log('👤 [APP-LAYOUT] Usuário detectado como CORRETOR');
    return 'corretor';
  };

  const userType = determineUserType();

  console.log('🎯 [APP-LAYOUT] UserType final determinado:', userType);

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-background'>
        <AppSidebar userType={userType} userEmail={user?.email || ''} />

        <div className='flex-1 flex flex-col'>
          {/* Header */}
          <header className='h-14 sm:h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 crm-gradient-card'>
            <div className='flex items-center gap-2 sm:gap-4 flex-1'>
              <SidebarTrigger className='lg:hidden' />
              <div className='relative flex-1 max-w-sm sm:max-w-md'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar leads, clientes...'
                  className='pl-10 bg-background/50 border-border/50 text-sm'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
            </div>

            <div className='flex items-center gap-3'>
              {/* ✅ OTIMIZAÇÃO: Notificações fixas no header */}
              <NotificationsFixed />

              {/* 🧹 DEBUG: Botão de limpeza de cache */}
              <CacheClearButton
                variant='ghost'
                size='sm'
                showLabel={false}
                showOptions={false}
              />

              {/* ✅ OTIMIZAÇÃO: Avatar dropdown para perfil */}
              <UserAvatarDropdown
                userEmail={user?.email || ''}
                userType={userType}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className='flex-1 overflow-auto'>
            <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4'>
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* ✅ COMPONENTE DE NOTIFICAÇÕES (SEGURO) */}
      <SafeNotificationIntegration position="top-right" />
    </SidebarProvider>
  );
}
