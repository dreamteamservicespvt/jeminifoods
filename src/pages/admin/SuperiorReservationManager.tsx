import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  User, 
  Check, 
  X, 
  Eye,
  Search,
  Filter,
  Download,
  MessageSquare,
  Settings,
  Table as TableIcon,
  RefreshCw,
  MoreVertical,
  Trash2,
  CheckSquare,
  Square,
  Bell,
  FileText,
  Send,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { useAdminReservationNotifications } from '../../hooks/useReservationNotifications';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';
import { useToast } from '@/hooks/use-toast';

// Enhanced types
interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'booked' | 'reserved' | 'cancelled' | 'rejected' | 'expired' | 'completed' | 'no-show';
  createdAt: any;
  updatedAt?: any;
  userId?: string;
  tableId?: string;
  tableName?: string;
  adminNotes?: string;
  confirmationSent?: boolean;
  reminderSent?: boolean;
  whatsappSent?: boolean;
  source?: 'web' | 'phone' | 'walk-in' | 'admin';
  isExpired?: boolean;
}

interface DiningTable {
  id: string;
  name: string;
  capacity: number;
  type: string;
  location: string;
  isAvailable: boolean;
  description?: string;
}

interface ReservationFilters {
  status: string;
  searchTerm: string;
  tableId: string;
  source: string;
  dateRange: { start: string; end: string } | null;
}

const ITEMS_PER_PAGE = 15;

