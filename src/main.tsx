import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './pages/ProfilePage.tsx';
import TestPage from './pages/TestPage.tsx';
import SessionDetailsPage from './pages/SessionDetailsPage.tsx';
import CertificatePage from './pages/CertificatePage.tsx';
import { I18nProvider } from './i18n.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import OtpPage from './pages/OtpPage.tsx';
import AdminEmployeesPage from './pages/AdminEmployeesPage.tsx';
import PageRules from './pages/PageRules.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AuthLayout from './layouts/AuthLayout.tsx';
import CertificateLayout from './layouts/CertificateLayout.tsx';
import ProfileCompletionPage from "./pages/ProfileCompletionPage.tsx";

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
      }
    ],
  },
  {
    path: '/certificate',
    element: <CertificateLayout />,
    children: [
      {
        path: ':id',
        element: <CertificatePage />
      }
    ]
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'otp', element: <OtpPage /> },
      { path: 'profile-completion', element: <ProfileCompletionPage /> },
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
