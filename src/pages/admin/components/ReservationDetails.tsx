import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  User,
  MessageSquare,
  Table as TableIcon,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Bell
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../../../types/reservation';
import { DiningTable } from '../../../types/tables';

interface ReservationDetailsProps {
  reservation: Reservation | null;
  tables: DiningTable[];
  getStatusColor: (status: ReservationStatus) => string;
  getWhatsAppLink: (reservation: Reservation, templateId?: string) => string;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
  tables,
  getStatusColor,
  getWhatsAppLink
}) => {
  if (!reservation) {
    return (
      <div className="bg-black/30 border border-amber-600/20 p-6 text-center text-cream rounded-lg sticky top-6">
        <div className="opacity-50">
          <FileText size={48} className="mx-auto mb-4" />
          <p className="text-lg">Select a reservation to view details</p>
          <p className="text-sm text-gray-400">Click on any reservation card to see detailed information</p>
        </div>
      </div>
    );
  }

  const assignedTable = reservation.tableId ? 
    tables.find(t => t.id === reservation.tableId) : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getTimeUntilReservation = () => {
    const reservationDateTime = new Date(`${reservation.date} ${reservation.time}`);
    const now = new Date();
    const diff = reservationDateTime.getTime() - now.getTime();
    
    if (diff < 0) {
      const pastHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      const pastMinutes = Math.abs(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      return {
        isPast: true,
        text: `${pastHours}h ${pastMinutes}m ago`
      };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { isPast: false, text: `${days}d ${hours}h` };
    } else if (hours > 0) {
      return { isPast: false, text: `${hours}h ${minutes}m` };
    } else {
      return { isPast: false, text: `${minutes}m` };
    }
  };

  const timeInfo = getTimeUntilReservation();

  return (
    <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-amber-400">Reservation Details</h3>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
          {reservation.status}
        </span>
      </div>
      
      <div className="space-y-6">
        {/* Guest Information */}
        <div className="space-y-4">
          <h4 className="text-amber-400 font-semibold text-lg border-b border-amber-600/20 pb-2">
            Guest Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-amber-400 font-medium mb-1 flex items-center">
                <User size={16} className="mr-2" />
                Guest Name
              </label>
              <p className="text-cream">{reservation.name}</p>
            </div>

            <div>
              <label className="block text-amber-400 font-medium mb-1 flex items-center">
                <Phone size={16} className="mr-2" />
                Phone & WhatsApp
              </label>
              <div className="flex items-center justify-between">
                <p className="text-cream">{reservation.phone}</p>
                <div className="flex space-x-1">
                  <a
                    href={`tel:${reservation.phone}`}
                    className="bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    Call
                  </a>
                  <a
                    href={getWhatsAppLink(reservation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Information */}
        <div className="space-y-4">
          <h4 className="text-amber-400 font-semibold text-lg border-b border-amber-600/20 pb-2">
            Reservation Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-amber-400 font-medium mb-1 flex items-center">
                <Calendar size={16} className="mr-2" />
                Date
              </label>
              <p className="text-cream">{formatDate(reservation.date)}</p>
            </div>

            <div>
              <label className="block text-amber-400 font-medium mb-1 flex items-center">
                <Clock size={16} className="mr-2" />
                Time
              </label>
              <div className="flex items-center justify-between">
                <p className="text-cream">{formatTime(reservation.time)}</p>
                <div className={`text-xs px-2 py-1 rounded ${
                  timeInfo.isPast ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                }`}>
                  {timeInfo.isPast ? 'Past' : 'In'} {timeInfo.text}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-amber-400 font-medium mb-1 flex items-center">
                <Users size={16} className="mr-2" />
                Party Size
              </label>
              <p className="text-cream">{reservation.guests || 1} guests</p>
            </div>

            {/* Table Assignment */}
            {assignedTable ? (
              <div>
                <label className="block text-amber-400 font-medium mb-1 flex items-center">
                  <TableIcon size={16} className="mr-2" />
                  Assigned Table
                </label>
                <div className="bg-green-600/10 border border-green-600/20 p-3 rounded">
                  <p className="text-green-400 font-medium">{assignedTable.name}</p>
                  <p className="text-green-300 text-sm">
                    Capacity: {assignedTable.capacity} • Type: {assignedTable.type}
                  </p>
                  {assignedTable.location && (
                    <p className="text-green-300 text-sm flex items-center mt-1">
                      <MapPin size={12} className="mr-1" />
                      {assignedTable.location}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-amber-400 font-medium mb-1 flex items-center">
                  <TableIcon size={16} className="mr-2" />
                  Table Assignment
                </label>
                <div className="bg-amber-600/10 border border-amber-600/20 p-3 rounded">
                  <p className="text-amber-400 text-sm">No table assigned</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="space-y-2">
            <h4 className="text-amber-400 font-semibold text-lg border-b border-amber-600/20 pb-2">
              Special Requests
            </h4>
            <div className="bg-charcoal/50 p-3 border border-amber-600/20 rounded">
              <p className="text-cream text-sm whitespace-pre-wrap">
                {reservation.specialRequests}
              </p>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {reservation.adminNotes && (
          <div className="space-y-2">
            <h4 className="text-amber-400 font-semibold text-lg border-b border-amber-600/20 pb-2">
              Admin Notes
            </h4>
            <div className="bg-blue-600/10 p-3 border border-blue-600/20 rounded">
              <p className="text-blue-200 text-sm whitespace-pre-wrap">
                {reservation.adminNotes}
              </p>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="space-y-4">
          <h4 className="text-amber-400 font-semibold text-lg border-b border-amber-600/20 pb-2">
            System Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-amber-400 font-medium mb-1">
                Reservation ID
              </label>
              <p className="text-cream text-sm font-mono bg-charcoal/50 p-2 rounded border border-amber-600/20">
                {reservation.id}
              </p>
            </div>

            <div>
              <label className="block text-amber-400 font-medium mb-1">
                Created
              </label>
              <p className="text-cream text-sm">
                {reservation.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}
              </p>
            </div>

            {reservation.updatedAt && (
              <div>
                <label className="block text-amber-400 font-medium mb-1">
                  Last Updated
                </label>
                <p className="text-cream text-sm">
                  {reservation.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}
                </p>
              </div>
            )}

            {reservation.source && (
              <div>
                <label className="block text-amber-400 font-medium mb-1">
                  Source
                </label>
                <p className="text-cream text-sm capitalize">
                  {reservation.source}
                </p>
              </div>
            )}

            {/* Notification Status */}
            <div className="space-y-2">
              <label className="block text-amber-400 font-medium">
                Notifications
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center space-x-1 p-2 rounded ${
                  reservation.confirmationSent ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {reservation.confirmationSent ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  <span>Confirmation</span>
                </div>
                
                <div className={`flex items-center space-x-1 p-2 rounded ${
                  reservation.reminderSent ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {reservation.reminderSent ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  <span>Reminder</span>
                </div>
                
                <div className={`flex items-center space-x-1 p-2 rounded ${
                  reservation.whatsappSent ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {reservation.whatsappSent ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  <span>WhatsApp</span>
                </div>
                
                <div className={`flex items-center space-x-1 p-2 rounded ${
                  reservation.isExpired ? 'bg-red-600/20 text-red-400' : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {reservation.isExpired ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-amber-600/20">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={`tel:${reservation.phone}`}
              className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded flex items-center justify-center space-x-1 transition-colors"
            >
              <Phone size={14} />
              <span>Call</span>
            </a>
            
            <a
              href={getWhatsAppLink(reservation)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded flex items-center justify-center space-x-1 transition-colors"
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
