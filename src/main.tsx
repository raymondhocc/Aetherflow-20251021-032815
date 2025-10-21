import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DataSourcesPage } from '@/pages/DataSourcesPage';
import { DataDestinationsPage } from '@/pages/DataDestinationsPage';
import { PipelinesPage } from '@/pages/PipelinesPage';
import { MonitoringPage } from '@/pages/MonitoringPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { DocsPage } from '@/pages/DocsPage'; // Import the new DocsPage
import { AuthLayout } from '@/components/auth/AuthLayout';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/data-sources",
        element: <DataSourcesPage />,
      },
      {
        path: "/data-destinations",
        element: <DataDestinationsPage />,
      },
      {
        path: "/pipelines",
        element: <PipelinesPage />,
      },
      {
        path: "/monitoring",
        element: <MonitoringPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/docs", // Add the new route for documentation
        element: <DocsPage />,
      },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)