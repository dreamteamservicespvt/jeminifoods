import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface AdminAuthState {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  isValidAdmin: boolean;
  adminLoading: boolean;
}

/**
 * @deprecated This hook is deprecated. Use AdminAuthContext instead for proper admin authentication.
 * Legacy hook to check if the current user is an admin
 * Only admin@jeminifoods.com should have admin access
 */
export const useAdminAuthLegacy = (): AdminAuthState => {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Define the authorized admin email
  const AUTHORIZED_ADMIN_EMAIL = 'admin@jeminifoods.com';

  useEffect(() => {
    const checkAdminStatus = async () => {
      setAdminLoading(true);
      
      if (!user || loading) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        // First check: Email must be the authorized admin email
        if (user.email !== AUTHORIZED_ADMIN_EMAIL) {
          setIsAdmin(false);
          setAdminLoading(false);
          return;
        }

        // Second check: Check role in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const hasAdminRole = userData.role === 'admin';
          const hasCorrectEmail = userData.email === AUTHORIZED_ADMIN_EMAIL;
          
          // Both conditions must be true
          setIsAdmin(hasAdminRole && hasCorrectEmail);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, loading]);

  // Additional validation: check if the user is truly a valid admin
  const isValidAdmin = user?.email === AUTHORIZED_ADMIN_EMAIL && isAdmin && !adminLoading;

  return {
    user,
    loading,
    isAdmin,
    isValidAdmin,
    adminLoading
  };
};

export default useAdminAuthLegacy;
