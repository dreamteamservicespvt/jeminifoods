import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { 
  ChefHat, Clock, Check, AlertCircle, Users, 
  Package, Utensils, RefreshCw, Timer, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { OrderTracker } from '@/components/ui/OrderTracker';

interface PreOrder {
  id: string;
  items: any[];
  total: number;
  status: 'booked' | 'taken' | 'making' | 'ready' | 'completed';
  pickupDate: string;
  pickupTime: string;
  createdAt: any;
  assignedChef?: string;
  estimatedReadyTime?: string;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

const ChefDashboard = () => {
  const { adminUser: user } = useAdminAuth();
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch orders assigned to this chef
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'preOrders'),
      where('assignedChef', '==', user.email),
      where('status', 'in', ['taken', 'making']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PreOrder[];
      
      setOrders(orderData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: 'taken' | 'making' | 'ready') => {
    if (!orderId) return;

    setUpdatingOrderId(orderId);
    
    try {
      const updateData: any = { status: newStatus };
      
      // Add estimated ready time when marking as ready
      if (newStatus === 'ready') {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15); // Add 15 minutes as ready time
        updateData.estimatedReadyTime = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      await updateDoc(doc(db, 'preOrders', orderId), updateData);
      
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'taken': return 'making';
      case 'making': return 'ready';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'taken': return 'Start Cooking';
      case 'making': return 'Mark Ready';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'making': return 'bg-amber-500/20 text-amber-400 border-amber-500';
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl text-amber-400 font-serif">Loading your orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-400">
                Chef Dashboard
              </h1>
              <p className="text-cream/70">Manage your assigned orders</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">
                  {orders.filter(o => o.status === 'taken').length}
                </div>
                <div className="text-sm text-cream/60">Orders Taken</div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <Utensils className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-400">
                  {orders.filter(o => o.status === 'making').length}
                </div>
                <div className="text-sm text-cream/60">In Progress</div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-green-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">
                  {orders.length}
                </div>
                <div className="text-sm text-cream/60">Total Active</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-cream mb-4">Active Orders</h2>
          
          {orders.length === 0 ? (
            <Card className="bg-black/40 border-amber-600/20">
              <CardContent className="p-8 text-center">
                <ChefHat className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
                <h3 className="text-xl text-cream mb-2">No active orders</h3>
                <p className="text-cream/60">You don't have any orders assigned at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-black/60 to-black/40 border-amber-600/20 overflow-hidden">
                    <div className={`h-1 w-full ${
                      order.status === 'making' ? 'bg-amber-500' : 
                      order.status === 'taken' ? 'bg-purple-500' : 'bg-green-500'
                    }`} />
                    
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-amber-400">
                            Order #{order.id.slice(-4)}
                          </CardTitle>
                          <div className="text-sm text-cream/60 mt-1">
                            Customer: {order.name} • {order.phone}
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <OrderTracker 
                        currentStatus={order.status}
                        orderId={order.id}
                        chefName={user?.email || 'Chef'}
                        isEditable={true}
                        onStatusChange={(newStatus) => {
                          // Only allow valid status transitions for chef
                          if (['taken', 'making', 'ready'].includes(newStatus)) {
                            updateOrderStatus(order.id, newStatus as 'taken' | 'making' | 'ready');
                          }
                        }}
                        variant="compact"
                        showDescription={false}
                        className="bg-black/20 border border-amber-600/20"
                      />
                      
                      {/* Order Details */}
                      <div className="bg-black/30 p-4 rounded-lg border border-amber-600/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-amber-400" />
                            <span className="text-sm text-cream">
                              Pickup: {order.pickupDate} at {order.pickupTime}
                            </span>
                          </div>
                          {order.estimatedReadyTime && (
                            <div className="flex items-center">
                              <Timer className="w-4 h-4 mr-2 text-amber-400" />
                              <span className="text-sm text-cream">
                                Ready by: {order.estimatedReadyTime}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {order.specialRequests && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-amber-400 mb-1">Special Requests</h4>
                            <p className="text-sm text-cream/80 bg-black/20 p-2 rounded">
                              {order.specialRequests}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium text-amber-400 mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm bg-black/20 p-2 rounded">
                                <span className="text-cream">{item.name} × {item.quantity}</span>
                                <span className="text-amber-400">${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-medium pt-2 border-t border-amber-600/20">
                              <span className="text-cream">Total</span>
                              <span className="text-amber-400">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
