import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { useUserAuthOnly } from '../contexts/MultiAuthContext';
import { auth, db, storage } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Clock, 
  Settings, LogOut, Bell, Star, Award, 
  ChefHat, Utensils, Heart, Edit2, Camera,
  CreditCard, Gift, Bookmark, History, ArrowRight,
  MessageSquare, Headphones, HelpCircle, Users,
  Upload, X, Image as ImageIcon, UtensilsCrossed,
  RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { toast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReservationItem } from '../components/dashboard/ReservationItem';
import { PreOrderItem } from '../components/dashboard/PreOrderItem';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import useDashboardData from '../hooks/useDashboardData';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  createdAt: any;
  provider: string;
}

interface Favorite {
  id: string;
  itemId: string;
  itemType: 'menuItem' | 'gallery';
  name: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

const UserDashboard = () => {
  const { user, userProfile, loading, logout } = useUserAuthOnly();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: ''
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("reservations");
  
  // Using our custom dashboard data hook with real-time updates
  const {
    reservations,
    preOrders,
    favorites,
    loading: loadingDashboard,
    refreshing,
    refreshData
  } = useDashboardData(true); // Enable real-time updates for orders/reservations

  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoadingData(true);
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));        if (userDoc.exists()) {
          const profileData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
          // setUserProfile(profileData); // Handled by auth context
          setEditForm({
            fullName: profileData.fullName,
            phone: profileData.phone
          });
        } else {
          // Create a default profile if none exists
          const defaultProfile: UserProfile = {
            id: user.uid,
            fullName: user.displayName || 'User',
            email: user.email || '',
            phone: '',
            profileImage: user.photoURL || null,
            createdAt: new Date(),
            provider: user.providerData[0]?.providerId || 'email'
          };
          // Save the default profile to Firestore
          await setDoc(doc(db, 'users', user.uid), {
            fullName: defaultProfile.fullName,
            email: defaultProfile.email,
            phone: defaultProfile.phone,
            profileImage: defaultProfile.profileImage,
            createdAt: defaultProfile.createdAt,
            provider: defaultProfile.provider          });
          
          // setUserProfile(defaultProfile); // Handled by auth context
          setEditForm({
            fullName: defaultProfile.fullName,
            phone: defaultProfile.phone
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Format date helper function
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get status color helper function
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      confirmed: 'bg-green-500/20 text-green-400 border-green-400/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-400/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      booked: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      taken: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
      making: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      ready: 'bg-green-500/20 text-green-400 border-green-400/30'
    };
    
    return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-400/30';
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: editForm.fullName,
        phone: editForm.phone,
        updatedAt: new Date()      });
      
      // setUserProfile({
      //   ...userProfile,
      //   fullName: editForm.fullName,
      //   phone: editForm.phone
      // }); // Profile updates handled by auth context
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
        variant: "default",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive",
      });
    }
  };
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user || !file) return;
    
    setIsUploadingImage(true);
    
    try {
      // Create a storage reference
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user profile in Firebase Auth
      await updateProfile(user, {
        photoURL: downloadURL
      });
      
      // Update the user profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: downloadURL      });
      
      // setUserProfile({
      //   ...userProfile,
      //   profileImage: downloadURL
      // }); // Profile updates handled by auth context
      toast({
        title: "Image Uploaded",
        description: "Your profile picture has been updated",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Error uploading image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const cardHoverVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };
  if (loading || isLoadingData || loadingDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl text-amber-400 font-serif mb-2">Loading your dashboard...</h2>
          <p className="text-cream/70">Please wait while we prepare your experience</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via useEffect
  }  if (!userProfile) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center">
        <div className="text-center bg-black/40 rounded-lg border border-amber-600/20 p-8 max-w-md">
          <div className="text-amber-400 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl text-amber-400 font-serif mb-4">Setting up your profile...</h2>
          <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream/70">This will only take a moment</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-charcoal via-black to-charcoal">
      {/* Hidden file input for image upload */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
          }
        }} 
      />
      
      {/* Page Title Banner */}
      <div className="bg-black/50 backdrop-blur-sm py-8 border-b border-amber-600/20 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-amber-600/30 ring-4 ring-black/50">
                {userProfile.profileImage ? (
                  <AvatarImage src={userProfile.profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-400">
                    <User className="w-10 h-10 text-black" />
                  </AvatarFallback>
                )}
              </Avatar>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-colors duration-200"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-4 h-4 text-black" />
              </motion.button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-400">
                Welcome, {userProfile.fullName.split(' ')[0]}!
              </h1>
              <p className="text-cream/70 text-lg">Member since {formatDate(userProfile.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
            >
              <Bell className="w-4 h-4 mr-2" />
              <span>Notifications</span>
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Quick Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{reservations.length}</p>
              <p className="text-cream/70 text-sm">Reservations</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{preOrders.length}</p>
              <p className="text-cream/70 text-sm">Pre-Orders</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{favorites.length}</p>
              <p className="text-cream/70 text-sm">Favorites</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content with Tabbed Interface */}
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 border-amber-600/20 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-amber-400">Your Activities</h2>
                
                <Button 
                  onClick={refreshData}
                  variant="outline" 
                  size="sm" 
                  className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span>Refresh</span>
                    </>
                  )}
                </Button>
              </div>
                <Tabs defaultValue="reservations" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="reservations" className="text-lg">
                    <Calendar className="w-4 h-4 mr-2" /> Reservations
                  </TabsTrigger>
                  <TabsTrigger value="preOrders" className="text-lg">
                    <Utensils className="w-4 h-4 mr-2" /> Pre-Orders
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-lg">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="reservations" className="space-y-4 mt-2">
                  {reservations.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-blue-400/30 mx-auto mb-4" />
                      <p className="text-cream/60 text-lg mb-2">You have no reservations yet</p>
                      <p className="text-cream/40 mb-6">Book a table to experience our culinary excellence</p>
                      <Button 
                        onClick={() => navigate('/reservations')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Make a Reservation
                      </Button>
                    </div>
                  ) : (
                    <>
                      {reservations.map((reservation) => (
                        <ReservationItem 
                          key={reservation.id}
                          id={reservation.id}
                          date={reservation.date}
                          time={reservation.time}
                          partySize={reservation.partySize}
                          specialRequests={reservation.specialRequests}
                          status={reservation.status}
                          createdAt={reservation.createdAt}
                          onViewDetails={(id) => navigate(`/reservations?view=${id}`)}
                        />
                      ))}
                      <div className="flex justify-center mt-6">
                        <Button 
                          onClick={() => navigate('/reservations')}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Make a New Reservation
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="preOrders" className="space-y-4 mt-2">
                  {preOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
                      <p className="text-cream/60 text-lg mb-2">You have no pre-orders yet</p>
                      <p className="text-cream/40 mb-6">Order ahead and skip the wait</p>
                      <Button 
                        onClick={() => navigate('/pre-orders')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Start Pre-Ordering
                      </Button>
                    </div>
                  ) : (
                    <>
                      {preOrders.map((order) => (                        <PreOrderItem 
                          key={order.id}
                          id={order.id}
                          items={order.items}
                          total={order.total}
                          status={order.status}
                          date={order.date}
                          time={order.time}
                          createdAt={order.createdAt}
                          assignedChef={order.assignedChef}
                          estimatedReadyTime={order.estimatedReadyTime}
                          onRefresh={refreshData}
                          isRefreshing={refreshing}
                        />
                      ))}
                      <div className="flex justify-center mt-6">
                        <Button 
                          onClick={() => navigate('/pre-orders')}
                          variant="outline"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <Utensils className="w-4 h-4 mr-2" />
                          Place a New Pre-Order
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6 mt-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-amber-400 mb-4">Account Settings</h3>
                      <NotificationSettings />
                    </div>
                    
                    <div className="bg-black/30 border border-amber-600/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-cream mb-4">Profile Information</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-cream/70 text-sm mb-1">Full Name</label>
                            <p className="text-cream">{userProfile?.fullName || 'Not set'}</p>
                          </div>
                          <div>
                            <label className="block text-cream/70 text-sm mb-1">Email</label>
                            <p className="text-cream">{userProfile?.email}</p>
                          </div>
                          <div>
                            <label className="block text-cream/70 text-sm mb-1">Phone</label>
                            <p className="text-cream">{userProfile?.phone || 'Not set'}</p>
                          </div>
                          <div>
                            <label className="block text-cream/70 text-sm mb-1">Member Since</label>
                            <p className="text-cream">
                              {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-amber-600/20">
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>

          {/* Favorites Section */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-purple-400">Your Favorites</h3>
                    <p className="text-cream/70 text-sm">Items you've saved</p>
                  </div>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
                  {favorites.length} {favorites.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>
              
              <div className="space-y-4 mb-6">
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                    <p className="text-cream/60">No favorites yet</p>
                    <p className="text-cream/40 text-sm">Save menu items or gallery content</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((favorite) => (
                      <div 
                        key={favorite.id} 
                        className="bg-black/30 rounded-lg p-3 border border-purple-500/20 flex gap-3 cursor-pointer"
                        onClick={() => navigate(
                          favorite.itemType === 'menuItem' 
                            ? `/menu?item=${favorite.itemId}` 
                            : `/gallery?view=${favorite.itemId}`
                        )}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={favorite.imageUrl} 
                            alt={favorite.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-cream font-medium truncate">{favorite.name}</p>
                            <Badge className={
                              favorite.itemType === 'menuItem' 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-400/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                            }>
                              {favorite.itemType === 'menuItem' ? 'Menu' : 'Gallery'}
                            </Badge>
                          </div>
                          <p className="text-cream/70 text-xs line-clamp-2 mt-1">{favorite.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => navigate('/menu')}
                  variant="outline"
                  className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Browse Menu
                </Button>
                <Button 
                  onClick={() => navigate('/gallery')}
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  View Gallery
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;