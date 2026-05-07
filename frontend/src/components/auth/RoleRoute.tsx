import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { routes } from '@/config/routes';

interface RoleRouteProps {
  allowedRoles: string[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuthContext();
  const role = user?.role?.toUpperCase();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={routes.dashboard} replace />;
  }
  return <Outlet />;
}
