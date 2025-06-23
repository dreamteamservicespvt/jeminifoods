import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvailableTimeSlotsByCapacity } from '@/lib/tableService';

interface TimeSlotSelectorProps {
  date: string;
  partySize: number;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  selectedTableId?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  partySize,
  selectedTime,
  onSelectTime,
  selectedTableId
}) => {
  const [loading, setLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{[tableId: string]: string[]}>({});
  const [error, setError] = useState<string | null>(null);
  
  // Fetch available time slots when date or party size changes
  useEffect(() => {
    async function fetchTimeSlots() {
      if (!date || !partySize) return;
      
      try {
        setLoading(true);
        const timeSlots = await getAvailableTimeSlotsByCapacity(date, partySize);
        setAvailableTimeSlots(timeSlots);
        setError(null);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Unable to load available time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTimeSlots();
  }, [date, partySize]);
  
  // Get all unique time slots across all tables
  const allTimeSlots = Array.from(
    new Set(
      Object.values(availableTimeSlots).flat()
    )
  ).sort();
  
  // Filter time slots for the selected table
  const visibleTimeSlots = selectedTableId 
    ? availableTimeSlots[selectedTableId] || [] 
    : allTimeSlots;
  
  // Group time slots by hour for better presentation
  const groupedTimeSlots: {[hour: string]: string[]} = {};
  visibleTimeSlots.forEach(time => {
    const hour = time.split(':')[0];
    if (!groupedTimeSlots[hour]) {
      groupedTimeSlots[hour] = [];
    }
    groupedTimeSlots[hour].push(time);
  });
  
  // Sort hours
  const sortedHours = Object.keys(groupedTimeSlots).sort();

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
        <Clock size={20} />
        Available Times
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full bg-amber-900/10" />
          <Skeleton className="h-16 w-full bg-amber-900/10" />
        </div>
      ) : error ? (
        <div className="p-4 border border-red-400/20 bg-red-900/10 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : visibleTimeSlots.length === 0 ? (
        <div className="p-4 border border-amber-400/20 bg-amber-900/10 rounded-lg">
          <p className="text-amber-400 text-sm">
            {selectedTableId 
              ? "No available times for the selected table. Please select a different table."
              : "No available times for this date. Please select a different date."}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`timeslots-${date}-${selectedTableId || 'all'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {sortedHours.map(hour => (
              <div key={hour} className="space-y-2">
                <h4 className="text-md font-medium text-amber-400/80">
                  {parseInt(hour) > 12 ? `${parseInt(hour) - 12}:00` : `${hour}:00`} {parseInt(hour) >= 12 ? 'PM' : 'AM'}
                </h4>
                
                <div className="grid grid-cols-4 gap-2">
                  {groupedTimeSlots[hour].map(time => {
                    const isSelected = selectedTime === time;
                    const [hourPart, minutePart] = time.split(':');
                    const displayHour = parseInt(hourPart) > 12 ? parseInt(hourPart) - 12 : hourPart;
                    const amPm = parseInt(hourPart) >= 12 ? 'PM' : 'AM';
                    
                    return (
                      <motion.button
                        key={time}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelectTime(time)}
                        className={`py-2 px-3 rounded-md border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-600 border-amber-400 text-black font-semibold'
                            : 'border-amber-600/30 hover:border-amber-500 hover:bg-amber-600/20 text-cream'
                        }`}
                      >
                        {`${displayHour}:${minutePart} ${amPm}`}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
      
      {!loading && visibleTimeSlots.length > 0 && (
        <p className="text-xs text-cream/60 italic">
          * All reservations are held for 15 minutes after the scheduled time
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;
