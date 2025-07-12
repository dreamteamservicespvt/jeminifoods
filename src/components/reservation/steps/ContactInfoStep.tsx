import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReservationData } from '../FourStepReservationFlow';

interface ContactInfoStepProps {
  data: ReservationData;
  onUpdate: (updates: Partial<ReservationData>) => void;
}

// Validation functions
const validatePhone = (phone: string): boolean => {
  // Allow various phone formats: +91XXXXXXXXXX, XXXXXXXXXX, etc.
  const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ data, onUpdate }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof ReservationData, value: string) => {
    onUpdate({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    let error = '';
    
    switch (field) {
      case 'fullName':
        if (!validateName(data.fullName)) {
          error = 'Please enter a valid full name (at least 2 characters)';
        }
        break;
      case 'phone':
        if (!data.phone) {
          error = 'Phone number is required';
        } else if (!validatePhone(data.phone)) {
          error = 'Please enter a valid Indian mobile number';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Indian mobile number
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{5})/, '$1 $2');
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    
    return value;
  };

  const getFieldStatus = (field: string) => {
    if (!touched[field]) return 'default';
    if (errors[field]) return 'error';
    return 'success';
  };

  const isFormValid = () => {
    return validateName(data.fullName) && 
           validatePhone(data.phone);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <User className="text-amber-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-400">Contact Information</h3>
            <p className="text-cream/70 text-sm">We'll contact you via WhatsApp and phone for all reservation updates</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-cream font-medium">
              Full Name *
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={data.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`bg-gray-800/50 border text-cream placeholder:text-cream/50 focus:border-amber-600 pl-12 ${
                  getFieldStatus('fullName') === 'error' 
                    ? 'border-red-500 focus:border-red-500' 
                    : getFieldStatus('fullName') === 'success'
                    ? 'border-green-500'
                    : 'border-gray-700'
                }`}
              />
              <User 
                size={18} 
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  getFieldStatus('fullName') === 'error' 
                    ? 'text-red-400' 
                    : getFieldStatus('fullName') === 'success'
                    ? 'text-green-400'
                    : 'text-cream/50'
                }`}
              />
              {getFieldStatus('fullName') === 'success' && (
                <Check size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400" />
              )}
            </div>
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.fullName}
              </motion.p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-cream font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={data.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  handleInputChange('phone', formatted);
                }}
                onBlur={() => handleBlur('phone')}
                className={`bg-gray-800/50 border text-cream placeholder:text-cream/50 focus:border-amber-600 pl-12 ${
                  getFieldStatus('phone') === 'error' 
                    ? 'border-red-500 focus:border-red-500' 
                    : getFieldStatus('phone') === 'success'
                    ? 'border-green-500'
                    : 'border-gray-700'
                }`}
              />
              <Phone 
                size={18} 
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  getFieldStatus('phone') === 'error' 
                    ? 'text-red-400' 
                    : getFieldStatus('phone') === 'success'
                    ? 'text-green-400'
                    : 'text-cream/50'
                }`}
              />
              {getFieldStatus('phone') === 'success' && (
                <Check size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400" />
              )}
            </div>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.phone}
              </motion.p>
            )}
            <div className="flex items-start gap-2 mt-2 p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
              <MessageCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-200">
                <p className="font-medium">WhatsApp Communication</p>
                <p className="text-green-300/80 mt-1">
                  We'll send reservation confirmations, reminders, and updates directly to your WhatsApp. 
                  You can also call this number to speak with our team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Validation Summary */}
        <div className="mt-8 p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isFormValid() ? 'bg-green-600' : 'bg-amber-600'
            }`}>
              {isFormValid() ? (
                <Check size={14} className="text-black" />
              ) : (
                <AlertCircle size={14} className="text-black" />
              )}
            </div>
            <div>
              <h4 className={`font-medium ${isFormValid() ? 'text-green-400' : 'text-amber-400'}`}>
                {isFormValid() ? 'All information provided' : 'Please complete all required fields'}
              </h4>
              <p className="text-cream/70 text-sm mt-1">
                {isFormValid() 
                  ? 'Your contact information is complete and valid'
                  : 'We need this information to confirm your reservation'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-4">
        <div className="text-center text-cream/60 text-sm">
          <p>
            🔒 Your contact information is secure and will only be used for reservation management via WhatsApp and direct calls.
            We respect your privacy and won't share your details with third parties.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ContactInfoStep;
