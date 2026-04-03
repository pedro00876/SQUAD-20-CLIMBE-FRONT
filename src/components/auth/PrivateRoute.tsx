import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { routes } from '@/config/routes';

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1E1F1C]">
        <div className="w-8 h-8 rounded-full border-2 border-[#79C6C0] border-t-transparent animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={routes.login} replace />;
}
