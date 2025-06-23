import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthOnly } from '../../contexts/MultiAuthContext';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { adminUser, loading, isAdminAuthenticated, isAuthorizedAdmin } = useAdminAuthOnly();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-amber-600/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-400 text-lg font-medium">Verifying admin access...</p>
        </motion.div>
      </div>
    );
  }

  // If admin user is not logged in, redirect to admin login
  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If admin user is logged in but not a valid/authorized admin, show access denied
  if (adminUser && !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 border border-red-600/30 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-cream/80 mb-6">
            You don't have administrator privileges to access this area.
          </p>
          
          <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Admin access is restricted to authorized personnel only</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-charcoal hover:bg-charcoal/80 text-cream border border-amber-600/30 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If admin user is a valid admin, render the protected content
  return <>{children}</>;
};

export default AdminProtectedRoute;
