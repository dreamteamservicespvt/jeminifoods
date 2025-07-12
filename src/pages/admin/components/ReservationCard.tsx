import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  User, 
  Check, 
  X, 
  Eye,
  MoreVertical,
  Edit3,
  Trash2,
  Square,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../../../types/reservation';
import { DiningTable } from '../../../types/tables';

interface ReservationCardProps {
  reservation: Reservation;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onView: (reservation: Reservation) => void;
  onUpdateStatus: (id: string, status: ReservationStatus, tableId?: string, notes?: string) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: ReservationStatus) => string;
  getWhatsAppLink: (reservation: Reservation, templateId?: string) => string;
  tables: DiningTable[];
  loading: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  isSelected,
  onSelect,
  onView,
  onUpdateStatus,
  onDelete,
  getStatusColor,
  getWhatsAppLink,
  tables,
  loading
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [notes, setNotes] = useState('');

  const availableTables = tables.filter(table => 
    table.isAvailable && table.capacity >= (reservation.guests || 1)
  );

  const assignedTable = reservation.tableId ? 
    tables.find(t => t.id === reservation.tableId) : null;

  const handleStatusUpdate = (status: ReservationStatus) => {
    if (status === 'booked' && !reservation.tableId) {
      setShowTableSelect(true);
      return;
    }
    onUpdateStatus(reservation.id, status, undefined, notes || undefined);
    setShowActions(false);
  };

  const handleTableAssignment = () => {
    if (!selectedTable) return;
    onUpdateStatus(reservation.id, 'booked', selectedTable, notes || undefined);
    setShowTableSelect(false);
    setSelectedTable('');
    setNotes('');
  };

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-blue-400" />;
      case 'booked': return <CheckCircle size={16} className="text-green-400" />;
      case 'pending': return <AlertCircle size={16} className="text-amber-400" />;
      case 'cancelled': return <XCircle size={16} className="text-red-400" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      case 'expired': return <AlertTriangle size={16} className="text-gray-400" />;
      case 'completed': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'no-show': return <AlertTriangle size={16} className="text-orange-400" />;
      default: return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const isExpired = reservation.isExpired || (
    reservation.status === 'confirmed' && 
    new Date(`${reservation.date} ${reservation.time}`) < new Date()
  );

  return (
    <div className={`bg-black/30 border rounded-lg transition-all duration-300 ${
      isSelected ? 'border-amber-400 bg-amber-400/5' : 'border-amber-600/20'
    } ${isExpired ? 'opacity-75' : ''} hover:border-amber-600/40 relative`}>
      
      {/* Mobile-First Header */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <button
              onClick={() => onSelect(reservation.id, !isSelected)}
              className="text-amber-400 hover:text-amber-300 transition-colors p-1 mt-1 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-amber-400 mb-1 truncate">
                {reservation.name}
              </h3>
              <p className="text-xs text-gray-400 mb-2">ID: {reservation.id}</p>
              
              {/* Mobile Status Badge */}
              <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border items-center space-x-1 ${getStatusColor(reservation.status)} sm:hidden`}>
                {getStatusIcon(reservation.status)}
                <span className="capitalize">{reservation.status}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-2 flex-shrink-0">
            {/* Desktop Status Badge */}
            <div className={`hidden sm:flex px-3 py-1 text-xs font-semibold rounded-full border items-center space-x-1 ${getStatusColor(reservation.status)}`}>
              {getStatusIcon(reservation.status)}
              <span className="capitalize">{reservation.status}</span>
            </div>
            
            {/* Expiration Warning */}
            {isExpired && (
              <div className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full text-xs border border-orange-400/20 hidden sm:flex items-center">
                <AlertTriangle size={12} className="mr-1" />
                <span className="hidden md:inline">Expired</span>
              </div>
            )}
            
            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-gray-400 hover:text-cream p-2 rounded hover:bg-charcoal/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <MoreVertical size={18} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-12 bg-charcoal border border-amber-600/30 rounded-lg shadow-lg z-10 min-w-48">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onView(reservation);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-cream hover:bg-amber-600/10 flex items-center space-x-2 min-h-[44px]"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                    
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate('confirmed')}
                          className="w-full text-left px-4 py-3 text-sm text-green-400 hover:bg-green-400/10 flex items-center space-x-2 min-h-[44px]"
                          disabled={loading}
                        >
                          <Check size={16} />
                          <span>Confirm</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate('booked')}
                          className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-400/10 flex items-center space-x-2 min-h-[44px]"
                          disabled={loading}
                        >
                          <TableIcon size={16} />
                          <span>Book with Table</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate('rejected')}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center space-x-2 min-h-[44px]"
                          disabled={loading}
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    {['confirmed', 'booked'].includes(reservation.status) && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate('completed')}
                          className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-400/10 flex items-center space-x-2 min-h-[44px]"
                          disabled={loading}
                        >
                          <CheckCircle size={16} />
                          <span>Mark Completed</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate('no-show')}
                          className="w-full text-left px-4 py-3 text-sm text-orange-400 hover:bg-orange-400/10 flex items-center space-x-2 min-h-[44px]"
                          disabled={loading}
                        >
                          <AlertTriangle size={16} />
                          <span>Mark No-Show</span>
                        </button>
                      </>
                    )}
                    
                    {!['cancelled', 'rejected', 'completed', 'no-show'].includes(reservation.status) && (
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center space-x-2 min-h-[44px]"
                        disabled={loading}
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    )}
                    
                    <hr className="border-amber-600/20 my-1" />
                    
                    <button
                      onClick={() => {
                        onDelete(reservation.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center space-x-2 min-h-[44px]"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Expiration Warning */}
        {isExpired && (
          <div className="text-orange-400 bg-orange-400/10 px-3 py-2 rounded-lg text-sm border border-orange-400/20 mb-4 flex items-center sm:hidden">
            <AlertTriangle size={16} className="mr-2" />
            <span>This reservation has expired</span>
          </div>
        )}

        {/* Mobile-Optimized Reservation Details */}
        <div className="space-y-3 mb-4">
          {/* Date and Time - Priority Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 bg-charcoal/30 p-3 rounded-lg">
              <Calendar size={18} className="text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Date</div>
                <div className="text-sm font-medium text-cream truncate">{reservation.date}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-charcoal/30 p-3 rounded-lg">
              <Clock size={18} className="text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Time</div>
                <div className="text-sm font-medium text-cream truncate">{reservation.time}</div>
              </div>
            </div>
          </div>
          
          {/* Guests and Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 bg-charcoal/30 p-3 rounded-lg">
              <Users size={18} className="text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Guests</div>
                <div className="text-sm font-medium text-cream">{reservation.guests || 1}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-charcoal/30 p-3 rounded-lg">
              <Phone size={18} className="text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Phone</div>
                <div className="text-sm font-medium text-cream truncate">{reservation.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Assignment */}
        {assignedTable && (
          <div className="flex items-center space-x-2 text-green-400 mb-4 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
            <TableIcon size={18} className="flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Assigned Table</div>
              <div className="text-xs">{assignedTable.name} • {assignedTable.capacity} seats</div>
            </div>
          </div>
        )}

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="bg-charcoal/50 p-3 rounded-lg border border-amber-600/20 mb-4">
            <div className="text-xs text-amber-400 uppercase tracking-wide mb-1">Special Requests</div>
            <p className="text-sm text-gray-300 leading-relaxed">{reservation.specialRequests}</p>
          </div>
        )}

        {/* Admin Notes */}
        {reservation.adminNotes && (
          <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-600/20 mb-4">
            <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">Admin Notes</div>
            <p className="text-sm text-blue-200 leading-relaxed">{reservation.adminNotes}</p>
          </div>
        )}

        {/* Mobile-Optimized Contact Actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${reservation.phone}`}
            className="bg-green-700 hover:bg-green-800 text-white px-3 py-3 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors min-h-[44px]"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">Call</span>
          </a>
          
          <a
            href={getWhatsAppLink(reservation)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-3 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors min-h-[44px]"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <Loader2 size={24} className="animate-spin text-amber-400" />
        </div>
      )}

      {/* Mobile-Optimized Table Selection Modal */}
      {showTableSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-t-lg sm:rounded-lg p-4 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Assign Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-semibold mb-2 text-sm">
                  Select Table (Available for {reservation.guests || 1} guests)
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 text-base min-h-[44px]"
                >
                  <option value="">Choose a table...</option>
                  {availableTables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} - {table.capacity} seats ({table.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-2 text-sm">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any admin notes..."
                  className="w-full bg-black/30 border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 h-24 resize-none text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowTableSelect(false);
                    setSelectedTable('');
                    setNotes('');
                  }}
                  className="px-4 py-3 text-gray-400 hover:text-cream transition-colors border border-gray-600/30 rounded-lg min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTableAssignment}
                  disabled={!selectedTable}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium"
                >
                  Book Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
