import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, XCircle, CheckCircle, Calendar, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiningTable, TableCategory } from '@/types/tables';
import { getTableCategories } from '@/lib/tableService';
import { format } from 'date-fns';

interface TableSelectorProps {
  date: string;
  partySize: number;
  onSelectTable: (tableId: string, tableName: string) => void;
  selectedTableId?: string;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  date,
  partySize,
  onSelectTable,
  selectedTableId
}) => {
  const [tableCategories, setTableCategories] = useState<TableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  
  // Fetch table categories when date or party size changes
  useEffect(() => {
    async function fetchTableData() {
      try {
        setLoading(true);
        const categories = await getTableCategories(date);
        
        // Filter categories by party size
        const filteredCategories = categories.filter(category => 
          category.capacity >= partySize
        );
        
        setTableCategories(filteredCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError('Unable to load available tables. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTableData();
  }, [date, partySize]);
  
  // Helper to format display date
  const formatDisplayDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return format(dateObj, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };
  
  // Apply filters to table categories
  const filteredCategories = filterLocation
    ? tableCategories.map(category => ({
        ...category,
        tables: category.tables.filter(table => 
          table.location === filterLocation
        ),
        available: category.tables.filter(table => 
          table.location === filterLocation && table.isAvailable
        ).length
      })).filter(category => category.tables.length > 0)
    : tableCategories;
  
  // Empty state when no tables are available
  if (!loading && filteredCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-amber-600/20 rounded-lg bg-black/30">
        <div className="w-16 h-16 bg-amber-600/10 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-amber-500/50" />
        </div>
        <h3 className="text-xl font-semibold text-amber-400 mb-2">No Tables Available</h3>
        <p className="text-cream/80 text-center mb-6 max-w-md">
          {partySize > 1 
            ? `We don't have any tables available for a party of ${partySize} on ${formatDisplayDate(date)}.`
            : `We don't have any tables available for one person on ${formatDisplayDate(date)}.`
          }
        </p>
        <p className="text-cream/60 text-center text-sm mb-6">
          Try selecting a different date or adjusting your party size.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-amber-400">
          Available Tables
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border-amber-600/40 text-amber-400 hover:bg-amber-600/10"
        >
          <Filter size={16} />
          Filter Tables
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-black/20 border border-amber-600/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-400 mb-3">Table Location</h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  onClick={() => setFilterLocation(null)}
                  className={`cursor-pointer ${!filterLocation 
                    ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                    : 'bg-black/40 hover:bg-black/60 text-cream/80 border border-amber-600/30'}`}
                >
                  All Locations
                </Badge>
                <Badge
                  onClick={() => setFilterLocation('window')}
                  className={`cursor-pointer ${filterLocation === 'window'
                    ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                    : 'bg-black/40 hover:bg-black/60 text-cream/80 border border-amber-600/30'}`}
                >
                  Window View
                </Badge>
                <Badge
                  onClick={() => setFilterLocation('bar')}
                  className={`cursor-pointer ${filterLocation === 'bar'
                    ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                    : 'bg-black/40 hover:bg-black/60 text-cream/80 border border-amber-600/30'}`}
                >
                  Chef's Bar
                </Badge>
                <Badge
                  onClick={() => setFilterLocation('outdoor_patio')}
                  className={`cursor-pointer ${filterLocation === 'outdoor_patio'
                    ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                    : 'bg-black/40 hover:bg-black/60 text-cream/80 border border-amber-600/30'}`}
                >
                  Outdoor Patio
                </Badge>
                <Badge
                  onClick={() => setFilterLocation('private_room')}
                  className={`cursor-pointer ${filterLocation === 'private_room'
                    ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                    : 'bg-black/40 hover:bg-black/60 text-cream/80 border border-amber-600/30'}`}
                >
                  Private Room
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-amber-600/20 rounded-lg overflow-hidden bg-black/30">
              <div className="h-40 bg-amber-900/20 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 w-3/4 bg-amber-900/20 animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-amber-900/20 animate-pulse rounded"></div>
                <div className="h-10 w-full bg-amber-900/20 animate-pulse rounded-md mt-6"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 border border-red-500/20 bg-red-900/10 rounded-lg">
          <p className="text-red-400">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="destructive"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Table categories grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-amber-600/20 rounded-lg overflow-hidden bg-black/30 relative group"
            >
              {/* Table image */}
              <div className="relative h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                <img 
                  src={category.imageUrl || '/images/tables/default.jpg'}
                  alt={`${category.name}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Availability badge */}
                <div className="absolute top-3 right-3 z-20">
                  <Badge className={`${
                    category.available > 0
                      ? 'bg-green-600/80 hover:bg-green-600'
                      : 'bg-red-600/80 hover:bg-red-600'
                  } text-white font-medium`}>
                    {category.available} Available
                  </Badge>
                </div>
                
                {/* Category info */}
                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                </div>
              </div>
              
              {/* Table details */}
              <div className="p-4">
                <p className="text-cream/70 text-sm mb-4">{category.description}</p>
                
                {/* Available tables */}
                <div className="space-y-2 mb-5">
                  {category.tables.map((table) => (
                    <div 
                      key={table.id}
                      onClick={() => table.isAvailable && onSelectTable(table.id, `${category.name} (${table.location.replace('_', ' ')})`)}
                      className={`flex justify-between items-center p-2 rounded ${
                        selectedTableId === table.id 
                          ? 'bg-amber-600/30 border border-amber-500'
                          : table.isAvailable
                            ? 'hover:bg-amber-600/10 border border-amber-600/20 cursor-pointer'
                            : 'border border-amber-900/20 bg-black/40 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          table.isAvailable ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-cream">
                          {table.name} ({table.location.replace('_', ' ')})
                        </span>
                      </div>
                      
                      {selectedTableId === table.id && (
                        <CheckCircle size={16} className="text-amber-400" />
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  disabled={category.available === 0} 
                  onClick={() => {
                    // Select the first available table in this category
                    const firstAvailableTable = category.tables.find(t => t.isAvailable);
                    if (firstAvailableTable) {
                      onSelectTable(
                        firstAvailableTable.id, 
                        `${category.name} (${firstAvailableTable.location.replace('_', ' ')})`
                      );
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black"
                >
                  {category.available > 0 
                    ? `Select ${category.name}` 
                    : 'Not Available'
                  }
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableSelector;
