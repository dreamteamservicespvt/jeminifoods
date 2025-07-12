import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { ReservationData } from '../FourStepReservationFlow';

interface BookingDetailsStepProps {
  data: ReservationData;
  onUpdate: (updates: Partial<ReservationData>) => void;
}

// Generate available time slots
const generateTimeSlots = (selectedDate: Date | null) => {
  const slots = [];
  const now = new Date();
  const isToday = selectedDate ? isSameDay(selectedDate, now) : false;
  const currentHour = now.getHours();
  
  // Restaurant hours: 11:00 AM to 10:00 PM
  for (let hour = 11; hour <= 22; hour++) {
    // Skip past times if today is selected
    if (isToday && hour <= currentHour + 1) continue;
    
    const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
    const time24 = `${hour.toString().padStart(2, '0')}:00`;
    
    slots.push({
      value: time24,
      label: time12,
      available: Math.random() > 0.3 // Mock availability - replace with real data
    });
  }
  
  return slots;
};

// Generate calendar dates (next 30 days)
const generateCalendarDates = () => {
  const dates = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    dates.push(date);
  }
  
  return dates;
};

const BookingDetailsStep: React.FC<BookingDetailsStepProps> = ({ data, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    data.date ? new Date(data.date) : null
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots(selectedDate));

  // Update time slots when date changes
  useEffect(() => {
    setTimeSlots(generateTimeSlots(selectedDate));
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onUpdate({ 
      date: format(date, 'yyyy-MM-dd'),
      time: '' // Reset time when date changes
    });
  };

  const handleTimeSelect = (time: string) => {
    onUpdate({ time });
  };

  const handlePartySizeChange = (size: string) => {
    onUpdate({ partySize: parseInt(size) });
  };

  const calendarDates = generateCalendarDates();

  return (
    <div className="space-y-8">
      {/* Date Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <Calendar className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Select Date</h3>
            <p className="text-cream/70 text-sm">Choose your preferred dining date</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {calendarDates.slice(0, 21).map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <motion.button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-600 text-black shadow-lg'
                    : isToday
                    ? 'bg-amber-900/30 text-amber-400 border border-amber-600/50'
                    : 'bg-gray-800/50 text-cream hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <div className="text-sm font-medium">
                  {format(date, 'EEE')}
                </div>
                <div className="text-lg font-bold">
                  {format(date, 'd')}
                </div>
                <div className="text-xs opacity-70">
                  {format(date, 'MMM')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Time Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <Clock className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Select Time</h3>
            <p className="text-cream/70 text-sm">
              {selectedDate 
                ? `Available slots for ${format(selectedDate, 'EEEE, MMMM d')}`
                : 'Please select a date first'
              }
            </p>
          </div>
        </div>

        {selectedDate ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((slot) => {
              const isSelected = data.time === slot.value;
              
              return (
                <motion.button
                  key={slot.value}
                  onClick={() => slot.available && handleTimeSelect(slot.value)}
                  disabled={!slot.available}
                  whileHover={slot.available ? { scale: 1.05 } : {}}
                  whileTap={slot.available ? { scale: 0.95 } : {}}
                  className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-600 text-black shadow-lg'
                      : slot.available
                      ? 'bg-gray-800/50 text-cream hover:bg-gray-700/50 border border-gray-700 hover:border-amber-600/50'
                      : 'bg-gray-900/50 text-gray-500 border border-gray-800 cursor-not-allowed'
                  }`}
                >
                  {slot.label}
                  {!slot.available && (
                    <div className="text-xs mt-1 opacity-70">Booked</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-cream/50">
            <Clock size={48} className="mx-auto mb-4 opacity-30" />
            <p>Select a date to view available time slots</p>
          </div>
        )}
      </Card>

      {/* Party Size Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <Users className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Party Size</h3>
            <p className="text-cream/70 text-sm">How many guests will be dining?</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => {
            const isSelected = data.partySize === size;
            
            return (
              <motion.button
                key={size}
                onClick={() => handlePartySizeChange(size.toString())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-600 text-black shadow-lg'
                    : 'bg-gray-800/50 text-cream hover:bg-gray-700/50 border border-gray-700 hover:border-amber-600/50'
                }`}
              >
                <Users size={20} className="mx-auto mb-1" />
                <div className="text-sm">{size} {size === 1 ? 'Guest' : 'Guests'}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom party size for larger groups */}
        <div className="mt-4 pt-4 border-t border-amber-900/20">
          <p className="text-cream/60 text-sm text-center">
            Need a table for more than 10 guests?{' '}
            <button className="text-amber-400 hover:text-amber-300 underline">
              Contact us directly
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default BookingDetailsStep;
