import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/page-wrapper';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { LoginPage } from '@/pages/login/login';
import { FirstAccessPage } from '@/pages/first-access/first-access';
import { DashboardPage } from '@/pages/dashboard/dashboard';
import { PendingApprovalPage } from '@/pages/pending-approval/pending-approval';
import { EmpresasPage } from '@/pages/empresas/empresas';
import { UsuariosPage } from '@/pages/usuarios/usuarios';
import { PropostasPage } from '@/pages/propostas/propostas';
import { DocumentosPage } from '@/pages/documentos/documentos';
import { ReunioesPage } from '@/pages/reunioes/reunioes';
import { RelatoriosPage } from '@/pages/relatorios/relatorios';
import { NotificacoesPage } from '@/pages/notificacoes/notificacoes';
import { ContratosPage } from '@/pages/contratos/contratos';
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
        element: <Navigate to={routes.login} replace />,
      },
      {
        path: routes.login,
        element: <LoginPage />,
      },
      {
        path: '/primeiro-acesso',
        element: <FirstAccessPage />,
      },
      // Rotas protegidas — redireciona para /login se não autenticado
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/pending-approval',
            element: <PendingApprovalPage />,
          },
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
                element: <RoleRoute allowedRoles={['CEO']} />,
                children: [
                  {
                    path: routes.usuarios,
                    element: <UsuariosPage />,
                  },
                ],
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
              {
                path: routes.contratos,
                element: <ContratosPage />,
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
