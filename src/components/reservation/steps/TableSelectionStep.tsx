import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Heart, Briefcase, Calendar, Star, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ReservationData } from '../FourStepReservationFlow';

interface TableSelectionStepProps {
  data: ReservationData;
  onUpdate: (updates: Partial<ReservationData>) => void;
}

// Mock table data - replace with real data from backend
const mockTables = [
  { id: 'T1', name: 'Window Table 1', capacity: 2, location: 'window', available: true, type: 'romantic' },
  { id: 'T2', name: 'Window Table 2', capacity: 2, location: 'window', available: false, type: 'romantic' },
  { id: 'T3', name: 'Corner Booth 1', capacity: 4, location: 'corner', available: true, type: 'private' },
  { id: 'T4', name: 'Center Table 1', capacity: 4, location: 'center', available: true, type: 'standard' },
  { id: 'T5', name: 'Center Table 2', capacity: 4, location: 'center', available: true, type: 'standard' },
  { id: 'T6', name: 'Patio Table 1', capacity: 6, location: 'patio', available: true, type: 'outdoor' },
  { id: 'T7', name: 'Private Dining', capacity: 8, location: 'private', available: true, type: 'private' },
  { id: 'T8', name: 'Bar Counter', capacity: 2, location: 'bar', available: true, type: 'bar' },
];

const occasionOptions = [
  { value: 'birthday', label: 'Birthday Celebration', icon: '🎂' },
  { value: 'anniversary', label: 'Anniversary', icon: '💕' },
  { value: 'business', label: 'Business Meeting', icon: '💼' },
  { value: 'date', label: 'Romantic Date', icon: '❤️' },
  { value: 'family', label: 'Family Gathering', icon: '👨‍👩‍👧‍👦' },
  { value: 'celebration', label: 'Special Celebration', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '✨' },
];

const getTableTypeColor = (type: string) => {
  switch (type) {
    case 'romantic': return 'border-pink-500/50 bg-pink-900/20';
    case 'private': return 'border-purple-500/50 bg-purple-900/20';
    case 'outdoor': return 'border-green-500/50 bg-green-900/20';
    case 'bar': return 'border-orange-500/50 bg-orange-900/20';
    default: return 'border-gray-500/50 bg-gray-900/20';
  }
};

const getTableTypeIcon = (type: string) => {
  switch (type) {
    case 'romantic': return '💕';
    case 'private': return '🔒';
    case 'outdoor': return '🌿';
    case 'bar': return '🍸';
    default: return '🍽️';
  }
};

const TableSelectionStep: React.FC<TableSelectionStepProps> = ({ data, onUpdate }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(data.tableId || null);
  const [showTableLayout, setShowTableLayout] = useState(false);

  // Filter tables based on party size
  const availableTables = mockTables.filter(table => 
    table.available && table.capacity >= data.partySize
  );

  const handleTableSelect = (tableId: string, tableName: string) => {
    setSelectedTable(tableId);
    onUpdate({ tableId, tableName });
  };

  const handleOccasionChange = (occasion: string) => {
    onUpdate({ occasion });
  };

  const handleSpecialRequestsChange = (requests: string) => {
    onUpdate({ specialRequests: requests });
  };

  return (
    <div className="space-y-8">
      {/* Table Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
              <MapPin className="text-amber-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-400">Choose Your Table</h3>
              <p className="text-cream/70 text-sm">
                Perfect tables for {data.partySize} {data.partySize === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTableLayout(true)}
            className="border-amber-600/30 text-amber-400 hover:bg-amber-900/20"
          >
            View Layout
          </Button>
        </div>

        {/* Table Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTables.map((table) => {
            const isSelected = selectedTable === table.id;
            
            return (
              <motion.button
                key={table.id}
                onClick={() => handleTableSelect(table.id, table.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-600 shadow-lg'
                    : `${getTableTypeColor(table.type)} hover:border-amber-600/50`
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTableTypeIcon(table.type)}</span>
                    <div>
                      <h4 className="font-semibold text-cream">{table.name}</h4>
                      <p className="text-xs text-cream/60 capitalize">{table.location} • {table.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Users size={12} className="mr-1" />
                    {table.capacity}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cream/70">
                    Capacity: Up to {table.capacity} guests
                  </span>
                  {isSelected && (
                    <Badge className="bg-amber-600 text-black text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {availableTables.length === 0 && (
          <div className="text-center py-8 text-cream/50">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p>No tables available for {data.partySize} guests at this time.</p>
            <p className="text-sm mt-2">Please try a different date or contact us directly.</p>
          </div>
        )}
      </Card>

      {/* Occasion Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <Star className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Special Occasion</h3>
            <p className="text-cream/70 text-sm">Let us know if you're celebrating something special</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {occasionOptions.map((occasion) => {
            const isSelected = data.occasion === occasion.value;
            
            return (
              <motion.button
                key={occasion.value}
                onClick={() => handleOccasionChange(occasion.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-600 text-amber-300'
                    : 'bg-gray-800/50 border-gray-700 text-cream hover:border-amber-600/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occasion.icon}</span>
                  <div>
                    <h4 className="font-medium">{occasion.label}</h4>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Special Requests */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <MessageSquare className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Special Requests</h3>
            <p className="text-cream/70 text-sm">Any dietary requirements or special arrangements?</p>
          </div>
        </div>

        <Textarea
          placeholder="e.g., Vegetarian options, wheelchair access, quiet table, birthday cake, dietary allergies..."
          value={data.specialRequests || ''}
          onChange={(e) => handleSpecialRequestsChange(e.target.value)}
          className="bg-gray-800/50 border-gray-700 text-cream placeholder:text-cream/50 focus:border-amber-600 min-h-[120px]"
          maxLength={500}
        />
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-cream/50 text-xs">
            Help us make your dining experience perfect
          </p>
          <p className="text-cream/50 text-xs">
            {(data.specialRequests || '').length}/500
          </p>
        </div>
      </Card>

      {/* Table Layout Modal */}
      <AnimatePresence>
        {showTableLayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTableLayout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-amber-900/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-400">Restaurant Layout</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTableLayout(false)}
                  className="text-cream/70 hover:text-cream"
                >
                  ×
                </Button>
              </div>
              
              {/* Simple restaurant layout - replace with actual floor plan */}
              <div className="bg-gray-900/50 rounded-lg p-6 aspect-video flex items-center justify-center">
                <div className="text-center text-cream/50">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p>Restaurant Floor Plan</p>
                  <p className="text-sm mt-1">Interactive layout coming soon</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableSelectionStep;
