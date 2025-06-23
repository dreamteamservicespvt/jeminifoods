import React, { createContext, useContext } from 'react';
import { UserAuthProvider, useUserAuth } from './UserAuthContext';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';

interface MultiAuthContextType {
  // User auth
  user: any;
  userProfile: any;
  userLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  
  // Admin auth
  adminUser: any;
  adminProfile: any;
  adminLoading: boolean;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  isAdminAuthenticated: boolean;
  isAuthorizedAdmin: boolean;
}

const MultiAuthContext = createContext<MultiAuthContextType | undefined>(undefined);

export const useMultiAuth = () => {
  const context = useContext(MultiAuthContext);
  if (context === undefined) {
    throw new Error('useMultiAuth must be used within a MultiAuthProvider');
  }
  return context;
};

// Internal component that bridges the two auth contexts
const MultiAuthBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userAuth = useUserAuth();
  const adminAuth = useAdminAuth();

  const value: MultiAuthContextType = {
    // User auth
    user: userAuth.user,
    userProfile: userAuth.userProfile,
    userLoading: userAuth.loading,
    signIn: userAuth.signIn,
    signUp: userAuth.signUp,
    signInWithGoogle: userAuth.signInWithGoogle,
    logout: userAuth.logout,
    isAuthenticated: userAuth.isAuthenticated,
    
    // Admin auth
    adminUser: adminAuth.adminUser,
    adminProfile: adminAuth.adminProfile,
    adminLoading: adminAuth.loading,
    signInAsAdmin: adminAuth.signInAsAdmin,
    logoutAdmin: adminAuth.logoutAdmin,
    isAdminAuthenticated: adminAuth.isAdminAuthenticated,
    isAuthorizedAdmin: adminAuth.isAuthorizedAdmin
  };

  return (
    <MultiAuthContext.Provider value={value}>
      {children}
    </MultiAuthContext.Provider>
  );
};

interface MultiAuthProviderProps {
  children: React.ReactNode;
}

export const MultiAuthProvider: React.FC<MultiAuthProviderProps> = ({ children }) => {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <MultiAuthBridge>
          {children}
        </MultiAuthBridge>
      </AdminAuthProvider>
    </UserAuthProvider>
  );
};

// Convenience hooks for specific auth contexts
export const useUserAuthOnly = () => {
  const { user, userProfile, userLoading, signIn, signUp, signInWithGoogle, logout, isAuthenticated } = useMultiAuth();
  return {
    user,
    userProfile,
    loading: userLoading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isAuthenticated
  };
};

export const useAdminAuthOnly = () => {
  const { 
    adminUser, 
    adminProfile, 
    adminLoading, 
    signInAsAdmin, 
    logoutAdmin, 
    isAdminAuthenticated, 
    isAuthorizedAdmin 
  } = useMultiAuth();
  return {
    adminUser,
    adminProfile,
    loading: adminLoading,
    signInAsAdmin,
    logoutAdmin,
    isAdminAuthenticated,
    isAuthorizedAdmin
  };
};
