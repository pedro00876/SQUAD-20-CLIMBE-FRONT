import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/page-wrapper';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { EmpresasPage } from '@/pages/empresas';
import { UsuariosPage } from '@/pages/usuarios';
import { PropostasPage } from '@/pages/propostas';
import { DocumentosPage } from '@/pages/documentos';
import { ReunioesPage } from '@/pages/reunioes';
import { RelatoriosPage } from '@/pages/relatorios';
import { NotificacoesPage } from '@/pages/notificacoes';
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
      {
        path: routes.register,
        element: <RegisterPage />,
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
                element: <DashboardPage />,
              },
              {
                path: routes.empresas,
                element: <EmpresasPage />,
              },
              {
                path: routes.usuarios,
                element: <UsuariosPage />,
              },
              {
                path: routes.propostas,
                element: <PropostasPage />,
              },
              {
                path: routes.documentos,
                element: <DocumentosPage />,
              },
              {
                path: routes.reunioes,
                element: <ReunioesPage />,
              },
              {
                path: routes.relatorios,
                element: <RelatoriosPage />,
              },
              {
                path: routes.notificacoes,
                element: <NotificacoesPage />,
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
