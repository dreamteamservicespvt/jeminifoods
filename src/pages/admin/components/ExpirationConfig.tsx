import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  Bell, 
  ToggleLeft, 
  ToggleRight,
  Save,
  AlertTriangle,
  CheckCircle,
  Timer,
  Zap,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { ExpirationSettings } from '../../../types/reservation';

interface ExpirationConfigProps {
  settings: ExpirationSettings | null;
  onUpdateSettings: (updates: Partial<ExpirationSettings>) => void;
}

const ExpirationConfig: React.FC<ExpirationConfigProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [localSettings, setLocalSettings] = useState<ExpirationSettings>({
    id: 'expiration',
    isEnabled: false,
    expirationMinutes: 30,
    reminderMinutes: 60,
    autoMarkNoShow: true,
    sendExpirationNotification: true,
    updatedAt: null
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize local settings when props change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleSettingChange = (key: keyof ExpirationSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateSettings(localSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  };

  const getExpirationText = () => {
    if (localSettings.expirationMinutes < 60) {
      return `${localSettings.expirationMinutes} minutes`;
    } else {
      const hours = Math.floor(localSettings.expirationMinutes / 60);
      const minutes = localSettings.expirationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const getReminderText = () => {
    if (localSettings.reminderMinutes < 60) {
      return `${localSettings.reminderMinutes} minutes`;
    } else {
      const hours = Math.floor(localSettings.reminderMinutes / 60);
      const minutes = localSettings.reminderMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Auto-Expiration Settings</h2>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-cream transition-colors flex items-center space-x-1"
            >
              <RefreshCw size={16} />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              hasChanges 
                ? 'bg-amber-600 hover:bg-amber-700 text-black' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className={`border rounded-lg p-6 ${
        localSettings.isEnabled
          ? 'border-green-400/20 bg-green-400/5'
          : 'border-gray-600/20 bg-gray-600/5'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              localSettings.isEnabled 
                ? 'bg-green-400/10 text-green-400' 
                : 'bg-gray-600/10 text-gray-400'
            }`}>
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400">Auto-Expiration System</h3>
              <p className="text-gray-400 text-sm">
                {localSettings.isEnabled 
                  ? 'System is active and monitoring reservations' 
                  : 'System is currently disabled'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleSettingChange('isEnabled', !localSettings.isEnabled)}
            className={`p-2 rounded transition-colors ${
              localSettings.isEnabled 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {localSettings.isEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        {localSettings.isEnabled && (
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/20 p-3 rounded border border-green-400/20">
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <Timer size={14} />
                <span className="font-medium">Expiration Time</span>
              </div>
              <p className="text-cream">{getExpirationText()} after reservation time</p>
            </div>
            
            <div className="bg-black/20 p-3 rounded border border-blue-400/20">
              <div className="flex items-center space-x-2 text-blue-400 mb-1">
                <Bell size={14} />
                <span className="font-medium">Reminder Time</span>
              </div>
              <p className="text-cream">{getReminderText()} before reservation</p>
            </div>
            
            <div className="bg-black/20 p-3 rounded border border-amber-400/20">
              <div className="flex items-center space-x-2 text-amber-400 mb-1">
                <CheckCircle size={14} />
                <span className="font-medium">Auto Actions</span>
              </div>
              <p className="text-cream">
                {localSettings.autoMarkNoShow ? 'Auto mark no-show' : 'Manual only'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Settings */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Timing Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-amber-400 border-b border-amber-600/20 pb-2">
            Timing Configuration
          </h3>
          
          <div className="space-y-4">
            {/* Expiration Time */}
            <div>
              <label className="block text-amber-400 font-medium mb-2">
                Expiration Time
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={localSettings.expirationMinutes}
                  onChange={(e) => handleSettingChange('expirationMinutes', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!localSettings.isEnabled}
                />
                <div className="min-w-24 text-right">
                  <span className="text-cream font-mono">{getExpirationText()}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                How long after the reservation time to mark as expired
              </p>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-amber-400 font-medium mb-2">
                Reminder Time
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="30"
                  max="1440"
                  step="30"
                  value={localSettings.reminderMinutes}
                  onChange={(e) => handleSettingChange('reminderMinutes', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!localSettings.isEnabled}
                />
                <div className="min-w-24 text-right">
                  <span className="text-cream font-mono">{getReminderText()}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                How far in advance to send reminder notifications
              </p>
            </div>
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-amber-400 border-b border-amber-600/20 pb-2">
            Behavior Configuration
          </h3>
          
          <div className="space-y-4">
            {/* Auto Mark No-Show */}
            <div className="flex items-center justify-between p-4 bg-black/20 border border-amber-600/20 rounded-lg">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Auto Mark No-Show</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Automatically mark reservations as no-show when they expire
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('autoMarkNoShow', !localSettings.autoMarkNoShow)}
                disabled={!localSettings.isEnabled}
                className={`p-1 rounded transition-colors ${
                  localSettings.autoMarkNoShow 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-400 hover:text-gray-300'
                } ${!localSettings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {localSettings.autoMarkNoShow ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>

            {/* Send Expiration Notification */}
            <div className="flex items-center justify-between p-4 bg-black/20 border border-amber-600/20 rounded-lg">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <MessageSquare size={16} />
                  <span className="font-medium">Send Expiration Notifications</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Notify guests when their reservation has expired
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('sendExpirationNotification', !localSettings.sendExpirationNotification)}
                disabled={!localSettings.isEnabled}
                className={`p-1 rounded transition-colors ${
                  localSettings.sendExpirationNotification 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-400 hover:text-gray-300'
                } ${!localSettings.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {localSettings.sendExpirationNotification ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-6">
        <h3 className="text-blue-400 font-semibold text-lg mb-4 flex items-center space-x-2">
          <Settings size={20} />
          <span>How Auto-Expiration Works</span>
        </h3>
        
        <div className="space-y-3 text-sm text-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 font-semibold text-xs">1</span>
            </div>
            <p>
              <strong className="text-blue-400">Reminder Phase:</strong> Guests receive reminder notifications 
              {' '}{getReminderText()} before their reservation time.
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 font-semibold text-xs">2</span>
            </div>
            <p>
              <strong className="text-blue-400">Grace Period:</strong> After the reservation time, 
              the system waits {getExpirationText()} for the guest to arrive.
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 font-semibold text-xs">3</span>
            </div>
            <p>
              <strong className="text-blue-400">Auto-Expiration:</strong> If the guest hasn't arrived, 
              the reservation is {localSettings.autoMarkNoShow ? 'automatically marked as no-show' : 'marked for manual review'} 
              and any assigned table is released.
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 font-semibold text-xs">4</span>
            </div>
            <p>
              <strong className="text-blue-400">Notifications:</strong> {localSettings.sendExpirationNotification 
                ? 'Expiration notifications are sent to guests explaining the policy.' 
                : 'No expiration notifications are sent to guests.'}
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      {localSettings.isEnabled && (
        <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-semibold">Important Notes</span>
          </div>
          <ul className="text-amber-300 text-sm space-y-1 list-disc list-inside">
            <li>The system checks for expired reservations every minute</li>
            <li>Changes take effect immediately after saving</li>
            <li>Expired reservations cannot be automatically reverted</li>
            <li>Manual intervention is always possible through the reservations panel</li>
          </ul>
        </div>
      )}

      {/* Last Updated */}
      {settings?.updatedAt && (
        <div className="text-center text-gray-400 text-sm">
          Last updated: {settings.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}
        </div>
      )}
    </div>
  );
};

export default ExpirationConfig;
