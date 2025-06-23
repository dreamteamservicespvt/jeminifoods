import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Eye, CalendarCheck, CalendarX, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ReservationItemProps {
  id: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  tableLocation?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: any;
  onViewDetails?: (id: string) => void;
}

export const ReservationItem: React.FC<ReservationItemProps> = ({
  id,
  date,
  time,
  partySize,
  specialRequests,
  tableLocation,
  status,
  createdAt,
  onViewDetails
}) => {
  const formattedDate = date ? 
    format(new Date(date), 'MMMM d, yyyy') : 
    'Date not specified';
  
  // Enhanced status colors with visual identity matching the rest of the site
  const statusColors = {
    confirmed: "bg-green-500/20 text-green-400 border-green-500",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500",
    cancelled: "bg-red-500/20 text-red-400 border-red-500",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50"
  };

  const statusIcons = {
    confirmed: <CalendarCheck className="w-4 h-4" />,
    pending: <CalendarIcon className="w-4 h-4" />,
    cancelled: <CalendarX className="w-4 h-4" />,
    completed: <CalendarCheck className="w-4 h-4" />
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card className="w-full mb-5 overflow-hidden bg-gradient-to-br from-black/60 to-black/40 border-amber-600/20 shadow-lg">
        <div className={`h-1 w-full ${
          status === 'confirmed' ? 'bg-green-500' : 
          status === 'pending' ? 'bg-amber-500' : 
          status === 'cancelled' ? 'bg-red-500' : 
          'bg-blue-500'
        }`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg text-blue-400">Reservation #{id.slice(-4)}</CardTitle>
              </div>
              <div className="text-sm text-cream/60 mt-1">
                Booked: {new Date(createdAt.toDate()).toLocaleDateString()} at {new Date(createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    className={`${statusColors[status]} transition-all duration-300`} 
                    variant="outline"
                  >
                    {statusIcons[status]}
                    <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reservation status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/30 p-4 rounded-lg border border-blue-600/10 mt-2">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-cream">{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-cream">{time}</span>
            </div>
            
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-cream">{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
            
            {tableLocation && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-cream">{tableLocation}</span>
              </div>
            )}
          </div>
          
          {specialRequests && (
            <div className="mt-4 bg-black/20 p-3 rounded-lg border border-blue-600/10">
              <h4 className="text-sm font-medium text-blue-400 mb-1">Special Requests</h4>
              <p className="text-sm text-cream/80">{specialRequests}</p>
            </div>
          )}
        </CardContent>
        
        {onViewDetails && (
          <CardFooter className="pt-0 pb-3">
            <Button
              variant="outline"
              size="sm"
              className="ml-auto text-xs border-blue-600/20 text-blue-400 hover:bg-blue-500/10"
              onClick={() => onViewDetails(id)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default ReservationItem;
