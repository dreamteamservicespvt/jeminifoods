import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderTracker, type OrderStatus } from '../components/ui/OrderTracker';
import { 
  Clock, 
  ChefHat, 
  Package, 
  CheckCircle2, 
  RefreshCw, 
  ShoppingBag,
  Calendar,
  User,
  ArrowRight,
  Star,
  Utensils,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface PreOrder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  items: CartItem[];
  status?: string;
  specialRequests?: string;
  createdAt: any;
  total: number;
  orderId?: string;
  estimatedPickupTime?: string;
  paymentStatus?: 'pending' | 'completed';
  paymentScreenshotUrl?: string;
  paymentMethod?: 'upi' | 'qr';
  assignedChef?: string;
  userId?: string;
}

const statusConfig = {
  pending: { 
    label: 'Order Placed', 
    icon: ShoppingBag, 
    color: 'bg-amber-500',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Your order has been received and is awaiting confirmation'
  },
  booked: { 
    label: 'Confirmed', 
    icon: CheckCircle2, 
    color: 'bg-blue-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Your order has been confirmed and is in queue'
  },
  taken: { 
    label: 'Chef Assigned', 
    icon: User, 
    color: 'bg-purple-500',
    textColor: 'text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'A chef has been assigned and will start preparing your order'
  },
  making: { 
    label: 'Preparing', 
    icon: ChefHat, 
    color: 'bg-orange-500',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Your order is being freshly prepared by our chef'
  },
  ready: { 
    label: 'Ready for Pickup', 
    icon: Package, 
    color: 'bg-green-500',
    textColor: 'text-green-800',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Your order is ready! Please visit us for pickup'
  },
  completed: { 
    label: 'Completed', 
    icon: CheckCircle2, 
    color: 'bg-gray-500',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Order completed successfully. Thank you!'
  },
  rejected: { 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'bg-red-500',
    textColor: 'text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Order was cancelled. Please contact us for more information'
  }
};

