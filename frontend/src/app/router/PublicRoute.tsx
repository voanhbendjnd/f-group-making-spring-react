import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';

export const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isStudent) {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
