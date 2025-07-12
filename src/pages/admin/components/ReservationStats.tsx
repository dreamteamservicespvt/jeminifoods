import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Table as TableIcon,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { ReservationStats as StatsType } from '../../../types/reservation';

interface ReservationStatsProps {
  stats: StatsType;
}

const ReservationStats: React.FC<ReservationStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Reservations",
      value: stats.total,
      icon: Calendar,
      color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      description: "All time"
    },
    {
      title: "Pending Review",
      value: stats.pending,
      icon: AlertCircle,
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      description: "Needs attention"
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      color: "text-green-400 bg-green-400/10 border-green-400/20",
      description: "Ready to dine"
    },
    {
      title: "Booked (with Table)",
      value: stats.booked,
      icon: TableIcon,
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      description: "Table assigned"
    },
    {
      title: "Today's Reservations",
      value: stats.todayTotal,
      icon: Clock,
      color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      description: `${stats.todayPending} pending`
    },
    {
      title: "Upcoming Today",
      value: stats.upcomingToday,
      icon: UserCheck,
      color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      description: "Still to arrive"
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-red-400 bg-red-400/10 border-red-400/20",
      description: "Customer cancelled"
    },
    {
      title: "Expired/No-Show",
      value: stats.expired,
      icon: AlertTriangle,
      color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      description: "Didn't arrive"
    }
  ];

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Mobile Priority Stats - Top Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.slice(0, 4).map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${stat.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className="sm:hidden" />
                <Icon size={20} className="hidden sm:block" />
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold">
                    {stat.value}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium text-xs sm:text-sm leading-tight">{stat.title}</h4>
                <p className="text-xs opacity-75 hidden sm:block">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Secondary Stats - Collapsible on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.slice(4).map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${stat.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className="sm:hidden" />
                <Icon size={20} className="hidden sm:block" />
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold">
                    {stat.value}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium text-xs sm:text-sm leading-tight">{stat.title}</h4>
                <p className="text-xs opacity-75 hidden sm:block">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mobile-Optimized Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Occupancy Rate */}
        <div className="bg-black/20 border border-amber-600/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TableIcon size={20} className="text-amber-400" />
              <h4 className="font-medium text-sm text-amber-400">Table Occupancy</h4>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">
              {stats.occupancyRate.toFixed(1)}%
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-2">Current utilization</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-amber-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Average Party Size */}
        <div className="bg-black/20 border border-amber-600/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-amber-400" />
              <h4 className="font-medium text-sm text-amber-400">Avg Party Size</h4>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">
              {stats.averagePartySize.toFixed(1)}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-2">Guests per reservation</p>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6].map(size => (
              <div
                key={size}
                className={`w-3 h-3 rounded-full ${
                  size <= stats.averagePartySize ? 'bg-amber-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationStats;