const SuperiorReservationManager = () => {
  // State management
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservations' | 'tables' | 'analytics'>('reservations');
  
  // Filters and search
  const [filters, setFilters] = useState<ReservationFilters>({
    status: 'all',
    searchTerm: '',
    tableId: 'all',
    source: 'all',
    dateRange: null
  });

  const [sortField, setSortField] = useState<'date' | 'name' | 'status' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { toast } = useToast();
  const { sendReservationConfirmation, sendReservationCancellation } = useAdminReservationNotifications();

  // Firebase listeners
  useEffect(() => {
    const unsubscribeReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      setReservations(items);
    });

    const unsubscribeTables = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiningTable[];
      setTables(items);
    });

    return () => {
      unsubscribeReservations();
      unsubscribeTables();
    };
  }, []);

  // Filter and sort reservations
  const filteredAndSortedReservations = useMemo(() => {
    let filtered = reservations;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.phone.includes(filters.searchTerm) ||
        r.id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tableId !== 'all') {
      filtered = filtered.filter(r => r.tableId === filters.tableId);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return reservationDate >= startDate && reservationDate <= endDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(`${a.date} ${a.time}`).getTime();
        bValue = new Date(`${b.date} ${b.time}`).getTime();
      } else if (sortField === 'createdAt') {
        aValue = a.createdAt?.toDate?.()?.getTime() || 0;
        bValue = b.createdAt?.toDate?.()?.getTime() || 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [reservations, filters, sortField, sortDirection]);

  // Pagination
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedReservations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedReservations, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReservations.length / ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => r.date === today);
    
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      booked: reservations.filter(r => r.status === 'booked').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      todayTotal: todayReservations.length,
      todayPending: todayReservations.filter(r => r.status === 'pending').length,
      occupiedTables: tables.filter(t => !t.isAvailable).length,
      totalTables: tables.length
    };
  }, [reservations, tables]);

  // Action handlers
  const updateReservationStatus = async (id: string, status: string, tableId?: string, notes?: string) => {
    setLoading(true);
    try {
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;

      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (notes) updateData.adminNotes = notes;
      if (tableId) updateData.tableId = tableId;

      await updateDoc(doc(db, 'reservations', id), updateData);

      // Handle table assignment/release
      if (status === 'booked' && tableId) {
        await updateDoc(doc(db, 'tables', tableId), {
          isAvailable: false,
          currentReservationId: id,
          updatedAt: serverTimestamp()
        });
      } else if (['cancelled', 'rejected', 'expired', 'completed'].includes(status) && reservation.tableId) {
        await updateDoc(doc(db, 'tables', reservation.tableId), {
          isAvailable: true,
          currentReservationId: null,
          updatedAt: serverTimestamp()
        });
      }

      // Send notifications
      if (status === 'confirmed' || status === 'booked') {
        await sendReservationConfirmation(id);
        await updateDoc(doc(db, 'reservations', id), { confirmationSent: true });
      } else if (status === 'cancelled' || status === 'rejected') {
        await sendReservationCancellation(id);
      }

      showSuccessToast({
        title: "Status Updated",
        message: `Reservation ${status} successfully.`
      });

    } catch (error) {
      console.error("Error updating reservation:", error);
      showErrorToast({
        title: "Error",
        message: "Failed to update reservation status."
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    
    setLoading(true);
    try {
      const reservation = reservations.find(r => r.id === id);
      
      if (reservation?.tableId) {
        await updateDoc(doc(db, 'tables', reservation.tableId), {
          isAvailable: true,
          currentReservationId: null,
          updatedAt: serverTimestamp()
        });
      }

      await deleteDoc(doc(db, 'reservations', id));
      
      if (selectedReservation?.id === id) {
        setSelectedReservation(null);
      }

      showSuccessToast({
        title: "Deleted",
        message: "Reservation deleted successfully."
      });

    } catch (error) {
      console.error("Error deleting reservation:", error);
      showErrorToast({
        title: "Error",
        message: "Failed to delete reservation."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'booked': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'no-show': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getWhatsAppLink = (reservation: Reservation) => {
    const message = encodeURIComponent(
      `Hello ${reservation.name},\n\nThis is Jemini Foods. We are reaching out regarding your reservation for ${reservation.date} at ${reservation.time}.\n\nReservation details:\nGuests: ${reservation.guests}\n${reservation.specialRequests ? `Special Requests: ${reservation.specialRequests}\n` : ""}Thank you!`
    );
    const cleaned = reservation.phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleaned}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      {/* Enhanced Header */}
      <div className="bg-black/30 border-b border-amber-600/20 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400">Enhanced Reservation Management</h1>
          <div className="flex items-center space-x-3">
            {selectedReservations.length > 0 && (
              <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                {selectedReservations.length} selected
              </span>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className={`bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-blue-400/10 border border-blue-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar size={20} className="text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            </div>
            <div className="text-sm text-blue-300">Total Reservations</div>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={20} className="text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            </div>
            <div className="text-sm text-amber-300">Pending Review</div>
          </div>

          <div className="bg-green-400/10 border border-green-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
            </div>
            <div className="text-sm text-green-300">Confirmed</div>
          </div>

          <div className="bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TableIcon size={20} className="text-emerald-400" />
              <div className="text-2xl font-bold text-emerald-400">{stats.booked}</div>
            </div>
            <div className="text-sm text-emerald-300">Booked (Tables)</div>
          </div>

          <div className="bg-purple-400/10 border border-purple-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">{stats.todayTotal}</div>
            </div>
            <div className="text-sm text-purple-300">Today's Total</div>
          </div>

          <div className="bg-indigo-400/10 border border-indigo-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Bell size={20} className="text-indigo-400" />
              <div className="text-2xl font-bold text-indigo-400">{stats.todayPending}</div>
            </div>
            <div className="text-sm text-indigo-300">Today Pending</div>
          </div>

          <div className="bg-red-400/10 border border-red-400/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle size={20} className="text-red-400" />
              <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
            </div>
            <div className="text-sm text-red-300">Cancelled</div>
          </div>

          <div className="bg-amber-600/10 border border-amber-600/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TableIcon size={20} className="text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">
                {stats.totalTables > 0 ? ((stats.occupiedTables / stats.totalTables) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-sm text-amber-300">Table Occupancy</div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-black/20 border border-amber-600/20 p-4 rounded-lg">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-charcoal border border-amber-600/30 rounded-lg text-cream placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>

            <select
              value={filters.tableId}
              onChange={(e) => setFilters(prev => ({ ...prev, tableId: e.target.value }))}
              className="bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
            >
              <option value="all">All Tables</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.capacity} seats)
                </option>
              ))}
            </select>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as any);
                setSortDirection(direction as any);
              }}
              className="bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="date-asc">Date (Earliest)</option>
              <option value="date-desc">Date (Latest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: prev.dateRange ? 
                    { ...prev.dateRange, start: e.target.value } :
                    { start: e.target.value, end: '' }
                }))}
                className="bg-charcoal border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: prev.dateRange ? 
                    { ...prev.dateRange, end: e.target.value } :
                    { start: '', end: e.target.value }
                }))}
                className="bg-charcoal border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Showing {paginatedReservations.length} of {filteredAndSortedReservations.length} reservations
          </p>
          
          {filteredAndSortedReservations.length > 0 && (
            <button
              onClick={() => setSelectedReservations(
                selectedReservations.length === paginatedReservations.length ? 
                [] : 
                paginatedReservations.map(r => r.id)
              )}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              {selectedReservations.length === paginatedReservations.length ? 
                <CheckSquare size={16} /> : 
                <Square size={16} />
              }
              <span>Select All</span>
            </button>
          )}
        </div>

        {/* Enhanced Reservations Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {paginatedReservations.map((reservation) => (
              <div
                key={reservation.id}
                className={`bg-black/30 border rounded-lg p-6 hover:border-amber-600/40 transition-all duration-300 ${
                  selectedReservations.includes(reservation.id) ? 'border-amber-400 bg-amber-400/5' : 'border-amber-600/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedReservations(prev => 
                        prev.includes(reservation.id) 
                          ? prev.filter(id => id !== reservation.id)
                          : [...prev, reservation.id]
                      )}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      {selectedReservations.includes(reservation.id) ? 
                        <CheckSquare size={20} /> : 
                        <Square size={20} />
                      }
                    </button>
                    <div>
                      <h3 className="text-xl font-semibold text-amber-400">{reservation.name}</h3>
                      <p className="text-xs text-gray-400">ID: {reservation.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-cream mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-amber-400" />
                    <span>{reservation.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-amber-400" />
                    <span>{reservation.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-amber-400" />
                    <span>{reservation.guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-amber-400" />
                    <span>{reservation.phone}</span>
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div className="bg-charcoal/50 p-3 rounded border border-amber-600/20 mb-4">
                    <p className="text-sm text-gray-300">
                      <strong className="text-amber-400">Special Requests:</strong> {reservation.specialRequests}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <a
                      href={`tel:${reservation.phone}`}
                      className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <Phone size={14} />
                      <span>Call</span>
                    </a>
                    <a
                      href={getWhatsAppLink(reservation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex space-x-2">
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded flex items-center space-x-1"
                          disabled={loading}
                        >
                          <Check size={14} />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded flex items-center space-x-1"
                          disabled={loading}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteReservation(reservation.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paginatedReservations.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No reservations found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-charcoal border border-amber-600/30 text-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-charcoal border border-amber-600/30 text-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded ${
                          currentPage === page
                            ? 'bg-amber-600 text-black'
                            : 'bg-charcoal border border-amber-600/30 text-cream hover:border-amber-400'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-charcoal border border-amber-600/30 text-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-charcoal border border-amber-600/30 text-cream rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400"
                >
                  Last
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Details Panel */}
          <div className="lg:col-span-1">
            {selectedReservation ? (
              <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg sticky top-6">
                <h3 className="text-xl font-bold text-amber-400 mb-6">Reservation Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 flex items-center">
                      <User size={16} className="mr-2" />
                      Guest Name
                    </label>
                    <p className="text-cream">{selectedReservation.name}</p>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 flex items-center">
                      <Phone size={16} className="mr-2" />
                      Phone & WhatsApp
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-cream">{selectedReservation.phone}</p>
                      <div className="flex space-x-1">
                        <a
                          href={`tel:${selectedReservation.phone}`}
                          className="bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded text-xs"
                        >
                          Call
                        </a>
                        <a
                          href={getWhatsAppLink(selectedReservation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-1 flex items-center">
                        <Calendar size={16} className="mr-2" />
                        Date
                      </label>
                      <p className="text-cream">{selectedReservation.date}</p>
                    </div>
                    <div>
                      <label className="block text-amber-400 font-semibold mb-1 flex items-center">
                        <Clock size={16} className="mr-2" />
                        Time
                      </label>
                      <p className="text-cream">{selectedReservation.time}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 flex items-center">
                      <Users size={16} className="mr-2" />
                      Guests
                    </label>
                    <p className="text-cream">{selectedReservation.guests}</p>
                  </div>

                  {selectedReservation.specialRequests && (
                    <div>
                      <label className="block text-amber-400 font-semibold mb-1">
                        Special Requests
                      </label>
                      <p className="text-cream bg-charcoal/50 p-3 border border-amber-600/20 rounded">
                        {selectedReservation.specialRequests}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">
                      Created
                    </label>
                    <p className="text-cream text-sm">
                      {selectedReservation.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 border border-amber-600/20 p-6 text-center text-cream rounded-lg sticky top-6">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a reservation</p>
                <p className="text-sm text-gray-400">Click on any reservation card to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperiorReservationManager;
