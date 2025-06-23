import { useUserAuth } from '../contexts/UserAuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardOptions {
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const { user, loading } = useUserAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  
  const { redirectTo = '/login', onUnauthorized } = options;

  // Check if user is authenticated and show dialog if not
  const requireAuth = (actionName?: string) => {
    if (loading) {
      return false; // Still loading, don't proceed
    }
    
    if (!user) {
      setShowAuthDialog(true);
      if (onUnauthorized) {
        onUnauthorized();
      }
      return false;
    }
    
    return true; // User is authenticated
  };

  // Handle redirect to login
  const handleLoginRedirect = () => {
    setShowAuthDialog(false);
    navigate(redirectTo);
  };

  // Handle redirect to signup
  const handleSignupRedirect = () => {
    setShowAuthDialog(false);
    navigate('/signup');
  };

  // Close the dialog
  const closeAuthDialog = () => {
    setShowAuthDialog(false);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
    requireAuth,
    showAuthDialog,
    handleLoginRedirect,
    handleSignupRedirect,
    closeAuthDialog
  };
};
