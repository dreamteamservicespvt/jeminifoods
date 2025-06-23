import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, LogOut, Home, Clock, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChefLayoutProps {
  children: ReactNode;
  chefName?: string;
  orderCount?: number;
  pendingCount?: number;
  onSignOut?: () => void;
  currentPath?: string;
}

const ChefLayout: React.FC<ChefLayoutProps> = ({
  children,
  chefName = "Chef",
  orderCount = 0,
  pendingCount = 0,
  onSignOut,
  currentPath = "/chef/dashboard"
}) => {
  const navItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/chef/dashboard',
      count: orderCount
    },
    { 
      icon: Clock, 
      label: 'Pending', 
      path: '/chef/pending',
      count: pendingCount
    },
    { 
      icon: TrendingUp, 
      label: 'Completed', 
      path: '/chef/completed'
    },
    { 
      icon: Settings, 
      label: 'Profile', 
      path: '/chef/profile'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-black to-charcoal">
      {/* Chef-specific Header */}
      <header className="bg-black/60 backdrop-blur-sm border-b border-amber-600/20 p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-lg">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-400">Kitchen Dashboard</h1>
              <p className="text-cream/60 text-sm">
                Welcome back, <span className="text-amber-400 font-medium">{chefName}</span>
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-600/20 rounded-full">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">{pendingCount} pending</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{orderCount} total</span>
              </div>
            </div>

            {/* Sign Out */}
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="border-red-400/30 text-red-400 hover:bg-red-600/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      <nav className="bg-black/30 border-b border-amber-600/10 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span className="text-cream/60">Kitchen</span>
            <span className="text-cream/40">/</span>
            <span className="text-amber-400">
              {navItems.find(item => item.path === currentPath)?.label || 'Dashboard'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Chef-specific Footer */}
      <footer className="mt-auto bg-black/30 border-t border-amber-600/10 p-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-cream/40 text-sm">
            © 2025 Jemini Kitchen Dashboard - Designed for Culinary Excellence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChefLayout;
