import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/page-wrapper';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { LoginPage } from '@/pages/login/login';
import { FirstAccessPage } from '@/pages/first-access/first-access';
import { DashboardPage } from '@/pages/dashboard/dashboard';
import { AgendaPage } from '@/pages/agenda/agenda';
import { PendingApprovalPage } from '@/pages/pending-approval/pending-approval';
import { EmpresasPage } from '@/pages/empresas/empresas';
import { EmpresaDetalhePage } from '@/pages/empresas/empresa-detalhe';
import { UsuariosPage } from '@/pages/usuarios/usuarios';
import { PropostasPage } from '@/pages/propostas/propostas';
import { DocumentosPage } from '@/pages/documentos/documentos';
import { RelatoriosPage } from '@/pages/relatorios/relatorios';
import { NotificacoesPage } from '@/pages/notificacoes/notificacoes';
import { ContratosPage } from '@/pages/contratos/contratos';
import { PerfilPage } from '@/pages/perfil/perfil';
import { routes } from '@/config/routes';

// Redirects /reunioes (and any query params) to /agenda, preserving search string.
function ReunioesRedirect() {
  const location = useLocation();
  return <Navigate to={`${routes.agenda}${location.search}`} replace />;
}

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
                path: routes.agenda,
                element: <AgendaPage />,
              },
              {
                path: routes.empresas,
                element: <EmpresasPage />,
              },
              {
                path: `${routes.empresas}/:id`,
                element: <EmpresaDetalhePage />,
              },
              {
                element: <RoleRoute allowedRoles={['ADMIN', 'CPO']} />,
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
                // Legacy /reunioes → unified Agenda & Reuniões (/agenda), query params preserved
                path: routes.reunioes,
                element: <ReunioesRedirect />,
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
              {
                path: routes.perfil,
                element: <PerfilPage />,
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
