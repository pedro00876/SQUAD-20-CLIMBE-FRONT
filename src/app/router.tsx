import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/page-wrapper';
import { routes } from '@/config/routes';

export const router = createBrowserRouter([
  {
    path: routes.login,
    element: <div>Login Page (Skeleton)</div>,
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
  return <RouterProvider router={router} />;
}
