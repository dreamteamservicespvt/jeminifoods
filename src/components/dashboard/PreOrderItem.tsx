import React from 'react';
import { format } from 'date-fns';
import { 
  CalendarClock, ChefHat, Clock, Loader2, RefreshCw, 
  Receipt, Eye, ArrowRight, Wallet, ShoppingBag
} from 'lucide-react';
import PreOrderStepTracker from './PreOrderStepTracker';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PreOrderItemProps {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'booked' | 'taken' | 'making' | 'ready' | 'completed';
  date: string;
  time: string;
  createdAt: any;
  assignedChef?: string;
  estimatedReadyTime?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PreOrderItem: React.FC<PreOrderItemProps> = ({
  id,
  items,
  total,
  status,
  date,
  time,
  createdAt,
  assignedChef,
  estimatedReadyTime,
  onRefresh,
  isRefreshing
}) => {
  const formattedDate = date ? 
    format(new Date(date), 'MMMM d, yyyy') : 
    'Date not specified';
  
  // Enhanced status colors with glow
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    booked: "bg-blue-500/20 text-blue-400 border-blue-500",
    taken: "bg-purple-500/20 text-purple-400 border-purple-500", 
    making: "bg-amber-500/20 text-amber-400 border-amber-500",
    ready: "bg-green-500/20 text-green-400 border-green-500",
    completed: "bg-gray-500/20 text-gray-400 border-gray-500/50"
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card className="w-full mb-5 overflow-hidden bg-gradient-to-br from-black/60 to-black/40 border-amber-600/20 shadow-lg">
        <div className={`h-1 w-full ${
          status === 'ready' ? 'bg-green-500' : 
          status === 'making' ? 'bg-amber-500' : 
          status === 'taken' ? 'bg-purple-500' : 
          status === 'booked' ? 'bg-blue-500' : 
          'bg-yellow-500' // pending
        }`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-lg text-amber-400">Order #{id.slice(-4)}</CardTitle>
              </div>
              <div className="text-sm text-cream/60 mt-1">
                Ordered: {new Date(createdAt.toDate()).toLocaleDateString()} at {new Date(createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    className={`${statusColors[status]} transition-all duration-300`} 
                    variant="outline"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current order status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PreOrderStepTracker status={status} />
          </motion.div>
          
          <motion.div 
            className="mt-4 space-y-2 bg-black/30 p-4 rounded-lg border border-amber-600/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <CalendarClock className="w-4 h-4 mr-2 text-amber-400" />
                <span className="text-sm text-cream">Pickup: {formattedDate} at {time}</span>
              </div>
              
              {assignedChef && (
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-2 text-amber-400" />
                  <span className="text-sm text-cream">Chef: {assignedChef}</span>
                </div>
              )}
              
              {estimatedReadyTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-400" />
                  <span className="text-sm text-cream">Est. Ready: {estimatedReadyTime}</span>
                </div>
              )}
            </div>
          </motion.div>
          
          <Separator className="my-3 bg-amber-600/20" />
          
          <div>
            <div className="flex items-center mb-3">
              <Receipt className="w-4 h-4 mr-2 text-amber-400" />
              <h4 className="text-sm font-medium text-amber-400">Order Items</h4>
            </div>
            
            <div className="space-y-2 pl-2">
              {items.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex justify-between text-sm bg-black/20 p-2 rounded border border-amber-600/5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-amber-400/70" />
                    <span className="text-cream">{item.name} × {item.quantity}</span>
                  </div>
                  <span className="font-medium text-amber-400">${item.price.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-between font-medium mt-4 pt-2 border-t border-amber-600/10">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 mr-2 text-amber-400" />
                <span className="text-cream">Total</span>
              </div>
              <span className="text-amber-400 font-bold">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-3 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-amber-600/20 text-amber-400 hover:bg-amber-500/10"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-amber-600/20 text-amber-400 hover:bg-amber-500/10"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Update Status
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PreOrderItem;
