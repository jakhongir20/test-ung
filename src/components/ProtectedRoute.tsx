import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute: FC<{ children: ReactNode; }> = ({ children }) => {
  const location = useLocation();
  const isAuthed = !!tokenStorage.access && tokenStorage.isAccessValid();

  if (!isAuthed) {
    useAuthStore.getState().setUser(null);
    tokenStorage.clear();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default ProtectedRoute


