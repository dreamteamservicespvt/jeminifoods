import { useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

/**
 * A reusable hook for protecting actions that require authentication.
 * Shows a custom alert dialog when unauthenticated users try to access protected features.
 * 
 * Usage:
 * ```typescript
 * const {
 *   user,
 *   loading,
 *   isAuthenticated,
 *   requireAuth,
 *   showAuthDialog,
 *   handleLoginRedirect,
 *   handleSignupRedirect,
 *   closeAuthDialog
 * } = useAuthGuard();
 * 
 * // Protect an action
 * const handleReservation = () => {
 *   if (!requireAuth()) return; // Shows dialog if not authenticated
 *   // Proceed with reservation logic
 * };
 * ```
 */
export const useAuthGuard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  /**
   * Check if user is authenticated. If not, show auth dialog.
   * @returns true if authenticated, false if not
   */
  const requireAuth = useCallback((): boolean => {
    if (!user && !loading) {
      setShowAuthDialog(true);
      return false;
    }
    return !!user;
  }, [user, loading]);

  /**
   * Handle login redirect from auth dialog
   */
  const handleLoginRedirect = useCallback(() => {
    setShowAuthDialog(false);
    navigate('/login');
  }, [navigate]);

  /**
   * Handle signup redirect from auth dialog
   */
  const handleSignupRedirect = useCallback(() => {
    setShowAuthDialog(false);
    navigate('/signup');
  }, [navigate]);

  /**
   * Close auth dialog without action
   */
  const closeAuthDialog = useCallback(() => {
    setShowAuthDialog(false);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    requireAuth,
    showAuthDialog,
    handleLoginRedirect,
    handleSignupRedirect,
    closeAuthDialog,
  };
};

export default useAuthGuard;
