import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../api/auth';

const ProtectedRoute: FC<{ children: ReactNode; }> = ({ children }) => {
  const location = useLocation();
  const isAuthed = !!tokenStorage.access;
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default ProtectedRoute


