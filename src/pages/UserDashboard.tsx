import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Clock, 
  Settings, LogOut, Bell, Star, Award, 
  ChefHat, Utensils, Heart, Edit2, Camera,
  CreditCard, Gift, Bookmark, History, ArrowRight,
  MessageSquare, Headphones, HelpCircle, Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  createdAt: any;
  provider: string;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: any;
  specialRequests?: string;
}

interface PreOrder {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  pickupDate: string;
  pickupTime: string;
  createdAt: any;
}

const UserDashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: ''
  });

  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user profile and data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoadingData(true);
        
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
          setUserProfile(profileData);
          setEditForm({
            fullName: profileData.fullName,
            phone: profileData.phone
          });
        }

        // Fetch reservations
        const reservationsQuery = query(
          collection(db, 'reservations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);
        const reservationsData = reservationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reservation[];
        setReservations(reservationsData);

        // Fetch pre-orders
        const preOrdersQuery = query(
          collection(db, 'preOrders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const preOrdersSnapshot = await getDocs(preOrdersQuery);
        const preOrdersData = preOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PreOrder[];
        setPreOrders(preOrdersData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: editForm.fullName,
        phone: editForm.phone,
        updatedAt: new Date()
      });
      
      setUserProfile({
        ...userProfile,
        fullName: editForm.fullName,
        phone: editForm.phone
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'ready': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'pending': case 'preparing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -4,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-xl border-b border-amber-600/20 px-4 py-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-amber-600/30">
                {userProfile.profileImage ? (
                  <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center">
                    <User className="w-8 h-8 text-black" />
                  </div>
                )}
              </Avatar>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center"
              >
                <Camera className="w-3 h-3 text-black" />
              </motion.button>
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                Welcome, {userProfile.fullName.split(' ')[0]}!
              </h1>
              <p className="text-cream/70">Member since {formatDate(userProfile.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Message & Quick Stats */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-cream mb-4">
              Your Dining Journey
            </h2>
            <p className="text-cream/70 text-lg max-w-2xl mx-auto">
              Manage your reservations, track your pre-orders, and stay connected with our team.
            </p>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{reservations.length}</p>
              <p className="text-cream/70 text-sm">Reservations</p>
            </Card>

            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{preOrders.length}</p>
              <p className="text-cream/70 text-sm">Pre-Orders</p>
            </Card>

            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-cream">1,250</p>
              <p className="text-cream/70 text-sm">Loyalty Points</p>
            </Card>

            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-cream">8</p>
              <p className="text-cream/70 text-sm">Favorites</p>
            </Card>
          </motion.div>

          {/* Main Three Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Pre-Orders Section */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30 p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Utensils className="w-7 h-7 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-green-400">Pre-Orders</h3>
                        <p className="text-cream/70 text-sm">Quick pickup ordering</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                      {preOrders.length} Active
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4 mb-6">
                    {preOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-cream font-medium">Order #{order.id.slice(-6)}</p>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-cream/70 text-sm">${order.total.toFixed(2)} • {order.items.length} items</p>
                        <p className="text-cream/60 text-xs mt-1">Pickup: {order.pickupDate}</p>
                      </div>
                    ))}

                    {preOrders.length === 0 && (
                      <div className="text-center py-8">
                        <ChefHat className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                        <p className="text-cream/60">No pre-orders yet</p>
                        <p className="text-cream/40 text-sm">Start ordering for quick pickup</p>
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => navigate('/pre-orders')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Utensils className="w-4 h-4" />
                      {preOrders.length > 0 ? 'View All Pre-Orders' : 'Start Pre-Ordering'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Reservations Section */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-blue-400">Reservations</h3>
                        <p className="text-cream/70 text-sm">Dining experiences</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                      {reservations.length} Total
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4 mb-6">
                    {reservations.slice(0, 3).map((reservation) => (
                      <div key={reservation.id} className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-cream font-medium">{formatDate(reservation.date)}</p>
                          <Badge className={`text-xs ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </Badge>
                        </div>
                        <p className="text-cream/70 text-sm">{reservation.time} • {reservation.guests} guests</p>
                        <p className="text-cream/60 text-xs mt-1">{reservation.seatingPreference}</p>
                      </div>
                    ))}

                    {reservations.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
                        <p className="text-cream/60">No reservations yet</p>
                        <p className="text-cream/40 text-sm">Book your dining experience</p>
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => navigate('/reservations')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Calendar className="w-4 h-4" />
                      {reservations.length > 0 ? 'View All Reservations' : 'Make a Reservation'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-500/30 p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-400">Contact</h3>
                        <p className="text-cream/70 text-sm">Get in touch with us</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30">
                      24/7 Support
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4 mb-6">
                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="bg-black/30 rounded-lg p-4 border border-amber-500/20 cursor-pointer"
                      onClick={() => navigate('/contact')}
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-cream font-medium">Call Us</p>
                          <p className="text-cream/70 text-sm">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="bg-black/30 rounded-lg p-4 border border-amber-500/20 cursor-pointer"
                      onClick={() => navigate('/contact')}
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-cream font-medium">Email Support</p>
                          <p className="text-cream/70 text-sm">support@jeminifoods.com</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="bg-black/30 rounded-lg p-4 border border-amber-500/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-cream font-medium">Live Chat</p>
                          <p className="text-cream/70 text-sm">Available now</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => navigate('/contact')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-black font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Support
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Profile Settings Section */}
          <motion.div variants={itemVariants} className="mt-12">
            <Card className="bg-black/40 border-amber-600/20 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-2">Profile Settings</h2>
                  <p className="text-cream/70">Manage your account information and preferences</p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 min-w-fit"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-amber-400 mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full bg-charcoal/50 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  ) : (
                    <p className="text-cream bg-charcoal/30 px-4 py-3 rounded-lg">
                      {userProfile.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-amber-400 mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-cream bg-charcoal/30 px-4 py-3 rounded-lg opacity-70">
                    {userProfile.email}
                  </p>
                  <p className="text-cream/50 text-xs mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-amber-400 mb-2 block flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-charcoal/50 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  ) : (
                    <p className="text-cream bg-charcoal/30 px-4 py-3 rounded-lg">
                      {userProfile.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-amber-400 mb-2 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Account Type
                  </label>
                  <p className="text-cream bg-charcoal/30 px-4 py-3 rounded-lg">
                    {userProfile.provider === 'google' ? 'Google Account' : 'Email Account'}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-amber-600/20">
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-amber-600 hover:bg-amber-700 text-black font-medium"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>          </motion.div>        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;