import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogicalRole, hasAnyLogicalRole } from '@/config/roles';

interface RoleRouteProps {
  allowedRoles: LogicalRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuthContext();
  const role = user?.role;

  // Verifica se o cargo que veio do backend possui ao menos um dos perfis lógicos permitidos
  if (!role || !hasAnyLogicalRole(role, allowedRoles)) {
    // Redireciona para o dashboard ou uma página de acesso negado
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
