import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  query, 
  addDoc,
  where,
  getDocs
} from "firebase/firestore";
import { 
  CheckCircle, XCircle, Clock, Trash2, User, Mail, Phone, Utensils, 
  Info, Filter, Search, Calendar as CalendarIcon, Clock as ClockIcon, 
  AlertCircle, Maximize2, ZoomIn, X, ExternalLink, Download, Plus,
  ChefHat, Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { OrderTracker } from "@/components/ui/OrderTracker";
import type { OrderStatus } from "@/components/ui/OrderTracker";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { useAdminNotifications, useChefNotifications } from "../../hooks/useNotificationActions";

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
  paymentStatus?: 'pending' | 'completed';
  paymentScreenshotUrl?: string;
  paymentMethod?: 'upi' | 'qr';
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

interface Chef {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty?: string;
  createdAt?: any;
}

const AdminPreOrders = () => {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PreOrder[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showAddChefForm, setShowAddChefForm] = useState(false);
  const [imageModal, setImageModal] = useState<{open: boolean, url: string | null}>({
    open: false,
    url: null
  });
  
  // Chef form state
  const [newChef, setNewChef] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: ""
  });

  const { toast } = useToast();
  const { sendChefAssigned } = useAdminNotifications();
  const { sendOrderStatusUpdated } = useChefNotifications();

  // Fetch pre-orders
  useEffect(() => {
    const q = query(collection(db, "preOrders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PreOrder[];
      setPreOrders(orders);
      setFilteredOrders(orders);
    });
    return unsubscribe;
  }, []);

  // Fetch chefs
  useEffect(() => {
    const q = query(collection(db, "chefs"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chefList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chef[];
      setChefs(chefList);
    });
    return unsubscribe;
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = [...preOrders];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.orderId?.toLowerCase().includes(query) ||
        order.phone.includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [preOrders, searchQuery, statusFilter]);

  // Add new chef
  const handleAddChef = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add-chef');
    
    try {
      await addDoc(collection(db, "chefs"), {
        ...newChef,
        createdAt: new Date(),
      });
      
      toast({
        title: "Chef Added Successfully",
        description: `${newChef.name} has been added to the team.`,
      });
      
      setNewChef({ name: "", email: "", phone: "", password: "", specialty: "" });
      setShowAddChefForm(false);
    } catch (error) {
      console.error("Error adding chef:", error);
      toast({
        title: "Error",
        description: "Failed to add chef. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Assign chef to order
  const handleChefAssignment = async (orderId: string, chefId: string, chefName: string) => {
    if (!chefId) return;
    
    setActionLoading(orderId);
    try {
      const order = preOrders.find(o => o.id === orderId);
      if (!order) return;

      const now = new Date().toLocaleString();
      await updateDoc(doc(db, "preOrders", orderId), {
        assignedChef: chefId,
        chefName: chefName,
        status: 'taken',
        timestamps: {
          ...preOrders.find(o => o.id === orderId)?.timestamps,
          taken: now
        }
      });

      // Send notification to customer about chef assignment
      await sendChefAssigned(
        order.userId || 'guest',
        {
          id: orderId,
          orderId: order.orderId || '',
          chefName,
          userName: order.name
        }
      );
      
      toast({
        title: "Chef Assigned",
        description: `Order assigned to ${chefName} and status updated to Taken.`,
      });
    } catch (error) {
      console.error("Error assigning chef:", error);
      toast({
        title: "Error",
        description: "Failed to assign chef. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(orderId);
    try {
      const order = preOrders.find(o => o.id === orderId);
      if (!order) return;

      const now = new Date().toLocaleString();
      
      await updateDoc(doc(db, "preOrders", orderId), {
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
          chefName: order.chefName || 'Our chef'
        }
      );
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus} and customer notified.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    
    setActionLoading(orderId);
    try {
      await deleteDoc(doc(db, "preOrders", orderId));
      toast({
        title: "Order Deleted",
        description: "Order has been permanently removed.",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Status counts for filter badges
  const statusCounts = {
    all: preOrders.length,
    booked: preOrders.filter(o => o.status === 'booked').length,
    taken: preOrders.filter(o => o.status === 'taken').length,
    making: preOrders.filter(o => o.status === 'making').length,
    ready: preOrders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Dashboard */}
      <AdminAnalytics />
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream/40 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/30 border-amber-600/20 text-cream placeholder:text-cream/40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`${
                  statusFilter === status 
                    ? "bg-amber-600 text-black" 
                    : "border-amber-600/20 text-cream hover:bg-amber-600/20"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Add Chef Button */}
        <Button
          onClick={() => setShowAddChefForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Chef
        </Button>
      </div>

      {/* Add Chef Form Modal */}
      <AnimatePresence>
        {showAddChefForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddChefForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-amber-600/20 p-6 rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-cream">Add New Chef</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddChefForm(false)}
                  className="text-cream/60 hover:text-cream"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleAddChef} className="space-y-4">
                <div>
                  <label className="block text-cream/80 text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={newChef.name}
                    onChange={(e) => setNewChef({ ...newChef, name: e.target.value })}
                    required
                    className="bg-black/30 border-amber-600/20 text-cream"
                    placeholder="Enter chef's full name"
                  />
                </div>

                <div>
                  <label className="block text-cream/80 text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newChef.email}
                    onChange={(e) => setNewChef({ ...newChef, email: e.target.value })}
                    required
                    className="bg-black/30 border-amber-600/20 text-cream"
                    placeholder="chef@jemini.com"
                  />
                </div>

                <div>
                  <label className="block text-cream/80 text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newChef.phone}
                    onChange={(e) => setNewChef({ ...newChef, phone: e.target.value })}
                    required
                    className="bg-black/30 border-amber-600/20 text-cream"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-cream/80 text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newChef.password}
                    onChange={(e) => setNewChef({ ...newChef, password: e.target.value })}
                    required
                    className="bg-black/30 border-amber-600/20 text-cream"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-cream/80 text-sm font-medium mb-1">
                    Specialty (Optional)
                  </label>
                  <Input
                    type="text"
                    value={newChef.specialty}
                    onChange={(e) => setNewChef({ ...newChef, specialty: e.target.value })}
                    className="bg-black/30 border-amber-600/20 text-cream"
                    placeholder="e.g., Italian Cuisine, Asian Fusion"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddChefForm(false)}
                    className="flex-1 border-amber-600/20 text-cream hover:bg-amber-600/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading === 'add-chef'}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === 'add-chef' ? 'Adding...' : 'Add Chef'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-black/40 border border-amber-600/20 rounded-lg">
            <Package className="w-16 h-16 text-cream/30 mx-auto mb-4" />
            <p className="text-cream/60 text-lg mb-2">No orders found</p>
            <p className="text-cream/40">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Orders will appear here when customers place them"
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-amber-600/20 rounded-lg p-6"
            >
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cream">{order.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-cream/60">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {order.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {order.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    className={`${
                      order.status === 'booked' ? 'bg-amber-600/20 text-amber-400' :
                      order.status === 'taken' ? 'bg-blue-600/20 text-blue-400' :
                      order.status === 'making' ? 'bg-purple-600/20 text-purple-400' :
                      order.status === 'ready' ? 'bg-green-600/20 text-green-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </Badge>
                  
                  {order.orderId && (
                    <span className="text-cream/60 text-sm">#{order.orderId}</span>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="text-cream/60 hover:text-cream"
                  >
                    {expandedOrder === order.id ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>

              {/* Order Tracker */}
              <div className="mb-6">
                <OrderTracker
                  currentStatus={order.status || 'booked'}
                  orderId={order.orderId}
                  chefName={order.chefName}
                  timestamps={order.timestamps}
                  isEditable={true}
                  onStatusChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                  variant="compact"
                  showTimestamps={true}
                  showDescription={false}
                />
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-amber-600/20 pt-4 space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-cream mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-black/20 rounded">
                              <div>
                                <span className="text-cream">{item.name}</span>
                                <span className="text-cream/60 ml-2">×{item.quantity}</span>
                                {item.specialInstructions && (
                                  <p className="text-xs text-cream/60 mt-1">
                                    Note: {item.specialInstructions}
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
                        <div>
                          <h4 className="font-medium text-cream mb-2">Special Requests</h4>
                          <p className="text-cream/80 p-3 bg-black/20 rounded">
                            {order.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Chef Assignment */}
                      {order.status === 'booked' && (
                        <div>
                          <h4 className="font-medium text-cream mb-2">Assign Chef</h4>
                          <div className="flex gap-3">
                            <select
                              className="flex-1 p-2 bg-black/30 border border-amber-600/20 rounded text-cream"
                              onChange={(e) => {
                                const chefId = e.target.value;
                                const chef = chefs.find(c => c.id === chefId);
                                if (chef) {
                                  handleChefAssignment(order.id, chefId, chef.name);
                                }
                              }}
                              disabled={actionLoading === order.id}
                            >
                              <option value="">Select a chef...</option>
                              {chefs.map((chef) => (
                                <option key={chef.id} value={chef.id}>
                                  {chef.name} {chef.specialty && `(${chef.specialty})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Assigned Chef Info */}
                      {order.chefName && (
                        <div>
                          <h4 className="font-medium text-cream mb-2">Assigned Chef</h4>
                          <div className="flex items-center gap-2 p-3 bg-green-600/10 rounded">
                            <ChefHat className="w-5 h-5 text-green-400" />
                            <span className="text-cream">{order.chefName}</span>
                          </div>
                        </div>
                      )}

                      {/* Payment Screenshot */}
                      {order.paymentScreenshotUrl && (
                        <div>
                          <h4 className="font-medium text-cream mb-2">Payment Screenshot</h4>
                          <div className="relative">
                            <img
                              src={order.paymentScreenshotUrl}
                              alt="Payment Screenshot"
                              className="w-full max-w-sm h-32 object-cover rounded cursor-pointer"
                              onClick={() => setImageModal({open: true, url: order.paymentScreenshotUrl!})}
                            />
                            <Button
                              size="sm"
                              className="absolute top-2 right-2 bg-black/50 text-white"
                              onClick={() => setImageModal({open: true, url: order.paymentScreenshotUrl!})}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={actionLoading === order.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Order
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModal.open && imageModal.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setImageModal({open: false, url: null})}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageModal.url}
                alt="Payment Screenshot"
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setImageModal({open: false, url: null})}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPreOrders;