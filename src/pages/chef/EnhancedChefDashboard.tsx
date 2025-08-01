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
  doc 
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
import { OrderTracker } from '@/components/ui/OrderTracker';
import type { OrderStatus } from '@/components/ui/OrderTracker';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useChefNotifications } from '@/hooks/useOrderNotifications';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/enhanced-toast-helpers';

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
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  reservationId?: string;
  reservationTime?: string;
  status: 'new' | 'assigned' | 'making' | 'ready' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: any;
  updatedAt?: any;
  specialInstructions?: string;
}

// Helper function to map PreOrder status to OrderTracker status
const getOrderStatusMapping = (status: PreOrder['status']): OrderStatus => {
  switch (status) {
    case 'new': return 'pending';
    case 'assigned': return 'booked';
    case 'making': return 'making';
    case 'ready': return 'ready';
    case 'completed': return 'completed';
    case 'cancelled': return 'pending';
    default: return 'pending';
  }
};

const ChefDashboard = () => {
  const { adminUser, loading, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'my-orders' | 'all'>('new');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(true);
  const [orderCount, setOrderCount] = useState({
    new: 0,
    assigned: 0,
    making: 0,
    ready: 0,
    completed: 0
  });
  
  const { notifyChefAssigned, notifyOrderStatusUpdate } = useChefNotifications();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/chef/login');
    }
  }, [loading, adminUser, navigate]);

  // Listen for orders in real-time
  useEffect(() => {
    if (!adminUser) return;
    
    const q = query(
      collection(db, 'preorders'),
      orderBy('createdAt', 'desc')
    );
    
    setIsLoading(true);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PreOrder[];
      
      setOrders(orderData);
      
      // Update counts
      setOrderCount({
        new: orderData.filter(order => order.status === 'new').length,
        assigned: orderData.filter(order => order.status === 'assigned' && order.assignedTo === adminUser.uid).length,
        making: orderData.filter(order => order.status === 'making' && order.assignedTo === adminUser.uid).length,
        ready: orderData.filter(order => order.status === 'ready' && order.assignedTo === adminUser.uid).length,
        completed: orderData.filter(order => order.status === 'completed' && order.assignedTo === adminUser.uid).length
      });
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [adminUser]);

  // Filter orders based on tab
  const filteredOrders = React.useMemo(() => {
    if (!adminUser) return [];
    
    switch (activeTab) {
      case 'new':
        return orders.filter(order => order.status === 'new');
      case 'my-orders':
        return orders.filter(order => order.assignedTo === adminUser.uid && order.status !== 'completed');
      case 'all':
      default:
        return orders;
    }
  }, [orders, activeTab, adminUser]);

  // Assign order to self
  const assignToSelf = async (orderId: string) => {
    if (!adminUser) return;
    
    try {
      const orderRef = doc(db, 'preorders', orderId);
      const orderToUpdate = orders.find(o => o.id === orderId);
      
      if (!orderToUpdate) {
        showErrorToast({
          title: "Error",
          message: "Order not found",
          duration: 3000
        });
        return;
      }
      
      // Update in Firestore
      await updateDoc(orderRef, {
        status: 'assigned',
        assignedTo: adminUser.uid,
        assignedToName: adminUser.displayName || 'Chef',
        updatedAt: new Date()
      });
      
      // Send notification to customer
      if (orderToUpdate.userId) {
        await notifyChefAssigned(
          orderToUpdate.userId,
          {
            id: orderId,
            orderId: orderId,
            chefName: adminUser.displayName || 'Chef'
          }
        );
      }
      
      showSuccessToast({
        title: "Order Assigned",
        message: "You have successfully claimed this order",
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error assigning order:', error);
      showErrorToast({
        title: "Error",
        message: "Failed to assign order",
        duration: 3000
      });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!adminUser) return;
    
    try {
      const orderRef = doc(db, 'preorders', orderId);
      const orderToUpdate = orders.find(o => o.id === orderId);
      
      if (!orderToUpdate) {
        showErrorToast({
          title: "Error",
          message: "Order not found",
          duration: 3000
        });
        return;
      }
      
      // Update in Firestore
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date()
      });
      
      // Send notification to customer
      if (orderToUpdate.userId) {
        await notifyOrderStatusUpdate(
          orderToUpdate.userId,
          {
            id: orderId,
            orderId: orderId,
            status
          }
        );
      }
      
      showSuccessToast({
        title: "Status Updated",
        message: `Order status updated to ${status}`,
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      showErrorToast({
        title: "Error",
        message: "Failed to update order status",
        duration: 3000
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    showInfoToast({
      title: "Logging Out",
      message: "You are being logged out",
      duration: 2000
    });
    setTimeout(() => {
      logoutAdmin();
      navigate('/chef/login');
    }, 1000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-cream">
        <div className="flex flex-col items-center">
          <ChefHat size={40} className="text-amber-400 animate-pulse mb-4" />
          <p>Loading chef dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!adminUser) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-950 text-cream flex">
      {/* Mobile menu toggle */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-50 bg-amber-600 text-black p-2 rounded-full"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? '100%' : '300px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`bg-black/80 backdrop-blur-sm ${isMobile ? 'fixed inset-0 z-40' : 'relative'}`}
          >
            <div className={`h-full p-6 flex flex-col ${isMobile ? 'pt-16' : ''}`}>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <ChefHat size={32} className="text-amber-400" />
                <div>
                  <h2 className="text-xl font-serif font-medium text-amber-400">
                    Chef Dashboard
                  </h2>
                  <p className="text-sm text-cream/70">
                    Welcome, {adminUser.displayName || 'Chef'}
                  </p>
                </div>
              </div>
              
              {/* Nav items */}
              <nav className="flex-1">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('new');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'new' 
                        ? 'bg-amber-900/40 text-amber-300' 
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <Package size={20} />
                    <span>New Orders</span>
                    {orderCount.new > 0 && (
                      <Badge className="ml-auto bg-amber-600 hover:bg-amber-600">
                        {orderCount.new}
                      </Badge>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('my-orders');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'my-orders' 
                        ? 'bg-amber-900/40 text-amber-300' 
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <ChefHat size={20} />
                    <span>My Orders</span>
                    {(orderCount.assigned + orderCount.making + orderCount.ready) > 0 && (
                      <Badge className="ml-auto bg-green-600 hover:bg-green-600">
                        {orderCount.assigned + orderCount.making + orderCount.ready}
                      </Badge>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'all' 
                        ? 'bg-amber-900/40 text-amber-300' 
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <TrendingUp size={20} />
                    <span>All Orders</span>
                  </button>
                </div>
              </nav>
              
              {/* User and Logout */}
              <div className="mt-auto">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 justify-start px-4"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 p-6 ${isMobile && isSidebarOpen ? 'hidden' : ''}`}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-serif font-medium text-amber-400">
              {activeTab === 'new' ? 'New Orders' :
               activeTab === 'my-orders' ? 'My Orders' : 'All Orders'}
            </h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-cream/70">
                <RefreshCw size={14} className="text-amber-500" />
                <span className="text-sm">Live Updates</span>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-amber-700 text-amber-500 hover:text-amber-400"
              >
                <Bell size={16} className="mr-2" />
                <span>Notifications</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw size={32} className="text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-cream/70">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-black/30 rounded-xl border border-amber-900/20">
              <Package size={48} className="text-amber-500/50 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-amber-400 mb-2">No Orders</h2>
              <p className="text-cream/70">
                {activeTab === 'new' ? 'There are no new orders waiting to be assigned.' :
                 activeTab === 'my-orders' ? 'You don\'t have any active orders.' :
                 'There are no orders in the system.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                assignToSelf={assignToSelf}
                updateStatus={updateOrderStatus}
                isAssignedToMe={adminUser.uid === order.assignedTo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: PreOrder;
  assignToSelf: (orderId: string) => void;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  isAssignedToMe: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  assignToSelf, 
  updateStatus, 
  isAssignedToMe 
}) => {
  // Convert status to color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'assigned': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'making': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  // Get formatted date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get appropriate next status based on current status
  const getNextStatus = (): { status: OrderStatus, label: string, color: string } => {
    switch (order.status) {
      case 'new':
      case 'assigned':
        return { status: 'making', label: 'Start Preparing', color: 'bg-amber-600 hover:bg-amber-500' };
      case 'making':
        return { status: 'ready', label: 'Mark as Ready', color: 'bg-green-600 hover:bg-green-500' };
      case 'ready':
        return { status: 'completed', label: 'Complete Order', color: 'bg-purple-600 hover:bg-purple-500' };
      default:
        return { status: 'completed', label: 'Completed', color: 'bg-gray-600 hover:bg-gray-500' };
    }
  };
  
  const nextStatusAction = getNextStatus();
  
  return (
    <Card className="bg-black/40 border-amber-900/20 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Order info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-cream/70">
                Order #{order.id.slice(-5)}
              </span>
              <span className="text-sm text-cream/70 flex items-center gap-1">
                <Clock size={14} className="text-amber-500" />
                {formatTime(order.createdAt)} on {formatDate(order.createdAt)}
              </span>
            </div>
            
            <h3 className="text-xl font-serif text-amber-400 mb-2">
              Order for {order.name}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-4">
              <div className="flex items-center gap-2 text-cream">
                <Mail size={14} className="text-amber-500" />
                {order.email}
              </div>
              
              <div className="flex items-center gap-2 text-cream">
                <Phone size={14} className="text-amber-500" />
                {order.phone}
              </div>
              
              {order.reservationTime && (
                <div className="flex items-center gap-2 text-cream">
                  <Clock size={14} className="text-amber-500" />
                  Reservation: {order.reservationTime}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-cream">
                <User size={14} className="text-amber-500" />
                {order.userId ? 'Registered user' : 'Guest'}
              </div>
            </div>
            
            {/* Order items */}
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-black/30 p-3 rounded border border-amber-900/10 flex justify-between"
                >
                  <div>
                    <span className="text-cream font-medium">{item.quantity}× {item.name}</span>
                    {item.specialInstructions && (
                      <p className="text-sm text-cream/70 mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <span className="text-amber-400">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Special instructions */}
            {order.specialInstructions && (
              <div className="mt-4 bg-black/30 p-3 rounded border border-amber-900/20">
                <p className="text-xs font-medium text-amber-400 mb-1">Special Instructions:</p>
                <p className="text-sm text-cream">{order.specialInstructions}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3 md:min-w-[200px] md:items-end">
            <div className="p-4 bg-black/30 rounded-lg border border-amber-900/20 text-center w-full">
              <p className="text-xs font-medium text-amber-400 mb-1">Total Amount</p>
              <p className="text-2xl font-serif text-amber-400">${order.totalAmount.toFixed(2)}</p>
            </div>
            
            {order.status === 'new' ? (
              <Button
                onClick={() => assignToSelf(order.id)}
                className="bg-amber-600 hover:bg-amber-500 text-black w-full"
              >
                <ChefHat size={16} className="mr-2" />
                Assign to Myself
              </Button>
            ) : (
              <>
                {order.status !== 'completed' && isAssignedToMe && (
                  <Button
                    onClick={() => updateStatus(order.id, nextStatusAction.status)}
                    className={`${nextStatusAction.color} text-black w-full`}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    {nextStatusAction.label}
                  </Button>
                )}
                
                {/* Order tracker */}
                <div className="w-full mt-3">
                  <OrderTracker 
                    currentStatus={getOrderStatusMapping(order.status)}
                    orderId={order.id}
                    variant="compact"
                    showTimestamps={false}
                  />
                </div>
                
                {/* Chef info if assigned */}
                {order.assignedToName && (
                  <div className="text-sm text-cream/70 mt-2 flex items-center justify-center gap-2">
                    <ChefHat size={14} />
                    <span>Chef: {order.assignedToName}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChefDashboard;
