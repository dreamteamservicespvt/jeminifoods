// ====================================================================
// ADMIN SETUP UTILITY - BROWSER CONSOLE VERSION
// ====================================================================
// Copy and paste this entire code block into your browser console
// when you're on your website (localhost:8080 or your domain)

(async function() {
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
      
      // Try to get Firebase from window object (your app should have loaded it)
      if (!window.auth && !window.adminAuth) {
        console.error('❌ Firebase not found. Make sure you are on the website with Firebase loaded.');
        return;
      }

      // Get Firebase Auth and Firestore - prioritize admin instances for admin creation
      let auth, db;
      let createUserWithEmailAndPassword, setDoc, doc, serverTimestamp;

      // Method 1: Try to get from window object (use admin auth for admin creation)
      if (window.adminAuth && window.adminDb) {
        auth = window.adminAuth;  // Use admin auth for creating admin accounts
        db = window.adminDb;      // Use admin db for creating admin accounts
        
        console.log('🔧 Using admin Firebase instance for account creation');
        
        // Try to get Firebase functions from window
        if (window.firebase) {
          createUserWithEmailAndPassword = window.firebase.createUserWithEmailAndPassword || window.createUserWithEmailAndPassword;
          setDoc = window.firebase.setDoc || window.setDoc;
          doc = window.firebase.doc || window.doc;
          serverTimestamp = window.firebase.serverTimestamp || window.serverTimestamp;
        }
      } else if (window.auth && window.db) {
        // Fallback to regular auth if admin auth not available
        auth = window.auth;
        db = window.db;
        
        console.log('⚠️ Using regular Firebase instance (admin instance preferred)');
        
        // Try to get Firebase functions from window
        if (window.firebase) {
          createUserWithEmailAndPassword = window.firebase.createUserWithEmailAndPassword || window.createUserWithEmailAndPassword;
          setDoc = window.firebase.setDoc || window.setDoc;
          doc = window.firebase.doc || window.doc;
          serverTimestamp = window.firebase.serverTimestamp || window.serverTimestamp;
        }
      }

      // Method 2: Try dynamic import
      if (!createUserWithEmailAndPassword) {
        try {
          const authModule = await import('firebase/auth');
          const firestoreModule = await import('firebase/firestore');
          
          createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
          setDoc = firestoreModule.setDoc;
          doc = firestoreModule.doc;
          serverTimestamp = firestoreModule.serverTimestamp;
          
          // Try to get auth and db from the app
          if (!auth || !db) {
            console.error('❌ Cannot access Firebase Auth or Firestore. Please try the manual method below.');
            console.log('📋 MANUAL SETUP INSTRUCTIONS:');
            console.log('1. Go to your Firebase Console');
            console.log('2. Go to Authentication > Users');
            console.log('3. Click "Add User"');
            console.log('4. Email: admin@jeminifoods.com');
            console.log('5. Set a strong password');
            console.log('6. Then go to Firestore Database');
            console.log('7. Create document in "users" collection');
            console.log('8. Use the User UID as document ID');
            console.log('9. Add these fields:');
            console.log('   - email: "admin@jeminifoods.com"');
            console.log('   - role: "admin"');
            console.log('   - fullName: "Jemini Foods Administrator"');
            return;
          }
        } catch (importError) {
          console.error('❌ Cannot import Firebase modules:', importError.message);
          return;
        }
      }

      // Create the admin user
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
        console.log('');
        console.log('🔄 If you forgot the password, you can reset it:');
        console.log('1. Go to /admin/login');
        console.log('2. Use "Forgot Password" option');
        console.log('3. Or contact your developer to reset it manually');
      } else {
        console.error('❌ Error creating admin account:', error.message);
        console.log('');
        console.log('🛠️ ALTERNATIVE MANUAL SETUP:');
        console.log('1. Go to Firebase Console > Authentication');
        console.log('2. Add user with email: admin@jeminifoods.com');
        console.log('3. Go to Firestore > users collection');
        console.log('4. Create document with UID as ID');
        console.log('5. Add field: role = "admin"');
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  console.log('🛠️ Admin Setup Utility Loaded Successfully!');
  console.log('📋 Usage: setupAdmin("your_strong_password_here")');
  console.log('🔒 Admin Email will be: ' + ADMIN_EMAIL);
  console.log('');
  console.log('💡 Example: setupAdmin("MySecurePassword123!")');
})();
