import { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/auth-context';
import { useNavigate } from 'react-router-dom';

interface UserAvatarDropdownProps {
  userEmail?: string;
  userType?: 'corretor' | 'gerente';
}

export function UserAvatarDropdown({
  userEmail = '',
  userType = 'corretor',
}: UserAvatarDropdownProps) {
  const { logout: signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Get initials from email
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    return (
      parts
        .map(part => part[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || 'U'
    );
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-9 w-9 rounded-full p-0 hover:bg-gray-100'
        >
          <Avatar className='h-9 w-9'>
            <AvatarFallback className='bg-blue-600 text-white text-sm font-semibold'>
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            <p className='font-medium text-sm'>{userEmail}</p>
            <p className='w-[200px] truncate text-xs text-muted-foreground capitalize'>
              {userType}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className='cursor-pointer'>
          <User className='mr-2 h-4 w-4' />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className='cursor-pointer'>
          <Settings className='mr-2 h-4 w-4' />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className='cursor-pointer text-red-600'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

