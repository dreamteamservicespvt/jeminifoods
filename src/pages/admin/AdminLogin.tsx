import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Check if user has admin role
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        // Admin login successful, navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // User exists but is not an admin
        setError('You do not have administrator privileges.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later.');
      } else if (error.code?.includes('api-key-not-valid')) {
        setError('Authentication service error. Please contact support.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/50 border border-amber-600/20 p-6 md:p-8 w-full max-w-md rounded-lg shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-amber-400 text-center">
            Admin Login
          </h1>
          <div className="w-24 h-1 mt-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-400">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-charcoal border border-amber-600/30 text-cream pl-10 pr-4 py-3 focus:border-amber-400 focus:outline-none rounded"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-400">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-charcoal border border-amber-600/30 text-cream pl-10 pr-4 py-3 focus:border-amber-400 focus:outline-none rounded"
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-3 rounded flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-black py-3 font-semibold transition-colors disabled:opacity-50 rounded flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
