import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ChefHat, 
  Package, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  Calendar
} from 'lucide-react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  totalOrders: number;
  totalChefs: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  activeChefs: number;
  ordersByStatus: {
    booked: number;
    taken: number;
    making: number;
    ready: number;
  };
  dailyTrends: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

interface PreOrder {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  assignedChef?: string;
}

interface Chef {
  id: string;
  name: string;
  email: string;
  specialty?: string;
}

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalChefs: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    todayOrders: 0,
    activeChefs: 0,
    ordersByStatus: {
      booked: 0,
      taken: 0,
      making: 0,
      ready: 0
    },
    dailyTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeOrders = onSnapshot(
      collection(db, 'preOrders'),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PreOrder[];

        calculateAnalytics(orders);
      }
    );

    const unsubscribeChefs = onSnapshot(
      collection(db, 'chefs'),
      (snapshot) => {
        const chefs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chef[];

        // Update chef-related analytics
        setAnalytics(prev => ({
          ...prev,
          totalChefs: chefs.length,
          activeChefs: chefs.length // For now, consider all chefs as active
        }));
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeChefs();
    };
  }, []);

  const calculateAnalytics = (orders: PreOrder[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Basic counts
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'booked').length;
    const completedOrders = orders.filter(o => o.status === 'ready').length;
    
    // Revenue calculations
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Today's orders
    const todayOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= today;
    }).length;

    // Orders by status
    const ordersByStatus = {
      booked: orders.filter(o => o.status === 'booked').length,
      taken: orders.filter(o => o.status === 'taken').length,
      making: orders.filter(o => o.status === 'making').length,
      ready: orders.filter(o => o.status === 'ready').length,
    };

    // Daily trends (last 7 days)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        return orderDay.getTime() === date.getTime();
      });

      dailyTrends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });
    }

    setAnalytics(prev => ({
      ...prev,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      todayOrders,
      ordersByStatus,
      dailyTrends
    }));

    setLoading(false);
  };

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

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, icon, color, change, trend }) => (
    <motion.div variants={itemVariants}>
      <Card className="bg-black/40 border-amber-600/20 p-4 hover:border-amber-600/40 transition-all">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-cream/60 text-sm">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-cream">{value}</p>
              {change && (
                <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                  {change}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black/40 border border-amber-600/20 p-4 rounded-lg animate-pulse">
            <div className="h-16 bg-amber-600/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={<Package className="w-6 h-6 text-blue-400" />}
          color="bg-blue-600/20"
          change={`+${analytics.todayOrders} today`}
          trend="up"
        />
        
        <StatCard
          title="Total Chefs"
          value={analytics.totalChefs}
          icon={<ChefHat className="w-6 h-6 text-green-400" />}
          color="bg-green-600/20"
          change={`${analytics.activeChefs} active`}
          trend="neutral"
        />
        
        <StatCard
          title="Pending Orders"
          value={analytics.pendingOrders}
          icon={<Clock className="w-6 h-6 text-amber-400" />}
          color="bg-amber-600/20"
          change={`${Math.round((analytics.pendingOrders / analytics.totalOrders) * 100)}%`}
          trend={analytics.pendingOrders > analytics.totalOrders * 0.3 ? 'up' : 'down'}
        />
        
        <StatCard
          title="Completed Orders"
          value={analytics.completedOrders}
          icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          color="bg-green-600/20"
          change={`${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%`}
          trend="up"
        />
      </motion.div>

      {/* Revenue Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-green-400" />}
          color="bg-green-600/20"
        />
        
        <StatCard
          title="Average Order Value"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
          color="bg-purple-600/20"
        />
      </motion.div>

      {/* Order Status Breakdown */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <Card className="bg-black/40 border-amber-600/20 p-4">
          <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Order Status Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{analytics.ordersByStatus.booked}</p>
              <p className="text-cream/60 text-sm">Booked</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{analytics.ordersByStatus.taken}</p>
              <p className="text-cream/60 text-sm">Taken</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{analytics.ordersByStatus.making}</p>
              <p className="text-cream/60 text-sm">Making</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-cream">{analytics.ordersByStatus.ready}</p>
              <p className="text-cream/60 text-sm">Ready</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Daily Trends */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <Card className="bg-black/40 border-amber-600/20 p-4">
          <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Daily Trends (Last 7 Days)
          </h3>
          <div className="space-y-2">
            {analytics.dailyTrends.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-black/20 rounded">
                <span className="text-cream/80 text-sm">{day.date}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-cream font-medium">{day.orders} orders</p>
                    <p className="text-green-400 text-sm">${day.revenue.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-2 bg-amber-600/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (day.orders / Math.max(...analytics.dailyTrends.map(d => d.orders))) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