const StepTracker: React.FC<{ currentStatus: string; orderId: string }> = ({ currentStatus, orderId }) => {
  const steps = ['pending', 'booked', 'taken', 'making', 'ready'] as const;
  const currentIndex = steps.indexOf(currentStatus as any);
  
  // If status is not in our steps (like 'completed' or 'rejected'), show all steps as completed for 'completed'
  const adjustedIndex = currentStatus === 'completed' ? steps.length - 1 : 
                       currentStatus === 'rejected' ? -1 : currentIndex;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Order Progress</h4>
        <span className="text-xs text-gray-500">#{orderId?.slice(-6).toUpperCase()}</span>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        {steps.map((step, index) => {
          const isActive = index <= adjustedIndex;
          const isCurrent = index === adjustedIndex;
          const config = statusConfig[step];
          const Icon = config.icon;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative group">
                <motion.div 
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${isActive 
                      ? `${config.color} border-transparent text-white shadow-lg` 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-opacity-30 ring-current scale-110' : ''}
                    ${currentStatus === 'rejected' ? 'bg-red-500 text-white border-transparent' : ''}
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: isCurrent ? 1.1 : 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
                
                {/* Tooltip */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {config.label}
                  </div>
                </div>
                
                <span className={`text-xs mt-1 font-medium hidden sm:block ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {config.label.split(' ')[0]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <motion.div 
                  className={`
                    flex-1 h-0.5 mx-1 transition-all duration-500
                    ${index < adjustedIndex ? config.color : 'bg-gray-200'}
                  `}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: index < adjustedIndex ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Current Status Description */}
      <motion.div 
        className={`mt-4 p-3 rounded-lg text-sm ${statusConfig[currentStatus as keyof typeof statusConfig]?.bgColor || 'bg-gray-50'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className={`font-medium ${statusConfig[currentStatus as keyof typeof statusConfig]?.textColor || 'text-gray-800'}`}>
          {statusConfig[currentStatus as keyof typeof statusConfig]?.description || 'Status update pending'}
        </p>
      </motion.div>
    </div>
  );
};

const OrderCard: React.FC<{ order: PreOrder }> = ({ order }) => {
  const status = order.status || 'pending';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
  
  // Get chef name from assigned chef email
  const getChefName = (email: string) => {
    const chefMap: Record<string, string> = {
      'marco@jemini.com': 'Chef Marco Rodriguez',
      'sarah@jemini.com': 'Chef Sarah Kim',
      'david@jemini.com': 'Chef David Thompson',
      'maria@jemini.com': 'Chef Maria Santos'
    };
    return chefMap[email] || email;
  };

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className={`overflow-hidden ${config.borderColor} border-2 hover:shadow-xl transition-all duration-300 group bg-white`}>
        <CardHeader className="pb-4 bg-gradient-to-r from-cream to-cream/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-serif text-charcoal group-hover:text-amber-600 transition-colors">
                Order #{order.orderId || order.id.slice(-6).toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-charcoal/70">
                <Calendar className="w-4 h-4" />
                <span>{orderDate.toLocaleDateString()} at {order.time}</span>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`${config.bgColor} ${config.textColor} border-none font-medium px-3 py-1`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Step Tracker */}
          <div className="bg-gray-50 rounded-lg p-4">
            <StepTracker currentStatus={status} orderId={order.orderId || order.id} />
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-charcoal flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              Order Items ({totalItems} items)
            </h4>
            <div className="bg-cream/30 rounded-lg p-4 space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-amber-600/10 last:border-0">
                  <div>
                    <span className="font-medium text-charcoal">{item.name}</span>
                    {item.specialInstructions && (
                      <p className="text-xs text-charcoal/60 italic mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-charcoal">{item.quantity} × ₹{item.price.toFixed(2)}</p>
                    <p className="text-sm text-amber-600 font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t-2 border-amber-600/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-charcoal">Total:</span>
                  <span className="font-bold text-lg text-amber-600">₹{order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-charcoal/70">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">Customer:</span>
              </div>
              <p className="text-charcoal ml-6">{order.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-charcoal/70">
                <Mail className="w-4 h-4 mr-2" />
                <span className="font-medium">Email:</span>
              </div>
              <p className="text-charcoal ml-6 text-xs sm:text-sm break-all">{order.email}</p>
            </div>

            {order.phone && (
              <div className="space-y-2">
                <div className="flex items-center text-charcoal/70">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-medium">Phone:</span>
                </div>
                <p className="text-charcoal ml-6">{order.phone}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center text-charcoal/70">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-medium">Pickup Date:</span>
              </div>
              <p className="text-charcoal ml-6">{order.date}</p>
            </div>

            {order.assignedChef && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center text-charcoal/70">
                  <ChefHat className="w-4 h-4 mr-2" />
                  <span className="font-medium">Assigned Chef:</span>
                </div>
                <p className="text-charcoal ml-6 font-medium">{getChefName(order.assignedChef)}</p>
              </div>
            )}

            {order.specialRequests && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center text-charcoal/70">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="font-medium">Special Requests:</span>
                </div>
                <p className="text-charcoal ml-6 italic bg-amber-50 p-2 rounded">{order.specialRequests}</p>
              </div>
            )}

            {order.estimatedPickupTime && (status === 'making' || status === 'ready') && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center text-charcoal/70">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">Estimated Ready Time:</span>
                </div>
                <p className="text-charcoal ml-6 font-bold text-lg text-green-600">{order.estimatedPickupTime}</p>
              </div>
            )}

            {/* Payment Status */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center text-charcoal/70">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-medium">Payment Status:</span>
              </div>
              <div className="ml-6">
                <Badge 
                  variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}
                  className={order.paymentStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-800'}
                >
                  {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                </Badge>
                {order.paymentMethod && (
                  <span className="ml-2 text-xs text-charcoal/60">via {order.paymentMethod.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {status === 'ready' && (
            <motion.div 
              className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">Your order is ready!</p>
                  <p className="text-sm text-green-700">Please visit us for pickup at your scheduled time.</p>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open('tel:+15551234567')}
                >
                  Call Restaurant
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-700">Please contact us for more information or to place a new order.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EmptyState: React.FC<{ type: 'active' | 'completed' }> = ({ type }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="text-center py-20 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200"
        >
          {type === 'active' ? (
            <Clock className="w-16 h-16 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          )}
        </motion.div>
        
        <motion.h3 
          className="text-3xl font-serif text-charcoal mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {type === 'active' ? 'No Active Orders' : 'No Completed Orders'}
        </motion.h3>
        
        <motion.p 
          className="text-charcoal/70 mb-10 text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {type === 'active' 
            ? "Ready to embark on a culinary adventure? Explore our exquisite menu and place your first order."
            : "Your culinary journey awaits! Complete your first order to see it here."
          }
        </motion.p>
        
        {type === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-4"
          >
            <Button 
              onClick={() => navigate('/pre-orders')}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium px-8 py-4 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Ordering
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/menu')}
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                Browse Menu
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/reservations')}
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                Make Reservation
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const MyOrders: React.FC = () => {
  const { user } = useUserAuth();
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeOrders = orders.filter(order => 
    ['pending', 'booked', 'taken', 'making', 'ready'].includes(order.status || 'pending')
  );
  const completedOrders = orders.filter(order => 
    ['completed', 'rejected'].includes(order.status || 'pending')
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersQuery = query(
      collection(db, 'preOrders'),
      where('email', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PreOrder[];
        
        setOrders(ordersData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Small delay to show the refresh animation
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-amber-200">
            <CardContent className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-amber-600" />
              </motion.div>
              <h2 className="text-2xl font-serif text-charcoal mb-4">Sign In Required</h2>
              <p className="text-charcoal/70 mb-8">Please sign in to view and track your orders</p>
              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="block">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-50">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-charcoal/70 font-medium text-lg">Loading your culinary journey...</p>
          <p className="text-charcoal/50 text-sm mt-2">Fetching your order history</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-charcoal to-charcoal/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 mb-4">
              My Culinary Orders
            </h1>
            <div className="w-32 h-0.5 bg-amber-400 mx-auto mb-6"></div>
            <p className="text-xl text-cream/90 max-w-2xl mx-auto">
              Track your exquisite dining experiences from kitchen to table
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/95 backdrop-blur border-amber-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-charcoal">{activeOrders.length}</p>
                <p className="text-charcoal/70">Active Orders</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur border-amber-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-charcoal">{completedOrders.length}</p>
                <p className="text-charcoal/70">Completed</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur border-amber-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-charcoal">{orders.length}</p>
                <p className="text-charcoal/70">Total Orders</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Action Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div>
            <h2 className="text-2xl font-serif text-charcoal mb-2">Order History</h2>
            <p className="text-charcoal/70">Monitor your orders in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/pre-orders">
              <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Order More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-white border border-amber-200">
              <TabsTrigger value="active" className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <Clock className="w-4 h-4" />
                Active Orders
                {activeOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    {activeOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <CheckCircle2 className="w-4 h-4" />
                Completed
                {completedOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    {completedOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <Separator className="my-6" />

            <TabsContent value="active" className="space-y-6">
              <AnimatePresence>
                {activeOrders.length === 0 ? (
                  <EmptyState type="active" />
                ) : (
                  <motion.div 
                    className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {activeOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <AnimatePresence>
                {completedOrders.length === 0 ? (
                  <EmptyState type="completed" />
                ) : (
                  <motion.div 
                    className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {completedOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
