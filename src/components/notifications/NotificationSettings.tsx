import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Volume2, 
  VolumeX,
  Settings,
  Save,
  MessageSquare
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
  
  // Email notifications
  emailNotifications: boolean;
  emailAddress: string;
  
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
  whatsappEnabled: false,
  whatsappNumber: '',
  whatsappVerified: false,
  emailNotifications: true,
  emailAddress: '',
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
          // Set email from user profile
          setSettings({
            ...defaultSettings,
            emailAddress: user.email || ''
          });
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
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Enable WhatsApp</p>
                  <p className="text-cream/60 text-sm">Receive updates via WhatsApp messages</p>
                </div>
                <Switch
                  checked={settings.whatsappEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, whatsappEnabled: checked }))
                  }
                />
              </div>
              
              {settings.whatsappEnabled && (
                <div className="p-4 bg-black/20 rounded-lg space-y-3">
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
                        placeholder="+1 (555) 123-4567"
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
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        ✓ Verified and ready to receive messages
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-cream">Email Notifications</h3>
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-cream font-medium">Enable Email</p>
                  <p className="text-cream/60 text-sm">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              {settings.emailNotifications && (
                <div className="p-4 bg-black/20 rounded-lg">
                  <label className="block text-cream font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, emailAddress: e.target.value }))
                    }
                    placeholder="your@email.com"
                    className="bg-black/30 border-amber-600/20 text-cream"
                  />
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
