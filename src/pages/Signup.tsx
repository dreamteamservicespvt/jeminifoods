import React, { useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, 
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft,
  Chrome, Sparkles, Shield, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  // Form state and validation
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<SignupFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Animation and interaction states
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for enhanced interactions
  const formRef = useRef<HTMLFormElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const navigate = useNavigate();
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [password]);

  // Success confetti animation
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const confetti = require('canvas-confetti');
    const myConfetti = confetti.create(canvas, { resize: true });
    
    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EAB308', '#FDE047']
    });
  };

  // Play interaction sounds
  const playSound = (type: 'success' | 'error' | 'click' = 'click') => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = type === 'error' ? 0.3 : 0.1;
      audioRef.current.play().catch(() => {});
    }
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    playSound('click');
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
        // Create user profile in Firestore with appropriate role
      const isAdmin = userCredential.user.email === 'admin@jeminifoods.com';
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        phone: '',
        profileImage: userCredential.user.photoURL || null,
        createdAt: serverTimestamp(),
        provider: 'google',
        role: isAdmin ? 'admin' : 'user'
      });
      
      setSuccess(true);
      triggerConfetti();
      playSound('success');
      
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError('Failed to sign up with Google. Please try again.');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      playSound('error');
      return;
    }

    setIsLoading(true);
    setError('');
    playSound('click');
    
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        // Create user profile in Firestore with appropriate role
      const isAdmin = data.email === 'admin@jeminifoods.com';
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        profileImage: null,
        createdAt: serverTimestamp(),
        provider: 'email',
        role: isAdmin ? 'admin' : 'user'
      });
      
      setSuccess(true);
      triggerConfetti();
      playSound('success');
      reset();
      
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      playSound('error');
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please try logging in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to create account. Please try again.');
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
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    }
  };

  // Password strength indicator
  const PasswordStrengthIndicator = () => (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-cream/70">Password Strength</span>
        <span className={`font-medium ${
          passwordStrength < 50 ? 'text-red-400' :
          passwordStrength < 80 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {passwordStrength < 50 ? 'Weak' :
           passwordStrength < 80 ? 'Good' : 'Strong'}
        </span>
      </div>
      <div className="w-full bg-charcoal/50 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full transition-colors duration-300 ${
            passwordStrength < 50 ? 'bg-red-500' :
            passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${passwordStrength}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center px-4 relative overflow-hidden">
        <canvas 
          ref={confettiCanvasRef}
          className="absolute inset-0 pointer-events-none z-50"
        />
        
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
            Welcome to Jemini Foods!
          </h1>
          <p className="text-cream/80 text-lg mb-6">
            Your account has been created successfully. 
            Redirecting to your dashboard...
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
        {[...Array(20)].map((_, i) => (
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
                Join Jemini Foods
              </h1>
              <p className="text-cream/70 text-sm sm:text-base">
                Create your account for exclusive dining experiences
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="outline" className="border-amber-600/30 text-amber-400 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="border-amber-600/30 text-amber-400 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </motion.div>

            {/* Google Signup Button */}
            <motion.div variants={itemVariants} className="mb-6">
              <Button
                type="button"
                onClick={handleGoogleSignup}
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

            {/* Signup Form */}
            <motion.form
              ref={formRef}
              variants={itemVariants}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <div className="relative">                  <input
                    {...register('fullName', { 
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    type="text"
                    placeholder="Enter your full name"
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 rounded-lg focus:outline-none ${
                      focusedField === 'fullName' 
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                        : errors.fullName 
                          ? 'border-red-400' 
                          : 'border-amber-600/30 hover:border-amber-600/50'
                    }`}
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">                  <input
                    {...register('email', { 
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
                        : errors.email 
                          ? 'border-red-400' 
                          : 'border-amber-600/30 hover:border-amber-600/50'
                    }`}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <div className="relative">                  <input
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{9,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    type="tel"
                    placeholder="Enter your phone number"
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 rounded-lg focus:outline-none ${
                      focusedField === 'phone' 
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                        : errors.phone 
                          ? 'border-red-400' 
                          : 'border-amber-600/30 hover:border-amber-600/50'
                    }`}
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone.message}
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
                <div className="relative">                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 pr-12 rounded-lg focus:outline-none ${
                      focusedField === 'password' 
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                        : errors.password 
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
                  
                  {password && <PasswordStrengthIndicator />}
                  
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative">                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-charcoal/50 border-2 transition-all duration-300 text-cream placeholder-cream/40 px-4 py-3 pr-12 rounded-lg focus:outline-none ${
                      focusedField === 'confirmPassword' 
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                        : errors.confirmPassword 
                          ? 'border-red-400' 
                          : confirmPassword && confirmPassword === password
                            ? 'border-green-400'
                            : 'border-amber-600/30 hover:border-amber-600/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream/50 hover:text-amber-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                  {confirmPassword && confirmPassword === password && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                  
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword.message}
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
              </AnimatePresence>              {/* Submit Button */}
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-cream/60 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
              
              <div className="mt-4 pt-4 border-t border-amber-600/20">
                <p className="text-cream/40 text-xs">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-amber-400 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-amber-400 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
