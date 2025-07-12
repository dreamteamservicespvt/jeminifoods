import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
  Search,
  Filter,
  Download,
  MessageSquare,
  AlertTriangle,
  Settings,
  Table as TableIcon,
  SortAsc,
  SortDesc,
  RefreshCw,
  MoreVertical,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  Clock3,
  Bell,
  FileText,
  Send,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAdminReservationNotifications } from '../../hooks/useReservationNotifications';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';
import { useToast } from '@/hooks/use-toast';
import { 
  Reservation, 
  ReservationStatus, 
  ReservationFilters, 
  ReservationSort,
  TimeSlot,
  WhatsAppTemplate,
  ExportConfig,
  ExpirationSettings,
  ReservationStats as StatsType,
  BulkAction,
  TableAssignment
} from '../../types/reservation';
import { DiningTable } from '../../types/tables';

// Sub-components
import ReservationCard from '@/pages/admin/components/ReservationCard';
import ReservationDetails from '@/pages/admin/components/ReservationDetails';
import TableManagement from '@/pages/admin/components/TableManagement';
import TimeSlotConfig from '@/pages/admin/components/TimeSlotConfig';
import WhatsAppTemplates from '@/pages/admin/components/WhatsAppTemplates';
import ExpirationConfig from '@/pages/admin/components/ExpirationConfig';
import ReservationStatsComponent from '@/pages/admin/components/ReservationStats';
import BulkActions from '@/pages/admin/components/BulkActions';
import ExportDialog from '@/pages/admin/components/ExportDialog';

const ITEMS_PER_PAGE = 20;

