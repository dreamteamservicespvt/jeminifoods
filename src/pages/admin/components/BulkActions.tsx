import React, { useState } from 'react';
import { 
  CheckSquare, 
  X, 
  Check, 
  XCircle, 
  UserX, 
  Table as TableIcon,
  MessageSquare,
  Bell,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { BulkAction, Reservation } from '../../../types/reservation';
import { DiningTable } from '../../../types/tables';

interface BulkActionsProps {
  selectedReservations: string[];
  reservations: Reservation[];
  tables: DiningTable[];
  onAction: (action: BulkAction) => void;
  onClose: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedReservations,
  reservations,
  tables,
  onAction,
  onClose
}) => {
  const [actionType, setActionType] = useState<BulkAction['type'] | ''>('');
  const [selectedTable, setSelectedTable] = useState('');
  const [notes, setNotes] = useState('');

  const selectedReservationObjects = reservations.filter(r => 
    selectedReservations.includes(r.id)
  );

  const availableTables = tables.filter(table => table.isAvailable);

  const handleSubmit = () => {
    if (!actionType) return;

    const action: BulkAction = {
      type: actionType,
      reservationIds: selectedReservations,
      notes: notes || undefined
    };

    if (actionType === 'assign-table' && selectedTable) {
      action.tableId = selectedTable;
    }

    onAction(action);
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'confirm': return 'Confirm Reservations';
      case 'cancel': return 'Cancel Reservations';
      case 'reject': return 'Reject Reservations';
      case 'assign-table': return 'Assign Table';
      case 'send-reminder': return 'Send Reminders';
      case 'delete': return 'Delete Reservations';
      default: return 'Bulk Actions';
    }
  };

  const getActionDescription = () => {
    const count = selectedReservations.length;
    switch (actionType) {
      case 'confirm':
        return `Confirm ${count} reservation(s). Confirmation emails and notifications will be sent.`;
      case 'cancel':
        return `Cancel ${count} reservation(s). Cancellation notifications will be sent to guests.`;
      case 'reject':
        return `Reject ${count} reservation(s). Rejection notifications will be sent to guests.`;
      case 'assign-table':
        return `Assign selected table to ${count} reservation(s). Only pending reservations will be affected.`;
      case 'send-reminder':
        return `Send reminder notifications to ${count} guest(s) about their upcoming reservations.`;
      case 'delete':
        return `Permanently delete ${count} reservation(s). This action cannot be undone.`;
      default:
        return `Select an action to perform on ${count} reservation(s).`;
    }
  };

  const isActionValid = () => {
    if (!actionType) return false;
    if (actionType === 'assign-table' && !selectedTable) return false;
    return true;
  };

  const getActionButtonColor = () => {
    switch (actionType) {
      case 'confirm': return 'bg-green-600 hover:bg-green-700';
      case 'cancel': return 'bg-red-600 hover:bg-red-700';
      case 'reject': return 'bg-red-700 hover:bg-red-800';
      case 'assign-table': return 'bg-blue-600 hover:bg-blue-700';
      case 'send-reminder': return 'bg-amber-600 hover:bg-amber-700';
      case 'delete': return 'bg-red-800 hover:bg-red-900';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-amber-400">
            Bulk Actions ({selectedReservations.length} selected)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Reservations Summary */}
        <div className="bg-black/20 border border-amber-600/20 rounded-lg p-4 mb-6">
          <h3 className="text-amber-400 font-semibold mb-3">Selected Reservations:</h3>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {selectedReservationObjects.map(reservation => (
              <div key={reservation.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-cream font-medium">{reservation.name}</span>
                  <span className="text-gray-400">({reservation.date} at {reservation.time})</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  reservation.status === 'pending' ? 'bg-amber-400/20 text-amber-400' :
                  reservation.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                  reservation.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                  'bg-gray-400/20 text-gray-400'
                }`}>
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Select Action:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActionType('confirm')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'confirm' 
                    ? 'border-green-400 bg-green-400/10 text-green-400' 
                    : 'border-amber-600/30 hover:border-green-400/50 text-cream'
                }`}
              >
                <Check size={16} />
                <span>Confirm</span>
              </button>
              
              <button
                onClick={() => setActionType('cancel')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'cancel' 
                    ? 'border-red-400 bg-red-400/10 text-red-400' 
                    : 'border-amber-600/30 hover:border-red-400/50 text-cream'
                }`}
              >
                <XCircle size={16} />
                <span>Cancel</span>
              </button>
              
              <button
                onClick={() => setActionType('reject')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'reject' 
                    ? 'border-red-500 bg-red-500/10 text-red-500' 
                    : 'border-amber-600/30 hover:border-red-500/50 text-cream'
                }`}
              >
                <UserX size={16} />
                <span>Reject</span>
              </button>
              
              <button
                onClick={() => setActionType('assign-table')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'assign-table' 
                    ? 'border-blue-400 bg-blue-400/10 text-blue-400' 
                    : 'border-amber-600/30 hover:border-blue-400/50 text-cream'
                }`}
              >
                <TableIcon size={16} />
                <span>Assign Table</span>
              </button>
              
              <button
                onClick={() => setActionType('send-reminder')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'send-reminder' 
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                    : 'border-amber-600/30 hover:border-amber-400/50 text-cream'
                }`}
              >
                <Bell size={16} />
                <span>Send Reminder</span>
              </button>
              
              <button
                onClick={() => setActionType('delete')}
                className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  actionType === 'delete' 
                    ? 'border-red-600 bg-red-600/10 text-red-600' 
                    : 'border-amber-600/30 hover:border-red-600/50 text-cream'
                }`}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Table Selection for Assign Table Action */}
          {actionType === 'assign-table' && (
            <div>
              <label className="block text-amber-400 font-semibold mb-2">Select Table:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
              >
                <option value="">Choose a table...</option>
                {availableTables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name} - {table.capacity} seats ({table.type})
                  </option>
                ))}
              </select>
              {availableTables.length === 0 && (
                <p className="text-amber-400 text-sm mt-1">No available tables found</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">
              Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this bulk action..."
              className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2 h-20 resize-none"
            />
          </div>
        </div>

        {/* Action Description */}
        {actionType && (
          <div className={`p-4 rounded-lg border mb-6 ${
            actionType === 'delete' 
              ? 'border-red-400/40 bg-red-400/10' 
              : 'border-amber-400/40 bg-amber-400/10'
          }`}>
            <div className="flex items-start space-x-2">
              {actionType === 'delete' && <AlertTriangle size={16} className="text-red-400 mt-0.5" />}
              <div>
                <h4 className={`font-semibold ${
                  actionType === 'delete' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {getActionTitle()}
                </h4>
                <p className={`text-sm mt-1 ${
                  actionType === 'delete' ? 'text-red-300' : 'text-amber-300'
                }`}>
                  {getActionDescription()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isActionValid()}
            className={`px-6 py-2 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonColor()}`}
          >
            {actionType === 'delete' ? 'Delete Permanently' : 
             actionType === 'assign-table' ? 'Assign Table' :
             actionType === 'send-reminder' ? 'Send Reminders' :
             actionType ? `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Selected` : 'Execute Action'}
          </button>
        </div>

        {/* Warning for Delete Action */}
        {actionType === 'delete' && (
          <div className="mt-4 p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="font-semibold">Warning:</span>
            </div>
            <p className="text-red-300 text-sm mt-1">
              This action will permanently delete all selected reservations and cannot be undone. 
              Any assigned tables will be released automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions;
