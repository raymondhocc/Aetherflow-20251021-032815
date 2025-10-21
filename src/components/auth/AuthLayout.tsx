import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
export function AuthLayout() {
  const isAuthenticated = useAuth(state => state.isAuthenticated);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  if (!isAuthenticated) {
    // You can return a loader here while redirecting
    return null;
  }
  return <Outlet />;
}