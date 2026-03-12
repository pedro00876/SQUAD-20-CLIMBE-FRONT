import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/page-wrapper';
import { LoginPage } from '@/pages/login';
import { routes } from '@/config/routes';

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={routes.dashboard} replace />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
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
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
