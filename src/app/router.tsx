import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/page-wrapper';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { LoginPage } from '@/pages/login';
import { routes } from '@/config/routes';

// Layout raiz que injeta o AuthProvider dentro do contexto do router
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to={routes.dashboard} replace />,
      },
      {
        path: routes.login,
        element: <LoginPage />,
      },
      // Rotas protegidas — redireciona para /login se não autenticado
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: routes.dashboard,
                element: <div>Dashboard Page (Skeleton)</div>,
              },
              {
                path: routes.empresas,
                element: <div>Empresas Page (Skeleton)</div>,
              },
              {
                path: routes.usuarios,
                element: <div>Usuários Page (Skeleton)</div>,
              },
              {
                path: routes.propostas,
                element: <div>Propostas Page (Skeleton)</div>,
              },
              {
                path: routes.documentos,
                element: <div>Documentos Page (Skeleton)</div>,
              },
              {
                path: routes.reunioes,
                element: <div>Reuniões Page (Skeleton)</div>,
              },
              {
                path: routes.relatorios,
                element: <div>Relatórios Page (Skeleton)</div>,
              },
              {
                path: routes.notificacoes,
                element: <div>Notificações Page (Skeleton)</div>,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
