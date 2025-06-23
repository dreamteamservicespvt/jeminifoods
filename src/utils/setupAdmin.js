// Admin Setup Utility - Browser Console Version
// Run this in the browser console to create the admin account
// 
// Instructions:
// 1. Open your website in the browser (make sure you're logged out first)
// 2. Open the browser console (F12)
// 3. Copy and paste this entire file into the console
// 4. Run: setupAdmin('your_strong_password_here')

const ADMIN_EMAIL = 'admin@jeminifoods.com';

window.setupAdmin = async function(password) {
  if (!password) {
    console.error('❌ Password is required. Usage: setupAdmin("your_password_here")');
    return;
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    return;
  }

  try {
    console.log('🔐 Creating admin account...');
    
    // Get Firebase functions from the global scope (already loaded by your app)
    const { auth } = window;
    const { db } = window;
    
    // Import Firebase functions from the global Firebase object
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
    
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
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Admin Email:', ADMIN_EMAIL);
    console.log('🆔 Admin UID:', adminUser.uid);
    console.log('🔑 Admin Role: admin');
    console.log('');
    console.log('🎉 You can now login to /admin with these credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password: [the password you just set]');
    
    return {
      success: true,
      uid: adminUser.uid,
      email: ADMIN_EMAIL
    };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin account already exists');
      console.log('📧 Admin Email:', ADMIN_EMAIL);
      console.log('🔑 You can login to /admin with the existing credentials');
    } else {
      console.error('❌ Error creating admin account:', error.message);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

console.log('🛠️ Admin Setup Utility Loaded');
console.log('📋 Usage: setupAdmin("your_strong_password_here")');
console.log('🔒 Admin Email will be: ' + ADMIN_EMAIL);
