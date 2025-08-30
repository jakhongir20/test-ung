import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage.tsx';
import TestPage from './pages/TestPage.tsx';
import { I18nProvider } from './i18n.tsx';
import LoginPage from './pages/LoginPage.tsx';
import OtpPage from './pages/OtpPage.tsx';
import AdminEmployeesPage from './pages/AdminEmployeesPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProfilePage /> },
      { path: 'test', element: <TestPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'otp', element: <OtpPage /> },
      { path: 'admin/employees', element: <AdminEmployeesPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  </StrictMode>,
);
