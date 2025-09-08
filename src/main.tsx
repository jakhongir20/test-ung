import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './pages/ProfilePage.tsx';
import TestPage from './pages/TestPage.tsx';
import SessionDetailsPage from './pages/SessionDetailsPage.tsx';
import { I18nProvider } from './i18n.tsx';
import LoginPage from './pages/LoginPage.tsx';
import OtpPage from './pages/OtpPage.tsx';
import AdminEmployeesPage from './pages/AdminEmployeesPage.tsx';
import PageRules from './pages/PageRules.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AuthLayout from './layouts/AuthLayout.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true, element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'test', element: (
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/employees', element: (
          <ProtectedRoute>
            <AdminEmployeesPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'rules', element: (
          <ProtectedRoute>
            <PageRules />
          </ProtectedRoute>
        )
      },
      {
        path: 'myprofile', element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'session/:id', element: (
          <ProtectedRoute>
            <SessionDetailsPage />
          </ProtectedRoute>
        )
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'otp', element: <OtpPage /> },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
);
