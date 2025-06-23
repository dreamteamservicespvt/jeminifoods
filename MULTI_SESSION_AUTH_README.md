# Multi-Session Authentication System

## Overview

The Jemini Foods website now supports **simultaneous user and admin authentication sessions** in the same browser. This means you can be logged in as a regular user in one tab and as an admin in another tab without any session conflicts.

## How It Works

### Technical Implementation

The multi-session system uses **separate Firebase app instances**:

1. **Main App (User Sessions)**: `firebase.ts` - Handles regular user authentication
2. **Admin App (Admin Sessions)**: `firebaseMultiAuth.ts` - Handles admin authentication using a separate Firebase app instance

### Key Components

#### 1. Multiple Firebase Apps
```typescript
// Default app for normal users
export const app = createFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Admin app instance (separate from default)
export const adminApp = createFirebaseApp('admin-app');
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
```

#### 2. Separate Authentication Contexts
- **UserAuthContext**: Manages user authentication using the main Firebase app
- **AdminAuthContext**: Manages admin authentication using the admin Firebase app
- **MultiAuthContext**: Provides unified access to both contexts

#### 3. Protected Routes
- **AdminProtectedRoute**: Uses admin auth context to protect admin routes
- Regular routes use user auth context for user-specific features

## Testing Multi-Session Authentication

### Method 1: Different Browser Tabs
1. Open your website in **Tab 1**
2. Navigate to `/login` and login as a regular user
3. Open **Tab 2** and navigate to `/admin/login`
4. Login as admin (`admin@jeminifoods.com`)
5. Switch between tabs - both sessions remain active!

### Method 2: Demo Page
1. Navigate to `/multi-session-demo`
2. Use the interface to login as both user and admin
3. Verify both sessions are active simultaneously

### Method 3: Manual Testing
1. **User Session**:
   - Login at `/login` with any email
   - Visit `/user-dashboard` to confirm user session
   
2. **Admin Session** (same browser):
   - Navigate to `/admin/login`
   - Login with `admin@jeminifoods.com`
   - Visit `/admin/dashboard` to confirm admin session
   
3. **Verification**:
   - Both dashboards should be accessible
   - Sessions are independent and don't interfere

## Admin Account Setup

### Using Browser Console (Easiest)
1. Open your website in the browser
2. Open Developer Tools (F12) → Console
3. Copy and paste the entire content from `CONSOLE_ADMIN_SETUP.js`
4. Run: `setupAdmin("your_strong_password")`

### Manual Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. **Authentication** → **Users** → **Add User**
   - Email: `admin@jeminifoods.com`
   - Password: `[your secure password]`
4. **Firestore Database** → **users** collection
   - Create document with User UID as document ID
   - Add fields:
     ```json
     {
       "email": "admin@jeminifoods.com",
       "role": "admin",
       "fullName": "Jemini Foods Administrator",
       "phone": "",
       "profileImage": null,
       "createdAt": [current timestamp],
       "provider": "email"
     }
     ```

## Security Features

### Admin Access Control
- **Email Verification**: Only `admin@jeminifoods.com` can access admin routes
- **Role Verification**: User must have `role: "admin"` in Firestore
- **Double Authentication**: Both Firebase Auth and Firestore role are checked
- **Session Isolation**: Admin and user sessions are completely separate

### Route Protection
- All `/admin/*` routes are protected by `AdminProtectedRoute`
- Admin login attempts with wrong email are immediately rejected
- Invalid admin sessions are automatically signed out

## Usage Examples

### For Regular Users
```typescript
import { useUserAuthOnly } from '../contexts/MultiAuthContext';

const MyComponent = () => {
  const { user, userProfile, signIn, logout, isAuthenticated } = useUserAuthOnly();
  
  // User-specific logic here
};
```

### For Admin Features
```typescript
import { useAdminAuthOnly } from '../contexts/MultiAuthContext';

const AdminComponent = () => {
  const { 
    adminUser, 
    adminProfile, 
    signInAsAdmin, 
    logoutAdmin, 
    isAdminAuthenticated,
    isAuthorizedAdmin 
  } = useAdminAuthOnly();
  
  // Admin-specific logic here
};
```

### For Components That Need Both
```typescript
import { useMultiAuth } from '../contexts/MultiAuthContext';

const DualSessionComponent = () => {
  const {
    // User auth
    user,
    isAuthenticated,
    logout,
    
    // Admin auth  
    adminUser,
    isAdminAuthenticated,
    logoutAdmin
  } = useMultiAuth();
  
  // Logic that uses both sessions
};
```

## Benefits

### For Users
- ✅ No session conflicts between user and admin logins
- ✅ Can maintain separate user account while testing admin features
- ✅ Seamless experience when switching between customer and admin views

### For Development
- ✅ Easy testing of both user and admin features
- ✅ No need to constantly log in/out when switching roles
- ✅ Better development workflow

### For Security
- ✅ Complete session isolation prevents privilege escalation
- ✅ Admin sessions require separate authentication
- ✅ User sessions cannot accidentally access admin features

## File Structure

```
src/
├── contexts/
│   ├── UserAuthContext.tsx     # User authentication
│   ├── AdminAuthContext.tsx    # Admin authentication
│   └── MultiAuthContext.tsx    # Unified multi-auth provider
├── lib/
│   ├── firebase.ts             # Main Firebase app (users)
│   └── firebaseMultiAuth.ts    # Admin Firebase app
├── components/admin/
│   └── AdminProtectedRoute.tsx # Admin route protection
├── pages/
│   ├── admin/
│   │   ├── AdminLogin.tsx      # Admin login (uses admin auth)
│   │   └── AdminDashboard.tsx  # Admin dashboard
│   ├── Login.tsx               # User login (uses user auth)
│   └── MultiSessionDemo.tsx    # Demo page for testing
└── App.tsx                     # Multi-auth provider setup
```

## Troubleshooting

### Issue: Sessions Interfering With Each Other
**Solution**: Check that you're using the correct auth contexts in your components.

### Issue: Admin Login Not Working
**Solution**: 
1. Verify admin account exists with correct email and role
2. Check browser console for authentication errors
3. Use the admin setup utility to recreate the account

### Issue: User Session Lost When Logging Into Admin
**Solution**: This shouldn't happen with the multi-session setup. If it does, check that the admin components are using `useAdminAuthOnly()` instead of the regular auth hooks.

### Issue: Firebase App Already Exists Error
**Solution**: The multi-auth system handles this automatically. If you see this error, check that you're not initializing Firebase apps elsewhere in your code.

## Success Verification

✅ **You have successfully implemented multi-session authentication if**:
1. You can login as a user at `/login`
2. You can simultaneously login as admin at `/admin/login` 
3. Both sessions remain active when switching between tabs
4. You can access both `/user-dashboard` and `/admin/dashboard`
5. Logging out from one session doesn't affect the other
6. The demo page at `/multi-session-demo` shows both sessions as active

🎉 **Congratulations! Your multi-session authentication system is working perfectly!**
