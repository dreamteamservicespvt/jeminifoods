/**
 * Enhanced validation utilities for the reservation system
 * Provides comprehensive form validation with user-friendly error messages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReservationValidationData {
  date?: string;
  time?: string;
  partySize?: number;
  fullName?: string;
  phone?: string;
  tableId?: string;
  tableName?: string;
}

/**
 * Validate booking details (Step 1)
 */
export function validateBookingDetails(data: ReservationValidationData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Date validation
  if (!data.date) {
    errors.push("Please select a reservation date");
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push("Reservation date cannot be in the past");
    }
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    
    if (selectedDate > maxDate) {
      warnings.push("Reservations more than 90 days in advance may require special confirmation");
    }
  }

  // Time validation
  if (!data.time) {
    errors.push("Please select a reservation time");
  } else {
    const [hours] = data.time.split(':');
    const hourNum = parseInt(hours);
    
    if (hourNum < 11 || hourNum > 22) {
      errors.push("Please select a time during our operating hours (11:00 AM - 10:00 PM)");
    }
    
    // If today is selected, check if time is in the future
    if (data.date) {
      const selectedDate = new Date(data.date);
      const today = new Date();
      
      if (selectedDate.toDateString() === today.toDateString()) {
        const currentHour = today.getHours();
        if (hourNum <= currentHour) {
          errors.push("Please select a time at least 1 hour from now");
        }
      }
    }
  }

  // Party size validation
  if (!data.partySize || data.partySize < 1) {
    errors.push("Please specify the number of guests");
  } else if (data.partySize > 12) {
    warnings.push("Large parties (12+ guests) may require special arrangements. We'll contact you to confirm.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate contact information (Step 3)
 */
export function validateContactInfo(data: ReservationValidationData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Name validation
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push("Please enter your full name (at least 2 characters)");
  } else if (data.fullName.trim().length > 50) {
    errors.push("Name is too long (maximum 50 characters)");
  }

  // Phone validation
  if (!data.phone) {
    errors.push("Please enter your phone number");
  } else {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    const cleanPhone = data.phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      errors.push("Please enter a valid phone number (at least 10 digits)");
    } else if (!phoneRegex.test(data.phone)) {
      errors.push("Please enter a valid phone number format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate complete reservation data
 */
export function validateCompleteReservation(data: ReservationValidationData): ValidationResult {
  const bookingValidation = validateBookingDetails(data);
  const contactValidation = validateContactInfo(data);

  return {
    isValid: bookingValidation.isValid && contactValidation.isValid,
    errors: [...bookingValidation.errors, ...contactValidation.errors],
    warnings: [...bookingValidation.warnings, ...contactValidation.warnings]
  };
}

/**
 * Get user-friendly error message for a specific field
 */
export function getFieldError(field: string, data: ReservationValidationData): string | null {
  switch (field) {
    case 'date':
      if (!data.date) return "Date is required";
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) return "Date cannot be in the past";
      return null;

    case 'time':
      if (!data.time) return "Time is required";
      return null;

    case 'partySize':
      if (!data.partySize || data.partySize < 1) return "Number of guests is required";
      return null;

    case 'fullName':
      if (!data.fullName || data.fullName.trim().length < 2) return "Full name is required";
      return null;

    case 'phone':
      if (!data.phone) return "Phone number is required";
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) return "Invalid phone number";
      return null;

    default:
      return null;
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Check if reservation conflicts with business hours or holidays
 */
export function checkReservationAvailability(date: string, time: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  
  // Check if it's a holiday (you can expand this list)
  const holidays = [
    '2024-12-25', // Christmas
    '2024-01-01', // New Year
    '2024-07-04', // Independence Day
    // Add more holidays as needed
  ];
  
  if (holidays.includes(date)) {
    warnings.push("This date is a holiday. Restaurant hours may be different. We'll confirm availability.");
  }
  
  // Check for special hours on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    warnings.push("Weekend reservations are popular. Book early to secure your preferred time.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
