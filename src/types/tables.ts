// Table types for the reservation system

export interface DiningTable {
  id: string;
  name: string;
  capacity: number;
  type: TableType;
  location: TableLocation;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
}

export enum TableType {
  REGULAR = 'regular',
  BOOTH = 'booth',
  COUNTER = 'counter',
  PRIVATE = 'private',
  OUTDOOR = 'outdoor'
}

export enum TableLocation {
  WINDOW = 'window',
  INTERIOR = 'interior',
  BAR = 'bar',
  OUTDOOR_PATIO = 'outdoor_patio',
  PRIVATE_ROOM = 'private_room'
}

// Table availability information
export interface TableAvailability {
  tableId: string;
  date: string;
  availableTimeSlots: string[];
  bookedTimeSlots: {
    time: string;
    reservationId: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }[];
}

// Table selection for reservation
export interface TableSelection {
  tableId: string;
  tableName: string;
  tableType: TableType;
  tableLocation: TableLocation;
  capacity: number;
  date: string;
  time: string;
}

// Table category for grouping tables
export interface TableCategory {
  id: string;
  name: string;
  description: string;
  capacity: number;
  tables: DiningTable[];
  available: number;
  imageUrl?: string;
}