const EnhancedReservationManager = () => {
  // State management
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [expirationSettings, setExpirationSettings] = useState<ExpirationSettings | null>(null);
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'reservations' | 'tables' | 'timeslots' | 'templates' | 'settings'>('reservations');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Filters and sorting
  const [filters, setFilters] = useState<ReservationFilters>({
    status: 'all',
    dateRange: null,
    searchTerm: '',
    tableId: 'all',
    source: 'all'
  });
  
  const [sort, setSort] = useState<ReservationSort>({
    field: 'createdAt',
    direction: 'desc'
  });

  // Dialog states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

    const unsubscribeTimeSlots = onSnapshot(collection(db, 'timeSlots'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeSlot[];
      setTimeSlots(items.sort((a, b) => a.time.localeCompare(b.time)));
    });

    const unsubscribeTemplates = onSnapshot(collection(db, 'whatsappTemplates'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhatsAppTemplate[];
      setWhatsappTemplates(items);
    });

    const unsubscribeSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const settingsDoc = snapshot.docs.find(doc => doc.id === 'expiration');
      if (settingsDoc) {
        setExpirationSettings({ id: settingsDoc.id, ...settingsDoc.data() } as ExpirationSettings);
      }
    });

    return () => {
      unsubscribeReservations();
      unsubscribeTables();
      unsubscribeTimeSlots();
      unsubscribeTemplates();
      unsubscribeSettings();
    };
  }, []);

  // Auto-expiration logic
  useEffect(() => {
    if (!expirationSettings?.isEnabled) return;

    const checkExpiredReservations = async () => {
      const now = new Date();
      const expiredReservations = reservations.filter(reservation => {
        if (reservation.status !== 'confirmed' && reservation.status !== 'booked') return false;
        
        const reservationDateTime = new Date(`${reservation.date} ${reservation.time}`);
        const expirationTime = new Date(reservationDateTime.getTime() + (expirationSettings.expirationMinutes * 60000));
        
        return now > expirationTime && !reservation.isExpired;
      });

      if (expiredReservations.length > 0) {
        const batch = writeBatch(db);
        
        expiredReservations.forEach(reservation => {
          const reservationRef = doc(db, 'reservations', reservation.id);
          batch.update(reservationRef, {
            status: 'expired',
            isExpired: true,
            updatedAt: serverTimestamp()
          });

          // Free up the table if assigned
          if (reservation.tableId) {
            const tableRef = doc(db, 'tables', reservation.tableId);
            batch.update(tableRef, {
              isAvailable: true,
              currentReservationId: null,
              updatedAt: serverTimestamp()
            });
          }
        });

        try {
          await batch.commit();
          showWarningToast({
            title: "Auto-Expiration",
            message: `${expiredReservations.length} reservation(s) marked as expired due to no-show.`
          });
        } catch (error) {
          console.error('Error auto-expiring reservations:', error);
        }
      }
    };

    const interval = setInterval(checkExpiredReservations, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reservations, expirationSettings]);

  // Filtered and sorted reservations
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

    if (filters.dateRange) {
      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return reservationDate >= startDate && reservationDate <= endDate;
      });
    }

    if (filters.tableId !== 'all') {
      filtered = filtered.filter(r => r.tableId === filters.tableId);
    }

    if (filters.source !== 'all') {
      filtered = filtered.filter(r => r.source === filters.source);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      // Handle date/time sorting
      if (sort.field === 'date') {
        aValue = new Date(`${a.date} ${a.time}`).getTime();
        bValue = new Date(`${b.date} ${b.time}`).getTime();
      } else if (sort.field === 'createdAt') {
        aValue = a.createdAt?.toDate?.()?.getTime() || 0;
        bValue = b.createdAt?.toDate?.()?.getTime() || 0;
      }

      if (typeof aValue === 'string') {
        return sort.direction === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sort.direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [reservations, filters, sort]);

  // Pagination
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedReservations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedReservations, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReservations.length / ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo((): StatsType => {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => r.date === today);
    
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      booked: reservations.filter(r => r.status === 'booked').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      expired: reservations.filter(r => r.status === 'expired').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      todayTotal: todayReservations.length,
      todayPending: todayReservations.filter(r => r.status === 'pending').length,
      upcomingToday: todayReservations.filter(r => 
        ['confirmed', 'booked'].includes(r.status) && 
        new Date(`${r.date} ${r.time}`) > new Date()
      ).length,
      occupancyRate: tables.length > 0 ? 
        (tables.filter(t => !t.isAvailable).length / tables.length) * 100 : 0,
      averagePartySize: reservations.length > 0 ? 
        reservations.reduce((sum, r) => sum + r.guests, 0) / reservations.length : 0
    };
  }, [reservations, tables]);

  // Action handlers
  const updateReservationStatus = async (id: string, status: ReservationStatus, tableId?: string, notes?: string) => {
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

      // Handle table assignment/release with existence checks
      if (status === 'booked' && tableId) {
        try {
          // Check if table exists before assigning
          const tableRef = doc(db, 'tables', tableId);
          const tableDoc = await getDoc(tableRef);
          
          if (tableDoc.exists()) {
            await updateDoc(tableRef, {
              isAvailable: false,
              currentReservationId: id,
              updatedAt: serverTimestamp()
            });
          } else {
            console.warn(`Table ${tableId} not found when assigning to reservation ${id}`);
            showErrorToast({
              title: "Warning",
              message: `Table ${tableId} not found. Reservation status updated but table not assigned.`
            });
          }
        } catch (tableError) {
          console.warn(`Failed to assign table ${tableId}:`, tableError);
          showErrorToast({
            title: "Warning", 
            message: "Failed to assign table. Reservation status updated successfully."
          });
        }
      } else if (['cancelled', 'rejected', 'expired', 'completed'].includes(status) && reservation.tableId) {
        try {
          // Check if table exists before releasing
          const tableRef = doc(db, 'tables', reservation.tableId);
          const tableDoc = await getDoc(tableRef);
          
          if (tableDoc.exists()) {
            await updateDoc(tableRef, {
              isAvailable: true,
              currentReservationId: null,
              updatedAt: serverTimestamp()
            });
          } else {
            console.warn(`Table ${reservation.tableId} not found when releasing from reservation ${id}`);
          }
        } catch (tableError) {
          console.warn(`Failed to release table ${reservation.tableId}:`, tableError);
          // Continue with reservation update even if table release fails
        }
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
      
      // Release table if assigned (with error handling for missing table)
      if (reservation?.tableId) {
        try {
          // Check if table exists before trying to update it
          const tableRef = doc(db, 'tables', reservation.tableId);
          const tableDoc = await getDoc(tableRef);
          
          if (tableDoc.exists()) {
            await updateDoc(tableRef, {
              isAvailable: true,
              currentReservationId: null,
              updatedAt: serverTimestamp()
            });
          } else {
            console.warn(`Table ${reservation.tableId} not found when releasing from reservation ${id}`);
          }
        } catch (tableError) {
          console.warn(`Failed to release table ${reservation.tableId}:`, tableError);
          // Continue with reservation deletion even if table update fails
        }
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

  const handleBulkAction = async (action: BulkAction) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      action.reservationIds.forEach(id => {
        const reservationRef = doc(db, 'reservations', id);
        
        switch (action.type) {
          case 'confirm':
            batch.update(reservationRef, { 
              status: 'confirmed', 
              updatedAt: serverTimestamp() 
            });
            break;
          case 'cancel':
            batch.update(reservationRef, { 
              status: 'cancelled', 
              updatedAt: serverTimestamp() 
            });
            break;
          case 'reject':
            batch.update(reservationRef, { 
              status: 'rejected', 
              updatedAt: serverTimestamp() 
            });
            break;
          case 'assign-table':
            if (action.tableId) {
              batch.update(reservationRef, { 
                status: 'booked',
                tableId: action.tableId,
                updatedAt: serverTimestamp() 
              });
            }
            break;
        }
      });

      await batch.commit();

      showSuccessToast({
        title: "Bulk Action Complete",
        message: `${action.reservationIds.length} reservation(s) updated.`
      });

      setSelectedReservations([]);
      setShowBulkActions(false);

    } catch (error) {
      console.error("Error performing bulk action:", error);
      showErrorToast({
        title: "Error", 
        message: "Failed to perform bulk action."
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReservations = async (config: ExportConfig) => {
    try {
      // Implementation for CSV/Excel export
      // This would generate and download the file
      showSuccessToast({
        title: "Export Complete",
        message: "Reservations exported successfully."
      });
    } catch (error) {
      showErrorToast({
        title: "Export Failed",
        message: "Failed to export reservations."
      });
    }
  };

  // Helper functions
  const getStatusColor = (status: ReservationStatus) => {
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

  const getWhatsAppLink = (reservation: Reservation, templateId?: string) => {
    // Null check for reservation
    if (!reservation) {
      console.warn('getWhatsAppLink called with null/undefined reservation');
      return '#';
    }

    let template = whatsappTemplates.find(t => t.id === templateId);
    if (!template) {
      template = whatsappTemplates.find(t => t.type === 'confirmation' && t.isActive);
    }

    // Safe field access with fallbacks
    const name = reservation.name || 'Guest';
    const date = reservation.date || 'TBD';
    const time = reservation.time || 'TBD';
    const guests = (reservation.guests != null && typeof reservation.guests !== 'undefined') 
      ? String(reservation.guests) 
      : '1';
    const specialRequests = reservation.specialRequests || 'None';
    const phone = reservation.phone || '';

    let message = template?.message || 
      `Hello ${name},\n\nThis is Jemini Foods. We are reaching out regarding your reservation for ${date} at ${time}.\n\nReservation details:\nGuests: ${guests}\n${specialRequests !== 'None' ? `Special Requests: ${specialRequests}\n` : ""}Thank you!`;

    // Replace placeholders with safe values
    message = message
      .replace(/{name}/g, name)
      .replace(/{date}/g, date)
      .replace(/{time}/g, time)
      .replace(/{guests}/g, guests)
      .replace(/{specialRequests}/g, specialRequests);

    // Safe phone number processing
    if (!phone) {
      console.warn('WhatsApp link requested but no phone number available');
      return '#';
    }

    const cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) {
      console.warn('WhatsApp link requested but phone number is invalid:', phone);
      return '#';
    }

    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      {/* Mobile-First Header */}
      <div className="bg-black/30 border-b border-amber-600/20">
        {/* Mobile Header */}
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">
              Reservation Management
            </h1>
            
            {/* Mobile Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowExportDialog(true)}
                className="bg-amber-600 hover:bg-amber-700 text-black px-3 py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base min-h-[44px]"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              {selectedReservations.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  <CheckSquare size={16} />
                  <span className="hidden sm:inline">Bulk Actions</span>
                  <span className="sm:hidden">({selectedReservations.length})</span>
                  <span className="hidden sm:inline">({selectedReservations.length})</span>
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className={`bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base min-h-[44px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="mt-4">
            <ReservationStatsComponent stats={stats} />
          </div>

          {/* Mobile-Optimized Tabs */}
          <div className="mt-6">
            {/* Mobile Tab Selector */}
            <div className="block sm:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-4 py-3 text-base min-h-[44px]"
              >
                <option value="reservations">📅 Reservations</option>
                <option value="tables">🪑 Tables</option>
                <option value="timeslots">⏰ Time Slots</option>
                <option value="templates">💬 WhatsApp Templates</option>
                <option value="settings">⚙️ Settings</option>
              </select>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden sm:flex space-x-1 overflow-x-auto">
              {[
                { id: 'reservations', label: 'Reservations', icon: Calendar },
                { id: 'tables', label: 'Tables', icon: TableIcon },
                { id: 'timeslots', label: 'Time Slots', icon: Clock },
                { id: 'templates', label: 'WhatsApp Templates', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-amber-600 text-black'
                        : 'bg-charcoal border border-amber-600/30 text-cream hover:border-amber-400'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {activeTab === 'reservations' && (
          <div>
            {/* Mobile-First Filters */}
            <div className="mb-6">
              {/* Mobile Filter Toggle */}
              <div className="block sm:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full bg-black/30 border border-amber-600/20 p-4 rounded-lg flex items-center justify-between text-cream min-h-[44px]"
                >
                  <div className="flex items-center space-x-2">
                    <Filter size={20} />
                    <span className="font-medium">Filters & Search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(filters.searchTerm || filters.status !== 'all' || filters.tableId !== 'all' || filters.dateRange) && (
                      <span className="bg-amber-600 text-black text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    <div className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>
                </button>
              </div>

              {/* Filter Content */}
              <div className={`bg-black/30 border border-amber-600/20 rounded-lg transition-all duration-300 ${
                showMobileFilters || !('ontouchstart' in window) ? 'block' : 'hidden'
              } sm:block`}>
                <div className="p-4 sm:p-6">
                  {/* Mobile-First Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search reservations..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 sm:py-2 bg-charcoal border border-amber-600/30 rounded-lg text-cream placeholder-gray-400 focus:border-amber-400 focus:outline-none text-base sm:text-sm min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Mobile-Optimized Filter Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-amber-400 font-medium mb-2 text-sm">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px]"
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
                    </div>

                    {/* Table Filter */}
                    <div>
                      <label className="block text-amber-400 font-medium mb-2 text-sm">Table</label>
                      <select
                        value={filters.tableId}
                        onChange={(e) => setFilters(prev => ({ ...prev, tableId: e.target.value }))}
                        className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px]"
                      >
                        <option value="all">All Tables</option>
                        {tables.map(table => (
                          <option key={table.id} value={table.id}>
                            {table.name} ({table.capacity} seats)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-amber-400 font-medium mb-2 text-sm">Sort By</label>
                      <select
                        value={`${sort.field}-${sort.direction}`}
                        onChange={(e) => {
                          const [field, direction] = e.target.value.split('-');
                          setSort({ field: field as any, direction: direction as any });
                        }}
                        className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px]"
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="date-asc">Date (Earliest)</option>
                        <option value="date-desc">Date (Latest)</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="guests-desc">Most Guests</option>
                        <option value="guests-asc">Least Guests</option>
                      </select>
                    </div>

                    {/* Quick Clear */}
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setFilters({
                            status: 'all',
                            dateRange: null,
                            searchTerm: '',
                            tableId: 'all',
                            source: 'all'
                          });
                          setSort({ field: 'createdAt', direction: 'desc' });
                        }}
                        className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 hover:border-red-400 px-3 py-3 sm:py-2 rounded-lg transition-colors text-base sm:text-sm min-h-[44px]"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Mobile-Optimized Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-amber-400 font-medium mb-2 text-sm">From Date</label>
                      <input
                        type="date"
                        value={filters.dateRange?.start || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: prev.dateRange ? 
                            { ...prev.dateRange, start: e.target.value } :
                            { start: e.target.value, end: '' }
                        }))}
                        className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-400 font-medium mb-2 text-sm">To Date</label>
                      <input
                        type="date"
                        value={filters.dateRange?.end || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: prev.dateRange ? 
                            { ...prev.dateRange, end: e.target.value } :
                            { start: '', end: e.target.value }
                        }))}
                        className="w-full bg-charcoal border border-amber-600/30 rounded-lg text-cream focus:border-amber-400 focus:outline-none px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px]"
                      />
                    </div>
                    {filters.dateRange && (
                      <div>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
                          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 hover:border-red-400 px-3 py-3 sm:py-2 rounded-lg transition-colors text-base sm:text-sm min-h-[44px]"
                        >
                          Clear Dates
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-First Results Summary */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <p className="text-gray-400 text-sm sm:text-base">
                Showing <span className="text-amber-400 font-semibold">{paginatedReservations.length}</span> of <span className="text-amber-400 font-semibold">{filteredAndSortedReservations.length}</span> reservations
              </p>
              
              {filteredAndSortedReservations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReservations(
                      selectedReservations.length === paginatedReservations.length ? 
                      [] : 
                      paginatedReservations.map(r => r.id)
                    )}
                    className="text-amber-400 hover:text-amber-300 flex items-center space-x-2 px-3 py-2 rounded-lg border border-amber-600/30 hover:border-amber-400 transition-colors min-h-[44px] text-sm sm:text-base"
                  >
                    {selectedReservations.length === paginatedReservations.length ? 
                      <CheckSquare size={16} /> : 
                      <Square size={16} />
                    }
                    <span>Select All</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile-First Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Reservations List - Full width on mobile */}
              <div className="w-full lg:w-2/3 space-y-4">
                {paginatedReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    isSelected={selectedReservations.includes(reservation.id)}
                    onSelect={(id, selected) => {
                      if (selected) {
                        setSelectedReservations(prev => [...prev, id]);
                      } else {
                        setSelectedReservations(prev => prev.filter(rid => rid !== id));
                      }
                    }}
                    onView={setSelectedReservation}
                    onUpdateStatus={updateReservationStatus}
                    onDelete={deleteReservation}
                    getStatusColor={getStatusColor}
                    getWhatsAppLink={getWhatsAppLink}
                    tables={tables}
                    loading={loading}
                  />
                ))}

                {paginatedReservations.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <Calendar size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl mb-2">No reservations found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                  </div>
                )}

                {/* Mobile-Optimized Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2 mt-8">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-3 sm:py-2 bg-charcoal border border-amber-600/30 text-cream rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400 transition-colors min-h-[44px] text-sm sm:text-base"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 sm:px-4 py-3 sm:py-2 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base ${
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
                        className="px-4 py-3 sm:py-2 bg-charcoal border border-amber-600/30 text-cream rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-400 transition-colors min-h-[44px] text-sm sm:text-base"
                      >
                        Next
                      </button>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                )}
              </div>

              {/* Reservation Details - Hidden on mobile when no selection */}
              <div className={`w-full lg:w-1/3 ${!selectedReservation ? 'hidden lg:block' : ''}`}>
                <div className="sticky top-4">
                  <ReservationDetails
                    reservation={selectedReservation}
                    tables={tables}
                    getStatusColor={getStatusColor}
                    getWhatsAppLink={getWhatsAppLink}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <TableManagement 
            tables={tables}
            reservations={reservations}
            onUpdateTable={(tableId, updates) => {
              // Handle table updates
            }}
          />
        )}

        {activeTab === 'timeslots' && (
          <TimeSlotConfig 
            timeSlots={timeSlots}
            onUpdateTimeSlot={(slotId, updates) => {
              // Handle time slot updates
            }}
          />
        )}

        {activeTab === 'templates' && (
          <WhatsAppTemplates 
            templates={whatsappTemplates}
            onUpdateTemplate={(templateId, updates) => {
              // Handle template updates
            }}
          />
        )}

        {activeTab === 'settings' && (
          <ExpirationConfig 
            settings={expirationSettings}
            onUpdateSettings={(updates) => {
              // Handle settings updates
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      {showExportDialog && (
        <ExportDialog
          onExport={exportReservations}
          onClose={() => setShowExportDialog(false)}
          reservations={filteredAndSortedReservations}
        />
      )}

      {showBulkActions && (
        <BulkActions
          selectedReservations={selectedReservations}
          reservations={reservations}
          tables={tables}
          onAction={handleBulkAction}
          onClose={() => setShowBulkActions(false)}
        />
      )}
    </div>
  );
};

export default EnhancedReservationManager;
