import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { DiningTable, TableAvailability, TableCategory, TableType } from '../types/tables';
import { formatISO } from 'date-fns';

// Fetch all table categories with availability information
export async function getTableCategories(date: string): Promise<TableCategory[]> {
  try {
    // Get all tables
    const tablesSnapshot = await getDocs(collection(db, 'tables'));
    const tables = tablesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DiningTable[];

    // Get availability for the selected date
    const availabilityQuery = query(
      collection(db, 'tableAvailability'),
      where('date', '==', date)
    );
    const availabilitySnapshot = await getDocs(availabilityQuery);
    const availabilityMap = new Map();
    
    availabilitySnapshot.docs.forEach(doc => {
      const data = doc.data() as TableAvailability;
      availabilityMap.set(data.tableId, data);
    });

    // Group tables by capacity and calculate availability
    const categoriesMap = new Map<number, TableCategory>();
    
    tables.forEach(table => {
      const capacity = table.capacity;
      
      // Check if table is available based on availability data
      const availabilityData = availabilityMap.get(table.id);
      const isAvailable = availabilityData ? availabilityData.availableTimeSlots.length > 0 : true;
      
      if (!categoriesMap.has(capacity)) {
        categoriesMap.set(capacity, {
          id: capacity.toString(),
          name: `${capacity}-Seater Table`,
          description: `Comfortable table for ${capacity} ${capacity === 1 ? 'person' : 'people'}`,
          capacity,
          tables: [],
          available: 0,
          imageUrl: getTableImageForCapacity(capacity)
        });
      }
      
      const category = categoriesMap.get(capacity);
      category.tables.push({...table, isAvailable});
      
      if (isAvailable) {
        category.available += 1;
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.capacity - b.capacity);
  } catch (error) {
    console.error('Error fetching table categories:', error);
    throw error;
  }
}

// Get available time slots for a specific table on a specific date
export async function getTableAvailability(tableId: string, date: string): Promise<TableAvailability | null> {
  try {
    const availabilityQuery = query(
      collection(db, 'tableAvailability'),
      where('tableId', '==', tableId),
      where('date', '==', date)
    );
    
    const availabilitySnapshot = await getDocs(availabilityQuery);
    
    if (availabilitySnapshot.empty) {
      // No availability record for this date - create default time slots
      const defaultAvailability: TableAvailability = {
        tableId,
        date,
        availableTimeSlots: getDefaultTimeSlots(),
        bookedTimeSlots: []
      };
      
      await addDoc(collection(db, 'tableAvailability'), defaultAvailability);
      return defaultAvailability;
    }
    
    return {
      id: availabilitySnapshot.docs[0].id,
      ...availabilitySnapshot.docs[0].data()
    } as TableAvailability & { id: string };
  } catch (error) {
    console.error('Error fetching table availability:', error);
    return null;
  }
}

// Book a table for a specific time
export async function bookTable(tableId: string, date: string, time: string, reservationId: string): Promise<boolean> {
  try {
    // Get current availability
    const availabilityQuery = query(
      collection(db, 'tableAvailability'),
      where('tableId', '==', tableId),
      where('date', '==', date)
    );
    
    const availabilitySnapshot = await getDocs(availabilityQuery);
    
    let availabilityId;
    let currentAvailability;
    
    if (availabilitySnapshot.empty) {
      // Create new availability record
      const defaultAvailability: TableAvailability = {
        tableId,
        date,
        availableTimeSlots: getDefaultTimeSlots(),
        bookedTimeSlots: []
      };
      
      const docRef = await addDoc(collection(db, 'tableAvailability'), defaultAvailability);
      availabilityId = docRef.id;
      currentAvailability = defaultAvailability;
    } else {
      availabilityId = availabilitySnapshot.docs[0].id;
      currentAvailability = availabilitySnapshot.docs[0].data() as TableAvailability;
    }
    
    // Check if time slot is available
    if (!currentAvailability.availableTimeSlots.includes(time)) {
      return false;
    }
    
    // Update availability
    const updatedAvailableSlots = currentAvailability.availableTimeSlots.filter(slot => slot !== time);
    const updatedBookedSlots = [
      ...currentAvailability.bookedTimeSlots,
      {
        time,
        reservationId,
        status: 'pending'
      }
    ];
    
    await updateDoc(doc(db, 'tableAvailability', availabilityId), {
      availableTimeSlots: updatedAvailableSlots,
      bookedTimeSlots: updatedBookedSlots
    });
    
    return true;
  } catch (error) {
    console.error('Error booking table:', error);
    return false;
  }
}

// Get available time slots for all tables of a specific capacity
export async function getAvailableTimeSlotsByCapacity(
  date: string, 
  partySize: number
): Promise<{[tableId: string]: string[]}> {
  try {
    // Get tables that can accommodate the party size
    const tablesQuery = query(
      collection(db, 'tables'),
      where('capacity', '>=', partySize)
    );
    
    const tablesSnapshot = await getDocs(tablesQuery);
    const tableIds = tablesSnapshot.docs.map(doc => doc.id);
    
    // Get availability for all relevant tables
    const availabilityResults: {[tableId: string]: string[]} = {};
    
    for (const tableId of tableIds) {
      const availability = await getTableAvailability(tableId, date);
      if (availability) {
        availabilityResults[tableId] = availability.availableTimeSlots;
      }
    }
    
    return availabilityResults;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return {};
  }
}

// Get total tables count by capacity
export async function getTableCountByCapacity(): Promise<{[capacity: number]: number}> {
  try {
    const tablesSnapshot = await getDocs(collection(db, 'tables'));
    const countByCapacity: {[capacity: number]: number} = {};
    
    tablesSnapshot.docs.forEach(doc => {
      const table = doc.data() as DiningTable;
      
      if (!countByCapacity[table.capacity]) {
        countByCapacity[table.capacity] = 0;
      }
      
      countByCapacity[table.capacity]++;
    });
    
    return countByCapacity;
  } catch (error) {
    console.error('Error getting table counts:', error);
    return {};
  }
}

// Update reservation status and table availability
export async function updateReservationStatus(
  reservationId: string, 
  status: 'confirmed' | 'cancelled',
  tableId?: string,
  date?: string
): Promise<boolean> {
  try {
    // Update reservation status
    await updateDoc(doc(db, 'reservations', reservationId), { status });
    
    // If table info is provided and status is cancelled, make the table available again
    if (tableId && date && status === 'cancelled') {
      // Get current availability
      const availabilityQuery = query(
        collection(db, 'tableAvailability'),
        where('tableId', '==', tableId),
        where('date', '==', date)
      );
      
      const availabilitySnapshot = await getDocs(availabilityQuery);
      
      if (!availabilitySnapshot.empty) {
        const availabilityId = availabilitySnapshot.docs[0].id;
        const currentAvailability = availabilitySnapshot.docs[0].data() as TableAvailability;
        
        // Find the booked slot with this reservationId
        const bookedSlot = currentAvailability.bookedTimeSlots.find(
          slot => slot.reservationId === reservationId
        );
        
        if (bookedSlot) {
          // Add the time back to available slots
          const updatedAvailableSlots = [...currentAvailability.availableTimeSlots, bookedSlot.time];
          
          // Remove from booked slots
          const updatedBookedSlots = currentAvailability.bookedTimeSlots.filter(
            slot => slot.reservationId !== reservationId
          );
          
          await updateDoc(doc(db, 'tableAvailability', availabilityId), {
            availableTimeSlots: updatedAvailableSlots,
            bookedTimeSlots: updatedBookedSlots
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }
}

// Helper function to get default time slots for a day
function getDefaultTimeSlots(): string[] {
  return [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];
}

// Helper function to get appropriate image for a table category
function getTableImageForCapacity(capacity: number): string {
  switch(capacity) {
    case 1:
      return '/images/tables/1-seater.jpg';
    case 2:
      return '/images/tables/2-seater.jpg';
    case 4:
      return '/images/tables/4-seater.jpg';
    case 6:
      return '/images/tables/6-seater.jpg';
    case 8:
      return '/images/tables/8-seater.jpg';
    default:
      return '/images/tables/large-table.jpg';
  }
}
