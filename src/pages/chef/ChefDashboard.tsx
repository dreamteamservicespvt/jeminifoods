import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Clock, 
  Package, 
  CheckCircle, 
  LogOut, 
  User, 
  Mail, 
  Phone,
  RefreshCw,
  TrendingUp,
  Bell,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { OrderTracker } from '@/components/ui/OrderTracker';
import type { OrderStatus } from '@/components/ui/OrderTracker';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useChefNotifications } from '../../hooks/useNotificationActions';

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
  phone: string;
  date: string;
  time: string;
  items: CartItem[];
  status?: OrderStatus;
  specialRequests?: string;
  createdAt: any;
  total: number;
  orderId?: string;
  estimatedPickupTime?: string;
  assignedChef?: string;
  chefName?: string;
  userId?: string;
  timestamps?: {
    booked?: string;
    taken?: string;
    making?: string;
    ready?: string;
  };
}

interface ChefProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty?: string;
}

const ChefDashboard = () => {
  const { adminUser: user, loading, logoutAdmin } = useAdminAuth();
  const [chefProfile, setChefProfile] = useState<ChefProfile | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<PreOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PreOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { sendOrderStatusUpdated } = useChefNotifications();

  // Sound notification for new orders
  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/notification.mp3'); // Add a notification sound file
      audio.play().catch(() => {}); // Fail silently if no sound file
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Fetch chef profile
  useEffect(() => {
    if (!user) return;

    const fetchChefProfile = async () => {
      try {
        const chefDoc = await getDoc(doc(db, 'chefs', user.uid));
        if (chefDoc.exists()) {
          setChefProfile({ id: chefDoc.id, ...chefDoc.data() } as ChefProfile);
        } else {
          // Not a chef, redirect to login
          navigate('/chef/login');
        }
      } catch (error) {
        console.error('Error fetching chef profile:', error);
        navigate('/chef/login');
      }
    };

    fetchChefProfile();
  }, [user, navigate]);

  // Fetch assigned orders
  useEffect(() => {
    if (!user || !chefProfile) return;

    const q = query(
      collection(db, 'preOrders'),
      where('assignedChef', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PreOrder[];
      
      // Check for new orders and play notification
      const currentOrderIds = assignedOrders.map(o => o.id);
      const newOrders = orders.filter(o => !currentOrderIds.includes(o.id));
      
      if (newOrders.length > 0 && assignedOrders.length > 0) {
        playNotificationSound();
        toast({
          title: "New Order Assigned!",
          description: `${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} assigned to you.`,
        });
      }
      
      setAssignedOrders(orders);
      setFilteredOrders(orders);
      setLastRefresh(new Date());
    });

    return unsubscribe;
  }, [user, chefProfile, soundEnabled]);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(assignedOrders);
    } else {
      setFilteredOrders(assignedOrders.filter(order => order.status === statusFilter));
    }
  }, [assignedOrders, statusFilter]);

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(orderId);
    try {
      const order = assignedOrders.find(o => o.id === orderId);
      if (!order) return;

      const now = new Date().toLocaleString();
      
      await updateDoc(doc(db, 'preOrders', orderId), {
        status: newStatus,
        timestamps: {
          ...order?.timestamps,
          [newStatus]: now
        }
      });

      // Send notification to customer about status update
      await sendOrderStatusUpdated(
        order.userId || 'guest',
        {
          id: orderId,
          orderId: order.orderId || '',
          status: newStatus,
          userName: order.name,
          userPhone: order.phone,
          pickupDate: order.date,
          pickupTime: order.time,
          chefName: chefProfile?.name || 'Our chef'
        }
      );
      
      // Enhanced toast notifications with status-specific messages
      const statusMessages = {
        making: `Started preparing order ${order?.orderId}. Customer has been notified.`,
        ready: `Order ${order?.orderId} is ready for pickup! Customer has been notified.`,
        taken: `Order ${order?.orderId} has been taken.`
      };
      
      toast({
        title: "Status Updated Successfully!",
        description: statusMessages[newStatus] || `Order status updated to ${newStatus}.`,
      });

      // Play success sound
      if (soundEnabled) {
        const audio = new Audio('/success.mp3');
        audio.play().catch(() => {});
      }

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Enhanced refresh with loading state
  const handleRefresh = async () => {
    setRefreshing(true);
    setLastRefresh(new Date());
    toast({
      title: "Refreshing Orders",
      description: "Checking for new orders and updates...",
    });
    
    // The real-time listeners will automatically update the data
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Orders Refreshed",
        description: "Your dashboard is now up to date.",
      });
    }, 1500);
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await logoutAdmin();
      navigate('/chef/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Calculate statistics
  const stats = {
    total: assignedOrders.length,
    taken: assignedOrders.filter(o => o.status === 'taken').length,
    making: assignedOrders.filter(o => o.status === 'making').length,
    ready: assignedOrders.filter(o => o.status === 'ready').length,
  };

  // Status counts for filter badges
  const statusCounts = {
    all: assignedOrders.length,
    taken: assignedOrders.filter(o => o.status === 'taken').length,
    making: assignedOrders.filter(o => o.status === 'making').length,
    ready: assignedOrders.filter(o => o.status === 'ready').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <p className="text-cream/60">Loading chef dashboard...</p>
        </div>
      </div>
    );
  }

  if (!chefProfile) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal">
      {/* Header */}
      <header className="bg-black/50 border-b border-amber-600/20 p-4 md:p-6 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-amber-400 p-1"
              >
                {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600/20 rounded-full">
                <ChefHat className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-400">
                  Chef Dashboard
                </h1>
                <p className="text-cream/60 text-sm">Welcome back, {chefProfile.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs text-cream/60">
                {autoRefresh ? 'Live' : 'Manual'}
              </span>
            </div>
            
            {/* Last refresh time */}
            <div className="hidden md:block text-xs text-cream/40">
              Updated: {lastRefresh.toLocaleTimeString()}
            </div>
            
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-cream/60 hover:text-cream"
              title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
            >
              <Bell className={`w-4 h-4 ${soundEnabled ? 'text-amber-400' : 'text-gray-400'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-cream/60 hover:text-cream"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <LogOut className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`${
          isMobile 
            ? `fixed top-[73px] left-0 bottom-0 z-20 w-[80%] max-w-[300px] transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-80 min-h-[calc(100vh-89px)] sticky top-[89px]'
        } bg-black/30 border-r border-amber-600/20 p-4 md:p-6 overflow-y-auto`}>
          {/* Chef Profile */}
          <Card className="bg-black/40 border-amber-600/20 p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-600/20 rounded-full">
                <ChefHat className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cream">{chefProfile.name}</h3>
                {chefProfile.specialty && (
                  <p className="text-cream/60 text-sm">{chefProfile.specialty}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-cream/60">
                <Mail className="w-4 h-4" />
                <span>{chefProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-cream/60">
                <Phone className="w-4 h-4" />
                <span>{chefProfile.phone}</span>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <Card className="bg-black/40 border-blue-600/20 p-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-semibold">{stats.total}</p>
                  <p className="text-cream/60 text-xs">Total Orders</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-black/40 border-amber-600/20 p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-amber-400 font-semibold">{stats.taken}</p>
                  <p className="text-cream/60 text-xs">Taken</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-black/40 border-purple-600/20 p-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-semibold">{stats.making}</p>
                  <p className="text-cream/60 text-xs">Making</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-black/40 border-green-600/20 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold">{stats.ready}</p>
                  <p className="text-cream/60 text-xs">Ready</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <h3 className="text-cream font-medium mb-3">Filter by Status</h3>
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`w-full justify-between ${
                  statusFilter === status 
                    ? "bg-amber-600 text-black" 
                    : "text-cream hover:bg-amber-600/20"
                }`}
              >
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-cream">My Orders</h2>
                <p className="text-cream/60">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} 
                  {statusFilter !== 'all' && ` with status: ${statusFilter}`}
                </p>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <Card className="bg-black/40 border-amber-600/20 p-8 text-center">
                <Package className="w-16 h-16 text-cream/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-cream mb-2">No Orders Found</h3>
                <p className="text-cream/60">
                  {statusFilter === 'all' 
                    ? "You don't have any assigned orders yet." 
                    : `No orders with status: ${statusFilter}`
                  }
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => {
                  const statusColor = {
                    taken: 'border-blue-400/30 bg-blue-600/5',
                    making: 'border-purple-400/30 bg-purple-600/5',
                    ready: 'border-green-400/30 bg-green-600/5'
                  }[order.status || 'taken'] || 'border-amber-600/20 bg-black/40';

                  const urgencyLevel = new Date(order.date + ' ' + order.time).getTime() - Date.now();
                  const isUrgent = urgencyLevel < 3600000; // Less than 1 hour
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${statusColor} border rounded-lg p-6 ${
                        isUrgent ? 'ring-2 ring-red-400/50 animate-pulse' : ''
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-cream">{order.name}</h3>
                          {order.orderId && (
                            <Badge className="bg-amber-600/20 text-amber-400">
                              #{order.orderId}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-cream/60">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {order.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Pickup: {order.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Tracker */}
                    <div className="mb-6">
                      <OrderTracker
                        currentStatus={order.status || 'taken'}
                        orderId={order.orderId}
                        chefName={chefProfile.name}
                        timestamps={order.timestamps}
                        isEditable={true}
                        onStatusChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                        variant="default"
                        showTimestamps={true}
                        showDescription={true}
                      />
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-cream mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-black/20 rounded">
                            <div>
                              <span className="text-cream font-medium">{item.name}</span>
                              <span className="text-cream/60 ml-2">×{item.quantity}</span>
                              {item.specialInstructions && (
                                <p className="text-xs text-amber-400 mt-1">
                                  🍳 Note: {item.specialInstructions}
                                </p>
                              )}
                            </div>
                            <span className="text-cream font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-amber-600/10 rounded font-semibold">
                          <span className="text-cream">Total</span>
                          <span className="text-cream">₹{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {order.specialRequests && (
                      <div className="mb-4">
                        <h4 className="font-medium text-cream mb-2">Special Requests</h4>
                        <p className="text-cream/80 p-3 bg-black/20 rounded">
                          {order.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-3 pt-4 border-t border-amber-600/20">
                      {order.status === 'taken' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'making')}
                          disabled={actionLoading === order.id}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          Start Making
                        </Button>
                      )}
                      
                      {order.status === 'making' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          disabled={actionLoading === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChefDashboard;
