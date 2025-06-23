import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Check, Clock, AlertCircle, Table as TableIcon, 
  Coffee, Bookmark, X, ScrollText, Loader2
} from 'lucide-react';
import { DiningTable, TableType, TableLocation, TableCategory } from '@/types/tables';
import { collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TableSelectionLayoutProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  partySize: number;
  onTableSelect: (tableId: string) => void;
  selectedTableId: string | null;
  className?: string;
}

const TableSelectionLayout: React.FC<TableSelectionLayoutProps> = ({
  selectedDate,
  selectedTime,
  partySize,
  onTableSelect,
  selectedTableId,
  className
}) => {
  const [tableCategories, setTableCategories] = useState<TableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'grid'>('grid');
  const [showLegend, setShowLegend] = useState(false);

  // Fetch table data from Firestore with real-time updates
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setTableCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get all tables (one-time fetch)
    const fetchTablesData = async () => {
      const tablesSnapshot = await getDocs(collection(db, 'tables'));
      return tablesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as DiningTable[];
    };

    // Set up real-time listener for reservations
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const reservationsQuery = query(
      collection(db, 'reservations'),
      where('date', '==', selectedDateStr),
      where('time', '==', selectedTime),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    // Real-time updates for reservations
    const unsubscribe = onSnapshot(reservationsQuery, async (snapshot) => {
      try {
        // Get all tables
        const tablesData = await fetchTablesData();
        
        // Extract reserved table IDs
        const reservedTableIds = snapshot.docs.map(doc => doc.data().tableId);
        
        // Update availability based on reservations
        const tablesWithAvailability = tablesData.map(table => ({
          ...table,
          isAvailable: !reservedTableIds.includes(table.id) && table.capacity >= partySize
        }));

        // Group tables by type and create categories
        const categories: TableCategory[] = [
          { 
            id: 'regular', 
            name: 'Regular Tables', 
            description: 'Standard dining tables',
            capacity: 2,
            imageUrl: '/images/regular-table.jpg',
            tables: tablesWithAvailability.filter(t => t.type === TableType.REGULAR),
            available: tablesWithAvailability.filter(t => t.type === TableType.REGULAR && t.isAvailable).length
          },
          {
            id: 'booth',
            name: 'Booths',
            description: 'Comfortable booth seating',
            capacity: 4,
            imageUrl: '/images/booth.jpg',
            tables: tablesWithAvailability.filter(t => t.type === TableType.BOOTH),
            available: tablesWithAvailability.filter(t => t.type === TableType.BOOTH && t.isAvailable).length
          },
          {
            id: 'counter',
            name: 'Counter Seats',
            description: 'Bar counter seating',
            capacity: 1,
            imageUrl: '/images/counter.jpg',
            tables: tablesWithAvailability.filter(t => t.type === TableType.COUNTER),
            available: tablesWithAvailability.filter(t => t.type === TableType.COUNTER && t.isAvailable).length
          },
          {
            id: 'private',
            name: 'Private Rooms',
            description: 'Exclusive private dining',
            capacity: 6,
            imageUrl: '/images/private.jpg',
            tables: tablesWithAvailability.filter(t => t.type === TableType.PRIVATE),
            available: tablesWithAvailability.filter(t => t.type === TableType.PRIVATE && t.isAvailable).length
          },
          {
            id: 'outdoor',
            name: 'Outdoor Tables',
            description: 'Al fresco dining experience',
            capacity: 4,
            imageUrl: '/images/outdoor.jpg',
            tables: tablesWithAvailability.filter(t => t.type === TableType.OUTDOOR),
            available: tablesWithAvailability.filter(t => t.type === TableType.OUTDOOR && t.isAvailable).length
          }
        ];

        // Filter out categories with no tables
        const nonEmptyCategories = categories.filter(category => category.tables.length > 0);
        
        setTableCategories(nonEmptyCategories);
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedDate, selectedTime, partySize]);

  // Handle table selection
  const handleTableClick = (tableId: string, isAvailable: boolean) => {
    if (isAvailable) {
      onTableSelect(tableId);
    }
  };

  // Get table icon based on type
  const getTableIcon = (type: TableType) => {
    switch (type) {
      case TableType.BOOTH:
        return <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center"><Coffee className="text-amber-400" size={20} /></div>;
      case TableType.COUNTER:
        return <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center"><Coffee className="text-amber-400" size={20} /></div>;
      case TableType.PRIVATE:
        return <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center"><Bookmark className="text-amber-400" size={20} /></div>;
      case TableType.OUTDOOR:
        return <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center"><Coffee className="text-amber-400" size={20} /></div>;
      default:
        return <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center"><TableIcon className="text-amber-400" size={20} /></div>;
    }
  };

  // Empty state when no data is available
  if (!selectedDate || !selectedTime) {
    return (
      <div className={cn("text-center py-12 border border-amber-600/30 rounded-lg bg-black/20", className)}>
        <Clock className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">Select Date & Time First</h3>
        <p className="text-cream/70 max-w-md mx-auto">
          Please select a date and time for your reservation to view available tables.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn("text-center py-12 border border-amber-600/30 rounded-lg bg-black/20", className)}>
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">Finding Available Tables</h3>
        <p className="text-cream/70">Checking availability for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}...</p>
      </div>
    );
  }

  // Empty state when no tables match the criteria
  if (tableCategories.length === 0) {
    return (
      <div className={cn("text-center py-12 border border-amber-600/30 rounded-lg bg-black/20", className)}>
        <AlertCircle className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">No Tables Available</h3>
        <p className="text-cream/70 max-w-md mx-auto">
          We couldn't find any tables available for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime} for your party size.
          Please try a different date, time, or reduce your party size.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif font-bold text-amber-400 flex items-center gap-2">
          <TableIcon className="text-amber-400" size={24} />
          Available Tables
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 rounded-full hover:bg-amber-600/20 text-amber-400 transition-colors"
          >
            <ScrollText size={18} />
          </button>
          <div className="flex border border-amber-600/30 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveView('grid')}
              className={`p-2 ${activeView === 'grid' ? 'bg-amber-600/30 text-amber-300' : 'text-cream/70 hover:bg-amber-600/10'}`}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`p-2 ${activeView === 'list' ? 'bg-amber-600/30 text-amber-300' : 'text-cream/70 hover:bg-amber-600/10'}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="w-4 h-1 bg-current rounded-sm"></span>
                <span className="w-4 h-1 bg-current rounded-sm"></span>
                <span className="w-4 h-1 bg-current rounded-sm"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-black/30 border border-amber-600/30 p-4 rounded-lg mb-4">
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-cream/70 text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-cream/70 text-sm">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-cream/70 text-sm">Awaiting Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                  <span className="text-cream/70 text-sm">Too Small (for your party)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeView === 'grid' ? (
        // Grid view - organized by category
        <div className="space-y-8">
          {tableCategories.map(category => (
            <div key={category.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-serif font-medium text-amber-300">{category.name}</h4>
                  <p className="text-cream/60 text-sm">{category.description}</p>
                </div>
                <Badge className={`${category.available > 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                  {category.available} available
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.tables.map(table => {
                  const isSelected = selectedTableId === table.id;
                  const isHovered = hoveredTableId === table.id;
                  
                  return (
                    <motion.div
                      key={table.id}
                      whileHover={{ y: -4 }}
                      onClick={() => handleTableClick(table.id, table.isAvailable)}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId(null)}
                      className={cn(
                        "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                        table.isAvailable ? "border-amber-600/30 hover:border-amber-500" : "border-red-500/30 bg-red-900/10",
                        isSelected && "border-2 border-amber-400 shadow-md shadow-amber-700/20"
                      )}
                    >
                      {/* Status indicator */}
                      <div className={cn(
                        "absolute top-2 right-2 w-2 h-2 rounded-full",
                        table.isAvailable ? "bg-green-500" : "bg-red-500"
                      )}></div>
                      
                      {/* Table content */}
                      <div className="flex flex-col items-center text-center">
                        {getTableIcon(table.type)}
                        <h5 className="font-medium text-cream mt-2">{table.name}</h5>
                        <span className="text-sm text-cream/60 flex items-center gap-1">
                          <Users size={14} />
                          {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                        </span>
                        
                        <Badge 
                          className="mt-2 bg-amber-900/30 text-amber-300 border-amber-600/20"
                        >
                          {table.location.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 bg-amber-400 text-black rounded-full p-1"
                        >
                          <Check size={12} />
                        </motion.div>
                      )}
                      
                      {/* Hover effect */}
                      {isHovered && table.isAvailable && !isSelected && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4"
                        >
                          <span className="text-sm font-medium text-amber-300">Click to select</span>
                        </motion.div>
                      )}
                      
                      {/* Unavailable overlay */}
                      {!table.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-sm font-medium text-red-300">Unavailable</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view - shows all tables in a list format
        <div className="space-y-2">
          {tableCategories.flatMap(category => 
            category.tables.map(table => {
              const isSelected = selectedTableId === table.id;
              
              return (
                <motion.div
                  key={table.id}
                  whileHover={table.isAvailable ? { x: 5 } : {}}
                  onClick={() => handleTableClick(table.id, table.isAvailable)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    table.isAvailable ? "border-amber-600/30 hover:border-amber-500 hover:bg-amber-900/10" : "border-red-500/30 bg-red-900/10 opacity-70",
                    isSelected && "border-2 border-amber-400 bg-amber-900/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getTableIcon(table.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-cream">{table.name}</h5>
                        <Badge 
                          className="bg-amber-900/30 text-amber-300 border-amber-600/20 text-xs"
                        >
                          {table.location.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm text-cream/60">{category.name} • {table.capacity} {table.capacity === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                  
                  <div>
                    {isSelected ? (
                      <div className="bg-amber-400 text-black rounded-full p-1">
                        <Check size={16} />
                      </div>
                    ) : table.isAvailable ? (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-400/50"></div>
                    ) : (
                      <X size={16} className="text-red-400" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TableSelectionLayout;
