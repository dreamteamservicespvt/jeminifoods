import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/**
 * Utility function to create the admin account
 * This should be run once to set up the admin account
 * 
 * Admin credentials:
 * Email: admin@jeminifoods.com
 * Password: (set when creating the account)
 */
export const createAdminAccount = async (password: string) => {
  const ADMIN_EMAIL = 'admin@jeminifoods.com';
  
  try {
    console.log('Creating admin account...');
    
    // Create the admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    const adminUser = userCredential.user;
    
    // Create the admin profile in Firestore
    await setDoc(doc(db, 'users', adminUser.uid), {
      fullName: 'Jemini Foods Administrator',
      email: ADMIN_EMAIL,
      phone: '',
      profileImage: null,
      createdAt: serverTimestamp(),
      provider: 'email',
      role: 'admin'
    });
    
    console.log('Admin account created successfully!');
    console.log('Admin Email:', ADMIN_EMAIL);
    console.log('Admin UID:', adminUser.uid);
    
    return {
      success: true,
      uid: adminUser.uid,
      email: ADMIN_EMAIL
    };
    
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
      return {
        success: false,
        error: 'Admin account already exists'
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Use this in the browser console to create the admin account:
 * 
 * 1. Go to your website
 * 2. Open browser console (F12)
 * 3. Run: createAdminAccount('your_admin_password_here')
 * 
 * Make sure to use a strong password!
 */
