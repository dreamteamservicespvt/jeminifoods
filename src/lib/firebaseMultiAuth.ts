import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from '../firebaseConfig';

// Extend the Window interface to include our Firebase instances
declare global {
  interface Window {
    auth: Auth;
    db: Firestore;
    adminAuth: Auth;
    adminDb: Firestore;
  }
}

// Create separate Firebase app instances for different contexts
const createFirebaseApp = (name = '[DEFAULT]') => {
  return initializeApp(firebaseConfig, name);
};

// Default app for normal users
export const app = createFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Admin app instance (separate from default)
export const adminApp = createFirebaseApp('admin-app');
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Make Firebase instances available globally for console access
if (typeof window !== 'undefined') {
  window.auth = auth;
  window.db = db;
  window.adminAuth = adminAuth;
  window.adminDb = adminDb;
}

// Note: Emulators disabled - using production Firebase
// Uncomment below if you want to use Firebase emulators in development
/*
if (process.env.NODE_ENV === 'development') {
  try {
    // Connect default app to emulators
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Connect admin app to emulators
    connectAuthEmulator(adminAuth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(adminDb, 'localhost', 8080);
    connectStorageEmulator(adminStorage, 'localhost', 9199);
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}
*/
