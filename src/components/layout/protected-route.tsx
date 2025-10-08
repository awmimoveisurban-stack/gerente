import { ReactNode } from 'react';
import { RoleBasedRedirect } from './role-based-redirect';
import { GlobalLoading } from '@/components/global-loading';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('corretor' | 'gerente')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  return (
    <RoleBasedRedirect allowedRoles={allowedRoles}>
      {children}
    </RoleBasedRedirect>
  );
};