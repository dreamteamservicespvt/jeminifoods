import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Phone, 
  Volume2, 
  VolumeX,
  Settings,
  Save,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface NotificationSettings {
  // In-app notifications
  inAppNotifications: boolean;
  soundEnabled: boolean;
  
  // WhatsApp notifications
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappVerified: boolean;
  
  // Phone call preferences
  phoneCallsEnabled: boolean;
  phoneNumber: string;
  callTimePreference: 'anytime' | 'business-hours' | 'emergency-only';
  
  // Specific notification types
  reservationUpdates: boolean;
  orderStatusUpdates: boolean;
  promotionalMessages: boolean;
  chefAssignments: boolean;
  
  // Delivery preferences
  immediateNotifications: boolean;
  dailyDigest: boolean;
  weeklyUpdates: boolean;
}

const defaultSettings: NotificationSettings = {
  inAppNotifications: true,
  soundEnabled: true,
  whatsappEnabled: true,
  whatsappNumber: '',
  whatsappVerified: false,
  phoneCallsEnabled: true,
  phoneNumber: '',
  callTimePreference: 'business-hours',
  reservationUpdates: true,
  orderStatusUpdates: true,
  promotionalMessages: false,
  chefAssignments: true,
  immediateNotifications: true,
  dailyDigest: false,
  weeklyUpdates: false
};

