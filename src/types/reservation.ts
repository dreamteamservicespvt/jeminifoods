// Enhanced reservation types for the admin management system

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: any;
  updatedAt?: any;
  userId?: string;
  tableId?: string;
  tableName?: string;
  expiresAt?: any;
  isExpired?: boolean;
  noShowMarked?: boolean;
  adminNotes?: string;
  confirmationSent?: boolean;
  reminderSent?: boolean;
  whatsappSent?: boolean;
  source?: 'web' | 'phone' | 'walk-in' | 'admin';
}

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'booked'     // Table assigned and confirmed
  | 'reserved'   // Table temporarily held
  | 'cancelled' 
  | 'rejected'
  | 'expired'    // No-show after expiration time
  | 'completed'  // Successfully completed meal
  | 'no-show';   // Manually marked no-show

export interface ReservationFilters {
  status: ReservationStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  } | null;
  searchTerm: string;
  tableId: string | 'all';
  source: string | 'all';
}

export interface ReservationSort {
  field: 'date' | 'time' | 'name' | 'guests' | 'status' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Time slot configuration
export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
  maxReservations?: number;
  duration: number; // in minutes
  bufferTime: number; // cleanup time between slots
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  createdAt: any;
  updatedAt?: any;
}

// WhatsApp message templates
export interface WhatsAppTemplate {
  id: string;
  name: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'no-show' | 'custom';
  title: string;
  message: string;
  isActive: boolean;
  placeholders: string[]; // Available placeholders like {name}, {date}, {time}
  createdAt: any;
  updatedAt?: any;
}

// Export report configuration
export interface ExportConfig {
  format: 'csv' | 'excel';
  dateRange: {
    start: string;
    end: string;
  };
  includeFields: string[];
  filters: ReservationFilters;
}

// Auto-expiration settings
export interface ExpirationSettings {
  id: string;
  isEnabled: boolean;
  expirationMinutes: number; // Minutes after reservation time to mark as expired
  reminderMinutes: number; // Minutes before reservation to send reminder
  autoMarkNoShow: boolean;
  sendExpirationNotification: boolean;
  updatedAt: any;
}

// Dashboard statistics
export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  booked: number;
  cancelled: number;
  expired: number;
  completed: number;
  todayTotal: number;
  todayPending: number;
  upcomingToday: number;
  occupancyRate: number;
  averagePartySize: number;
}

// Bulk action types
export interface BulkAction {
  type: 'confirm' | 'cancel' | 'reject' | 'delete' | 'assign-table' | 'send-reminder';
  reservationIds: string[];
  tableId?: string; // For table assignment
  notes?: string;
}

// Table assignment for reservations
export interface TableAssignment {
  reservationId: string;
  tableId: string;
  tableName: string;
  assignedAt: any;
  assignedBy: string; // Admin user ID
  notes?: string;
}
