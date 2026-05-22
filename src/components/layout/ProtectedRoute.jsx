import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Define complex map-based RBAC middleware
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['/app/blacklists', '/app/archives', '/app/distribution', '/app/logs', '/app/users', '/app/settings'],
  ADMIN: ['/app/blacklists', '/app/archives', '/app/distribution', '/app/logs', '/app/users', '/app/settings'],
  VERIFICATION: ['/app/blacklists', '/app/settings'],
  DATA_ENTRY: ['/app/blacklists', '/app/settings'],
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011530]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Route guard middleware based on user role
  const role = user?.role?.toUpperCase();
  const path = location.pathname.toLowerCase();

  // Root paths redirect logic is handled outside this component mostly, 
  // but if accessing /app directly, it allows it through to render children which has index redirect
  if (path === '/app' || path === '/app/') {
    return children;
  }

  const allowedRoutes = ROLE_PERMISSIONS[role] || [];
  
  // Check if current path starts with any of the allowed base routes
  const isAllowed = allowedRoutes.some(allowedRoute => path.startsWith(allowedRoute));

  if (!isAllowed) {
    // If not allowed and role is recognized, fall back to their first allowed route
    const fallback = allowedRoutes[0] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
