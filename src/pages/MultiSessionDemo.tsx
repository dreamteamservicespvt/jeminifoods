import React from 'react';
import { useMultiAuth } from '../contexts/MultiAuthContext';
import { motion } from 'framer-motion';
import { User, Shield, LogIn, LogOut, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const MultiSessionDemo = () => {
  const {
    // User auth
    user,
    userProfile,
    userLoading,
    logout,
    isAuthenticated,
    
    // Admin auth
    adminUser,
    adminProfile,
    adminLoading,
    logoutAdmin,
    isAdminAuthenticated,
    isAuthorizedAdmin
  } = useMultiAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-amber-400 mb-4">
            Multi-Session Authentication Demo
          </h1>
          <p className="text-cream/70 text-lg">
            This page demonstrates the ability to have separate user and admin sessions running simultaneously
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Session Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/40 border-amber-600/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <User className="w-5 h-5" />
                  User Session
                </CardTitle>
                <CardDescription className="text-cream/60">
                  Regular customer authentication using the main Firebase app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userLoading ? (
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    <span>Loading user session...</span>
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="space-y-3">
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      <Users className="w-3 h-3 mr-1" />
                      Authenticated
                    </Badge>
                    <div className="space-y-2">
                      <p className="text-cream"><strong>Name:</strong> {userProfile?.fullName || user.displayName || 'User'}</p>
                      <p className="text-cream"><strong>Email:</strong> {user.email}</p>
                      <p className="text-cream"><strong>Role:</strong> {userProfile?.role || 'user'}</p>
                      <p className="text-cream/70 text-sm"><strong>UID:</strong> {user.uid}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate('/user-dashboard')}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-black"
                      >
                        User Dashboard
                      </Button>
                      <Button 
                        onClick={logout}
                        size="sm"
                        variant="outline"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="outline" className="border-cream/30 text-cream/60">
                      Not Authenticated
                    </Badge>
                    <p className="text-cream/70">No user session active</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate('/login')}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-black"
                      >
                        <LogIn className="w-4 h-4 mr-1" />
                        Login
                      </Button>
                      <Button 
                        onClick={() => navigate('/signup')}
                        size="sm"
                        variant="outline"
                        className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Session Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-black/40 border-red-600/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="w-5 h-5" />
                  Admin Session
                </CardTitle>
                <CardDescription className="text-cream/60">
                  Administrator authentication using a separate Firebase app instance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {adminLoading ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    <span>Loading admin session...</span>
                  </div>
                ) : isAdminAuthenticated && adminUser && isAuthorizedAdmin ? (
                  <div className="space-y-3">
                    <Badge variant="outline" className="border-red-400 text-red-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin Authenticated
                    </Badge>
                    <div className="space-y-2">
                      <p className="text-cream"><strong>Name:</strong> {adminProfile?.fullName || adminUser.displayName || 'Admin'}</p>
                      <p className="text-cream"><strong>Email:</strong> {adminUser.email}</p>
                      <p className="text-cream"><strong>Role:</strong> {adminProfile?.role || 'admin'}</p>
                      <p className="text-cream/70 text-sm"><strong>UID:</strong> {adminUser.uid}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate('/admin/dashboard')}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Admin Dashboard
                      </Button>
                      <Button 
                        onClick={logoutAdmin}
                        size="sm"
                        variant="outline"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout Admin
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="outline" className="border-cream/30 text-cream/60">
                      Not Authenticated
                    </Badge>
                    <p className="text-cream/70">No admin session active</p>
                    <Button 
                      onClick={() => navigate('/admin/login')}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Admin Login
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-black/40 border-amber-600/30">
            <CardHeader>
              <CardTitle className="text-amber-400">How to Test Multi-Session Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-amber-400 font-semibold mb-2">Option 1: Different Browser Tabs</h4>
                  <ol className="space-y-1 text-cream/80 text-sm list-decimal list-inside">
                    <li>Open this page in Tab 1</li>
                    <li>Login as a normal user (use any email)</li>
                    <li>Open a new tab (Tab 2) and navigate to /admin/login</li>
                    <li>Login as admin (admin@jeminifoods.com)</li>
                    <li>Switch between tabs - both sessions remain active!</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold mb-2">Option 2: Same Tab Demo</h4>
                  <ol className="space-y-1 text-cream/80 text-sm list-decimal list-inside">
                    <li>Use the login buttons above to authenticate</li>
                    <li>Login as both user and admin</li>
                    <li>Notice both sessions are active simultaneously</li>
                    <li>You can logout from each session independently</li>
                    <li>Visit dashboards for each role separately</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4 mt-4">
                <p className="text-amber-400 text-sm font-medium">
                  🎉 <strong>Success!</strong> If you can see both sessions active above, the multi-session authentication is working perfectly!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiSessionDemo;