export const NotificationSettings: React.FC = () => {
  const { user } = useUserAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyingWhatsApp, setVerifyingWhatsApp] = useState(false);
  const { toast } = useToast();

  // Load user notification settings
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'userNotificationSettings', user.uid));
        
        if (settingsDoc.exists()) {
          setSettings({ ...defaultSettings, ...settingsDoc.data() });
        } else {
          // Initialize with default settings
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save settings
  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'userNotificationSettings', user.uid), {
        ...settings,
        updatedAt: new Date()
      });

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Verify WhatsApp number
  const handleVerifyWhatsApp = async () => {
    if (!settings.whatsappNumber.trim()) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number.",
        variant: "destructive",
      });
      return;
    }

    setVerifyingWhatsApp(true);
    try {
      // Send verification code via WhatsApp
      const response = await fetch('/api/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: settings.whatsappNumber,
          userId: user?.uid
        })
      });

      if (response.ok) {
        toast({
          title: "Verification Sent",
          description: "A verification code has been sent to your WhatsApp number.",
        });
        
        // Update settings to show verification pending
        setSettings(prev => ({ ...prev, whatsappVerified: false }));
      } else {
        throw new Error('Failed to send verification');
      }
    } catch (error) {
      console.error('WhatsApp verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to send verification code. Please check your number and try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingWhatsApp(false);
    }
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add country code if not present
    if (digits.length > 0 && !digits.startsWith('1')) {
      return '+1' + digits;
    }
    
    return '+' + digits;
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-amber-600/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-amber-600/20 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-amber-600/10 rounded"></div>
            <div className="h-4 bg-amber-600/10 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Communication Info Banner */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-600/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-400" />
            <Phone className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-cream mb-2">
              🌟 Premium Communication Experience
            </h3>
            <p className="text-cream/80 mb-3">
              We've streamlined our communication to provide you with the best experience possible. 
              All updates are delivered via WhatsApp and direct phone calls for instant, personal service.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-cream/70">Instant WhatsApp confirmations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-cream/70">Personal phone support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-cream/70">Rich media messages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-cream/70">Real-time order updates</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-amber-600/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-600/20 rounded-full">
            <Settings className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cream">Notification Settings</h2>
            <p className="text-cream/60 text-sm">Manage how you receive updates from Jemini Restaurant</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* In-App Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-cream">In-App Notifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Enable Notifications</p>
                  <p className="text-cream/60 text-sm">Receive notifications within the app</p>
                </div>
                <Switch
                  checked={settings.inAppNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, inAppNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Sound Alerts</p>
                  <p className="text-cream/60 text-sm">Play sound for new notifications</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-cream">WhatsApp Notifications</h3>
              <Badge variant="secondary" className="text-xs bg-green-600">Primary</Badge>
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Enable WhatsApp</p>
                  <p className="text-cream/60 text-sm">Receive confirmations, updates, and reminders via WhatsApp</p>
                </div>
                <Switch
                  checked={settings.whatsappEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, whatsappEnabled: checked }))
                  }
                />
              </div>
              
              {settings.whatsappEnabled && (
                <div className="p-4 bg-black/20 rounded-lg space-y-4">
                  <div>
                    <label className="block text-cream font-medium mb-2">WhatsApp Number</label>
                    <div className="flex gap-3">
                      <Input
                        value={settings.whatsappNumber}
                        onChange={(e) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            whatsappNumber: formatPhoneNumber(e.target.value)
                          }))
                        }
                        placeholder="+91 98765 43210"
                        className="bg-black/30 border-amber-600/20 text-cream flex-1"
                      />
                      <Button
                        onClick={handleVerifyWhatsApp}
                        disabled={verifyingWhatsApp || !settings.whatsappNumber.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {verifyingWhatsApp ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    {settings.whatsappVerified && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-green-900/20 border border-green-800/30 rounded">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-sm">Verified and ready to receive messages</p>
                      </div>
                    )}
                    {!settings.whatsappVerified && settings.whatsappNumber && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-orange-900/20 border border-orange-800/30 rounded">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <p className="text-orange-400 text-sm">Number not verified - Click verify to confirm</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-green-900/10 border border-green-800/20 rounded-lg">
                    <h4 className="text-green-400 font-medium text-sm mb-2">What you'll receive via WhatsApp:</h4>
                    <ul className="text-cream/70 text-xs space-y-1">
                      <li>• Instant reservation confirmations with details</li>
                      <li>• Reminder messages before your visit</li>
                      <li>• Table assignment and special offers</li>
                      <li>• Order status updates and pickup notifications</li>
                      <li>• Exclusive promotions and menu updates</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone Call Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-cream">Phone Call Preferences</h3>
              <Badge variant="secondary" className="text-xs">Important Updates</Badge>
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Enable Phone Calls</p>
                  <p className="text-cream/60 text-sm">Allow calls for urgent updates and confirmations</p>
                </div>
                <Switch
                  checked={settings.phoneCallsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, phoneCallsEnabled: checked }))
                  }
                />
              </div>
              
              {settings.phoneCallsEnabled && (
                <div className="space-y-4">
                  <div className="p-4 bg-black/20 rounded-lg">
                    <label className="block text-cream font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={settings.phoneNumber}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          phoneNumber: formatPhoneNumber(e.target.value)
                        }))
                      }
                      placeholder="+91 98765 43210"
                      className="bg-black/30 border-amber-600/20 text-cream"
                    />
                    <p className="text-cream/50 text-xs mt-2">
                      Used for urgent reservation changes and confirmations
                    </p>
                  </div>
                  
                  <div className="p-4 bg-black/20 rounded-lg">
                    <label className="block text-cream font-medium mb-3">Call Time Preference</label>
                    <div className="space-y-2">
                      {[
                        { value: 'anytime', label: 'Anytime', desc: 'Available for calls 24/7' },
                        { value: 'business-hours', label: 'Business Hours Only', desc: '9 AM - 9 PM' },
                        { value: 'emergency-only', label: 'Emergency Only', desc: 'Only for urgent cancellations or changes' }
                      ].map((option) => (
                        <div 
                          key={option.value}
                          className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg cursor-pointer hover:bg-black/40 transition-colors"
                          onClick={() => setSettings(prev => ({ ...prev, callTimePreference: option.value as any }))}
                        >
                          <input
                            type="radio"
                            name="callTimePreference"
                            value={option.value}
                            checked={settings.callTimePreference === option.value}
                            onChange={() => {}}
                            className="text-amber-600"
                          />
                          <div>
                            <p className="text-cream font-medium text-sm">{option.label}</p>
                            <p className="text-cream/60 text-xs">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cream">What would you like to be notified about?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Reservation Updates</p>
                  <p className="text-cream/60 text-sm">Confirmations, changes, reminders</p>
                </div>
                <Switch
                  checked={settings.reservationUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, reservationUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Order Status</p>
                  <p className="text-cream/60 text-sm">Cooking progress, ready for pickup</p>
                </div>
                <Switch
                  checked={settings.orderStatusUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, orderStatusUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Chef Assignments</p>
                  <p className="text-cream/60 text-sm">When a chef is assigned to your order</p>
                </div>
                <Switch
                  checked={settings.chefAssignments}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, chefAssignments: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Promotions & Offers</p>
                  <p className="text-cream/60 text-sm">Special deals and new menu items</p>
                </div>
                <Switch
                  checked={settings.promotionalMessages}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, promotionalMessages: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-amber-600/20">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-black font-semibold"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NotificationSettings;
