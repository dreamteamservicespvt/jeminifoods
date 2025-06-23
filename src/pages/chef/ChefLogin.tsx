import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { ChefHat, Mail, Lock, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const ChefLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Check if user is a chef in the chefs collection
      // First, try to find chef by email in the chefs collection
      const chefsQuery = query(collection(db, 'chefs'), where('email', '==', email));
      const chefsSnapshot = await getDocs(chefsQuery);
      
      if (!chefsSnapshot.empty) {
        // Chef found by email
        const chefData = chefsSnapshot.docs[0].data();
        
        toast({
          title: "Welcome back!",
          description: `Hello Chef ${chefData.name}. Ready to cook amazing dishes!`,
        });
        
        // Navigate to chef dashboard
        navigate('/chef/dashboard');
      } else {
        // Also check if chef document exists by uid (fallback)
        const chefDoc = await getDoc(doc(db, 'chefs', uid));
        
        if (chefDoc.exists()) {
          const chefData = chefDoc.data();
          toast({
            title: "Welcome back!",
            description: `Hello Chef ${chefData.name}. Ready to cook amazing dishes!`,
          });
          navigate('/chef/dashboard');
        } else {
          // User exists but is not a chef
          setError('You do not have chef privileges. Please contact the administrator.');
        }
      }
    } catch (error: any) {
      console.error('Chef login error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center px-6 py-8">
      {/* Back to Home Link */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-cream/60 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/50 border border-amber-600/20 p-6 md:p-8 w-full max-w-md rounded-lg shadow-xl backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            className="p-4 bg-amber-600/20 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ChefHat className="w-8 h-8 text-amber-400" />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-amber-400 text-center">
            Chef Portal
          </h1>
          <p className="text-cream/60 text-center mt-2">
            Sign in to manage your orders
          </p>
          <div className="w-24 h-1 mt-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
        </div>
        
        {/* Enhanced Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cream/80 mb-2">
              Chef Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream/40 w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your chef email"
                required
                className="pl-10 bg-black/30 border-amber-600/20 text-cream placeholder:text-cream/40 focus:border-amber-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cream/80 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream/40 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pl-10 pr-10 bg-black/30 border-amber-600/20 text-cream placeholder:text-cream/40 focus:border-amber-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream/40 hover:text-cream"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-400/30 rounded-lg text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold py-3 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4 mr-2" />
                Sign In to Kitchen
              </>
            )}
          </Button>

          {/* Additional Info */}
          <div className="text-center space-y-3 pt-4 border-t border-amber-600/20">
            <p className="text-cream/60 text-sm">
              Having trouble? Contact your administrator for chef account setup.
            </p>
            
            {/* Demo Credentials (Remove in production) */}
            <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-3">
              <p className="text-amber-400 text-xs font-medium mb-1">Demo Chef Credentials:</p>
              <p className="text-cream/60 text-xs">Email: chef@jemini.com | Password: demo123</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-cream/40 text-sm">
            Need help? Contact the administrator
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link 
              to="/admin/login"
              className="text-amber-400/60 hover:text-amber-400 text-sm transition-colors"
            >
              Admin Portal
            </Link>
            <span className="text-cream/20">•</span>
            <Link 
              to="/login"
              className="text-amber-400/60 hover:text-amber-400 text-sm transition-colors"
            >
              Customer Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChefLogin;
