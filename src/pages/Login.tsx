import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, 
  AlertCircle, CheckCircle, Chrome, KeyRound,
  Home, UserPlus, Sparkles, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordFormData {
  email: string;
}

const Login = () => {
  // Form state and validation
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLogin } = useForm<LoginFormData>();
  const { register: registerForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors }, reset: resetForgot } = useForm<ForgotPasswordFormData>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Animation and interaction states
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Refs for enhanced interactions
  const formRef = useRef<HTMLFormElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const navigate = useNavigate();

  // Play interaction sounds
  const playSound = (type: 'success' | 'error' | 'click' = 'click') => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = type === 'error' ? 0.3 : 0.1;
      audioRef.current.play().catch(() => {});
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    playSound('click');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      setSuccessMessage('Welcome back! Redirecting to home...');
      playSound('success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error: any) {
      console.error('Google login error:', error);
      setError('Failed to sign in with Google. Please try again.');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email/password login
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    playSound('click');
    
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      setSuccessMessage('Welcome back! Redirecting to home...');
      playSound('success');
      resetLogin();
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      playSound('error');
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');
    playSound('click');
    
    try {
      await sendPasswordResetEmail(auth, data.email);
      setResetEmailSent(true);
      playSound('success');
      resetForgot();
    } catch (error: any) {
      console.error('Password reset error:', error);
      playSound('error');
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center px-4 relative overflow-hidden">
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-400 mb-4">
            Welcome Back!
          </h1>
          <p className="text-cream/80 text-lg mb-6">
            {successMessage}
          </p>
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Audio feedback */}
      <audio ref={audioRef} src="/sounds/soft-click.mp3" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-600/5 to-transparent rounded-full" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-amber-600/20 shadow-2xl">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-400 rounded-full flex items-center justify-center mr-3"
                >
                  <Sparkles className="w-8 h-8 text-black" />
                </motion.div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-2">
                {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </h1>
              <p className="text-cream/70 text-sm sm:text-base">
                {showForgotPassword 
                  ? 'Enter your email to receive a password reset link'
                  : 'Sign in to your Jemini Foods account'}
              </p>
              
              {!showForgotPassword && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Badge variant="outline" className="border-amber-600/30 text-amber-400 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure Login
                  </Badge>
                </div>
              )}
            </motion.div>

            {!showForgotPassword ? (
              <>
                {/* Google Login Button */}
                <motion.div variants={itemVariants} className="mb-6">
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white/10 hover:bg-white/20 text-cream border border-amber-600/30 hover:border-amber-400/50 transition-all duration-300 h-12 group"
                  >
                    <Chrome className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">Continue with Google</span>
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-600/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/40 text-cream/60">or continue with email</span>
                  </div>
                </motion.div>

                {/* Login Form */}
                <motion.form
                  ref={formRef}
                  variants={itemVariants}
                  onSubmit={handleLoginSubmit(onLoginSubmit)}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <div className="relative">                      <input
                        {...registerLogin('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        type="email"
                        placeholder="Enter your email"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 rounded-lg focus:outline-none ${
                          focusedField === 'email' 
                            ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                            : loginErrors.email 
                              ? 'border-red-400' 
                              : 'border-amber-600/30 hover:border-amber-600/50'
                        }`}
                      />
                      {loginErrors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {loginErrors.email.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div className="relative">                      <input
                        {...registerLogin('password', { 
                          required: 'Password is required'
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 pr-12 rounded-lg focus:outline-none ${
                          focusedField === 'password' 
                            ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                            : loginErrors.password 
                              ? 'border-red-400' 
                              : 'border-amber-600/30 hover:border-amber-600/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream/50 hover:text-amber-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {loginErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {loginErrors.password.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                        playSound('click');
                      }}
                      className="text-sm text-amber-400 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      Forgot Password?
                    </button>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>                  {/* Submit Button */}
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-semibold py-3 h-12 transition-all duration-300 disabled:scale-100 disabled:opacity-50 group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>

                {/* Footer */}
                <motion.div variants={itemVariants} className="mt-8 text-center space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => navigate('/')}
                      className="text-cream/60 hover:text-amber-400 text-sm font-medium hover:underline transition-colors flex items-center gap-1"
                    >
                      <Home className="w-4 h-4" />
                      Back to Home
                    </button>
                  </div>
                  
                  <p className="text-cream/60 text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create one here
                    </button>
                  </p>
                </motion.div>
              </>
            ) : (
              /* Forgot Password Form */
              <>
                {resetEmailSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-400 mb-2">Email Sent!</h3>
                    <p className="text-cream/70 mb-6">
                      Check your email for a password reset link.
                    </p>
                    <Button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmailSent(false);
                        setError('');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-black"
                    >
                      Back to Login
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    variants={itemVariants}
                    onSubmit={handleForgotSubmit(onForgotPasswordSubmit)}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <div className="relative">                        <input
                          {...registerForgot('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: 'Please enter a valid email address'
                            }
                          })}
                          type="email"
                          placeholder="Enter your email"
                          onFocus={() => setFocusedField('forgotEmail')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 rounded-lg focus:outline-none ${
                            focusedField === 'forgotEmail' 
                              ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                              : forgotErrors.email 
                                ? 'border-red-400' 
                                : 'border-amber-600/30 hover:border-amber-600/50'
                          }`}
                        />
                        {forgotErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs mt-1 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {forgotErrors.email.message}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2"
                        >
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-semibold py-3 h-12"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>Sending Reset Link...</span>
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError('');
                          playSound('click');
                        }}
                        variant="outline"
                        className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </motion.form>
                )}
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;