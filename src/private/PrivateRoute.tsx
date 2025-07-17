import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth/auth.store';
import type { IAuth } from '../interfaces/auth.interface';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles: IAuth['role'][];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const auth = useAuthStore((state) => state.auth);

  if (!auth) {
    // User not authenticated, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(auth.role)) {
    // User role not authorized, redirect to login page or an unauthorized page
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
