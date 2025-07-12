import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  Calendar,
  Filter,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { ExportConfig, Reservation } from '../../../types/reservation';

interface ExportDialogProps {
  onExport: (config: ExportConfig) => void;
  onClose: () => void;
  reservations: Reservation[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  onExport,
  onClose,
  reservations
}) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    },
    includeFields: [
      'id',
      'name',
      'email', 
      'phone',
      'date',
      'time',
      'guests',
      'status',
      'createdAt'
    ],
    filters: {
      status: 'all',
      dateRange: null,
      searchTerm: '',
      tableId: 'all',
      source: 'all'
    }
  });

  const AVAILABLE_FIELDS = [
    { id: 'id', label: 'Reservation ID', required: true },
    { id: 'name', label: 'Guest Name', required: true },
    { id: 'email', label: 'Email Address' },
    { id: 'phone', label: 'Phone Number' },
    { id: 'date', label: 'Reservation Date', required: true },
    { id: 'time', label: 'Reservation Time', required: true },
    { id: 'guests', label: 'Number of Guests' },
    { id: 'status', label: 'Status' },
    { id: 'tableId', label: 'Table ID' },
    { id: 'tableName', label: 'Table Name' },
    { id: 'specialRequests', label: 'Special Requests' },
    { id: 'adminNotes', label: 'Admin Notes' },
    { id: 'source', label: 'Booking Source' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'updatedAt', label: 'Last Updated' },
    { id: 'confirmationSent', label: 'Confirmation Sent' },
    { id: 'reminderSent', label: 'Reminder Sent' },
    { id: 'whatsappSent', label: 'WhatsApp Sent' }
  ];

  const STATUS_OPTIONS = [
    'all',
    'pending',
    'confirmed', 
    'booked',
    'cancelled',
    'rejected',
    'expired',
    'completed',
    'no-show'
  ];

  const handleFieldToggle = (fieldId: string) => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (field?.required) return; // Don't allow toggling required fields

    setConfig(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldId)
        ? prev.includeFields.filter(f => f !== fieldId)
        : [...prev.includeFields, fieldId]
    }));
  };

  const handleSelectAll = () => {
    setConfig(prev => ({
      ...prev,
      includeFields: AVAILABLE_FIELDS.map(f => f.id)
    }));
  };

  const handleSelectNone = () => {
    setConfig(prev => ({
      ...prev,
      includeFields: AVAILABLE_FIELDS.filter(f => f.required).map(f => f.id)
    }));
  };

  const getFilteredReservationsCount = () => {
    let filtered = reservations;
    
    // Apply status filter
    if (config.filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === config.filters.status);
    }
    
    // Apply date range filter
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    filtered = filtered.filter(r => {
      const reservationDate = new Date(r.date);
      return reservationDate >= startDate && reservationDate <= endDate;
    });
    
    return filtered.length;
  };

  const handleExport = () => {
    onExport(config);
    onClose();
  };

  const isValidConfig = () => {
    return (
      config.dateRange.start &&
      config.dateRange.end &&
      config.includeFields.length > 0 &&
      new Date(config.dateRange.start) <= new Date(config.dateRange.end)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-amber-400 flex items-center space-x-2">
            <Download size={20} />
            <span>Export Reservations</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Export Format</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={config.format === 'csv'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'csv' | 'excel' }))}
                  className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 focus:ring-amber-400"
                />
                <FileText size={16} className="text-amber-400" />
                <span className="text-cream">CSV (.csv)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={config.format === 'excel'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'csv' | 'excel' }))}
                  className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 focus:ring-amber-400"
                />
                <FileText size={16} className="text-amber-400" />
                <span className="text-cream">Excel (.xlsx)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={config.dateRange.start}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={config.dateRange.end}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Status Filter</label>
            <select
              value={config.filters.status}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                filters: { ...prev.filters, status: e.target.value as any }
              }))}
              className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status} className="capitalize">
                  {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Fields Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-amber-400 font-semibold">Include Fields</label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Required Only
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-amber-600/20 rounded p-3">
              {AVAILABLE_FIELDS.map(field => {
                const isSelected = config.includeFields.includes(field.id);
                const isRequired = field.required;
                
                return (
                  <label
                    key={field.id}
                    className={`flex items-center space-x-2 cursor-pointer p-2 rounded transition-colors ${
                      isRequired ? 'bg-amber-400/10 border border-amber-400/20' : 'hover:bg-gray-600/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFieldToggle(field.id)}
                      disabled={isRequired}
                      className={`${isRequired ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      {isSelected ? 
                        <CheckSquare size={16} className="text-amber-400" /> : 
                        <Square size={16} className="text-gray-400" />
                      }
                    </button>
                    <span className={`text-sm ${isSelected ? 'text-cream' : 'text-gray-400'}`}>
                      {field.label}
                      {isRequired && <span className="text-amber-400 ml-1">*</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Required fields cannot be deselected
            </p>
          </div>

          {/* Export Summary */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText size={16} className="text-amber-400" />
              <span className="text-amber-400 font-semibold">Export Summary</span>
            </div>
            <div className="text-sm text-cream space-y-1">
              <p>Format: {config.format.toUpperCase()}</p>
              <p>Date Range: {config.dateRange.start} to {config.dateRange.end}</p>
              <p>Status Filter: {config.filters.status === 'all' ? 'All statuses' : config.filters.status}</p>
              <p>Fields: {config.includeFields.length} selected</p>
              <p className="font-semibold text-amber-400">
                Estimated Records: {getFilteredReservationsCount()}
              </p>
            </div>
          </div>

          {/* Date Range Validation */}
          {new Date(config.dateRange.start) > new Date(config.dateRange.end) && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded">
              <AlertCircle size={16} />
              <span className="text-sm">Start date must be before or equal to end date</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-amber-600/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!isValidConfig()}
            className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export {config.format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
