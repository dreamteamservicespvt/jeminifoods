import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { adminAuth, adminDb } from '../lib/firebaseMultiAuth';

interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  createdAt: any;
  provider: string;
  role: 'admin';
}

interface AdminAuthContextType {
  adminUser: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  isAdminAuthenticated: boolean;
  isAuthorizedAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

const AUTHORIZED_ADMIN_EMAIL = 'admin@jeminifoods.com';

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      setAdminUser(user);
      
      if (user) {
        // Verify this is an authorized admin
        if (user.email === AUTHORIZED_ADMIN_EMAIL) {
          try {
            // Fetch admin profile from Firestore using admin db
            const userDoc = await getDoc(doc(adminDb, 'users', user.uid));
            if (userDoc.exists()) {
              const profileData = userDoc.data();
              
              // Double-check the role and email
              if (profileData.role === 'admin' && profileData.email === AUTHORIZED_ADMIN_EMAIL) {
                setAdminProfile({ id: userDoc.id, ...profileData } as AdminProfile);
                setIsAuthorizedAdmin(true);
              } else {
                // User exists but doesn't have proper admin privileges
                console.warn('User authenticated but lacks admin privileges');
                await signOut(adminAuth);
                setIsAuthorizedAdmin(false);
              }
            } else {
              // Admin user not found in Firestore
              console.warn('Admin user not found in database');
              await signOut(adminAuth);
              setIsAuthorizedAdmin(false);
            }
          } catch (error) {
            console.error('Error fetching admin profile:', error);
            setIsAuthorizedAdmin(false);
          }
        } else {
          // Not the authorized admin email
          console.warn('Unauthorized admin login attempt:', user.email);
          await signOut(adminAuth);
          setIsAuthorizedAdmin(false);
        }
      } else {
        setAdminProfile(null);
        setIsAuthorizedAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      // First validation: Check if email is the authorized admin email
      if (email !== AUTHORIZED_ADMIN_EMAIL) {
        throw new Error('Invalid admin credentials. Only authorized administrators can access this area.');
      }

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
      const uid = userCredential.user.uid;
      
      // Verify admin role in Firestore
      const userDoc = await getDoc(doc(adminDb, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasAdminRole = userData.role === 'admin';
        const hasCorrectEmail = userData.email === AUTHORIZED_ADMIN_EMAIL;
        
        if (!hasAdminRole || !hasCorrectEmail) {
          await signOut(adminAuth);
          throw new Error('Access denied. You do not have administrator privileges.');
        }
      } else {
        await signOut(adminAuth);
        throw new Error('Admin account not found. Please contact system administrator.');
      }
    } catch (error) {
      throw error;
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(adminAuth);
    } catch (error) {
      throw error;
    }
  };

  const value: AdminAuthContextType = {
    adminUser,
    adminProfile,
    loading,
    signInAsAdmin,
    logoutAdmin,
    isAdminAuthenticated: !!adminUser,
    isAuthorizedAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
