import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  ToggleLeft,
  ToggleRight,
  Settings,
  Users,
  Timer,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { TimeSlot } from '../../../types/reservation';

interface TimeSlotConfigProps {
  timeSlots: TimeSlot[];
  onUpdateTimeSlot: (slotId: string, updates: Partial<TimeSlot>) => void;
}

const TimeSlotConfig: React.FC<TimeSlotConfigProps> = ({
  timeSlots,
  onUpdateTimeSlot
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    time: '',
    label: '',
    isActive: true,
    maxReservations: 10,
    duration: 120,
    bufferTime: 30,
    availableDays: [0, 1, 2, 3, 4, 5, 6] // All days by default
  });

  const DAYS_OF_WEEK = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' }
  ];

  const handleCreateSlot = async () => {
    if (!newSlot.time || !newSlot.label) return;
    
    try {
      // Create time slot logic would go here
      console.log('Creating time slot:', newSlot);
      setShowCreateModal(false);
      setNewSlot({
        time: '',
        label: '',
        isActive: true,
        maxReservations: 10,
        duration: 120,
        bufferTime: 30,
        availableDays: [0, 1, 2, 3, 4, 5, 6]
      });
    } catch (error) {
      console.error('Error creating time slot:', error);
    }
  };

  const handleUpdateSlot = async (updates: Partial<TimeSlot>) => {
    if (!editingSlot) return;
    
    try {
      onUpdateTimeSlot(editingSlot.id, updates);
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating time slot:', error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    try {
      // Delete time slot logic would go here
      console.log('Deleting time slot:', slotId);
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  const handleToggleActive = (slot: TimeSlot) => {
    onUpdateTimeSlot(slot.id, { isActive: !slot.isActive });
  };

  const handleDayToggle = (dayId: number, currentDays: number[]) => {
    if (currentDays.includes(dayId)) {
      return currentDays.filter(d => d !== dayId);
    } else {
      return [...currentDays, dayId].sort();
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysText = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return 'No days';
    
    const dayNames = days.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.short).filter(Boolean);
    return dayNames.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Time Slot Configuration</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Time Slots List */}
      <div className="grid gap-4">
        {timeSlots.map(slot => (
          <div
            key={slot.id}
            className={`bg-black/30 border rounded-lg p-6 transition-all duration-300 ${
              slot.isActive 
                ? 'border-green-400/20 hover:border-green-400/40' 
                : 'border-gray-600/20 opacity-75'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  slot.isActive ? 'bg-green-400/10 text-green-400' : 'bg-gray-600/10 text-gray-400'
                }`}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-400">{slot.label}</h3>
                  <p className="text-cream font-mono">{formatTime(slot.time)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(slot)}
                  className={`p-2 rounded transition-colors ${
                    slot.isActive 
                      ? 'text-green-400 hover:text-green-300' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {slot.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                
                <button
                  onClick={() => setEditingSlot(slot)}
                  className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-400/10"
                >
                  <Edit3 size={16} />
                </button>
                
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Users size={14} />
                  <span className="font-medium">Max Reservations</span>
                </div>
                <p className="text-cream">{slot.maxReservations || 'Unlimited'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Timer size={14} />
                  <span className="font-medium">Duration</span>
                </div>
                <p className="text-cream">{slot.duration} minutes</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Clock size={14} />
                  <span className="font-medium">Buffer Time</span>
                </div>
                <p className="text-cream">{slot.bufferTime} minutes</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Calendar size={14} />
                  <span className="font-medium">Available Days</span>
                </div>
                <p className="text-cream">{getDaysText(slot.availableDays)}</p>
              </div>
            </div>

            {/* Days of Week Display */}
            <div className="flex space-x-1 mt-4">
              {DAYS_OF_WEEK.map(day => (
                <div
                  key={day.id}
                  className={`px-2 py-1 rounded text-xs ${
                    slot.availableDays.includes(day.id)
                      ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                  }`}
                >
                  {day.short}
                </div>
              ))}
            </div>

            {!slot.isActive && (
              <div className="mt-3 flex items-center space-x-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 p-2 rounded">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">This time slot is currently disabled</span>
              </div>
            )}
          </div>
        ))}

        {timeSlots.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No time slots configured</p>
            <p className="text-sm">Add your first time slot to get started</p>
          </div>
        )}
      </div>

      {/* Create Time Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Create New Time Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Time</label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Label</label>
                <input
                  type="text"
                  value={newSlot.label}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Lunch Service, Dinner Service"
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Max Reservations</label>
                <input
                  type="number"
                  min="1"
                  value={newSlot.maxReservations}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, maxReservations: parseInt(e.target.value) }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum number of reservations for this time slot</p>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={newSlot.duration}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
                <p className="text-xs text-gray-400 mt-1">Expected dining duration</p>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Buffer Time (minutes)</label>
                <input
                  type="number"
                  min="0"
                  step="15"
                  value={newSlot.bufferTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
                <p className="text-xs text-gray-400 mt-1">Time between reservations for table cleanup</p>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-2">Available Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      onClick={() => setNewSlot(prev => ({ 
                        ...prev, 
                        availableDays: handleDayToggle(day.id, prev.availableDays || [])
                      }))}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        newSlot.availableDays?.includes(day.id)
                          ? 'bg-amber-600 text-black'
                          : 'bg-black/30 border border-amber-600/30 text-cream hover:border-amber-400'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSlot.isActive}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 rounded focus:ring-amber-400"
                />
                <label htmlFor="isActive" className="text-cream">
                  Active (available for bookings)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSlot}
                  disabled={!newSlot.time || !newSlot.label}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Time Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Edit Time Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Time</label>
                <input
                  type="time"
                  value={editingSlot.time}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, time: e.target.value }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Label</label>
                <input
                  type="text"
                  value={editingSlot.label}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Max Reservations</label>
                <input
                  type="number"
                  min="1"
                  value={editingSlot.maxReservations}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, maxReservations: parseInt(e.target.value) }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={editingSlot.duration}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, duration: parseInt(e.target.value) }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Buffer Time (minutes)</label>
                <input
                  type="number"
                  min="0"
                  step="15"
                  value={editingSlot.bufferTime}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, bufferTime: parseInt(e.target.value) }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-2">Available Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      onClick={() => setEditingSlot(prev => prev ? ({ 
                        ...prev, 
                        availableDays: handleDayToggle(day.id, prev.availableDays)
                      }) : null)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        editingSlot.availableDays.includes(day.id)
                          ? 'bg-amber-600 text-black'
                          : 'bg-black/30 border border-amber-600/30 text-cream hover:border-amber-400'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingSlot.isActive}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                  className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 rounded focus:ring-amber-400"
                />
                <label htmlFor="editIsActive" className="text-cream">
                  Active (available for bookings)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateSlot(editingSlot)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors"
                >
                  Update Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotConfig;
