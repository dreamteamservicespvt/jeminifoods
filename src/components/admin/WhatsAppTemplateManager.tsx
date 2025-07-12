import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Edit, Save, X, Eye, Send, Copy, 
  Trash2, Settings, Phone, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { WhatsAppTemplate } from '@/types/reservation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showSuccessToast, showErrorToast } from '@/lib/enhanced-toast-helpers';

interface WhatsAppTemplateManagerProps {
  onTemplateChange?: () => void;
}

const DEFAULT_TEMPLATES: Omit<WhatsAppTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Reservation Confirmation',
    type: 'confirmation',
    title: '🎉 Reservation Confirmed!',
    message: `Hello {{customerName}}! 

Your reservation at *Jemini Restaurant* has been confirmed!

📅 *Date:* {{date}}
🕐 *Time:* {{time}}
👥 *Guests:* {{guests}}
{{#tableName}}🪑 *Table:* {{tableName}}{{/tableName}}

We're excited to serve you! Please arrive 10 minutes early.

For any changes, call us at {{restaurantPhone}}.

Thank you for choosing Jemini! 🍽️✨`,
    isActive: true,
    placeholders: ['customerName', 'date', 'time', 'guests', 'tableName', 'restaurantPhone']
  },
  {
    name: 'Reservation Reminder',
    type: 'reminder',
    title: '⏰ Reservation Reminder',
    message: `Hi {{customerName}}! 

This is a friendly reminder about your reservation at *Jemini Restaurant* today.

📅 *Date:* {{date}}
🕐 *Time:* {{time}}
👥 *Guests:* {{guests}}

We look forward to serving you! Please arrive 10 minutes early.

Need to make changes? Call us at {{restaurantPhone}}.

See you soon! 🍽️`,
    isActive: true,
    placeholders: ['customerName', 'date', 'time', 'guests', 'restaurantPhone']
  },
  {
    name: 'Reservation Cancelled',
    type: 'cancellation',
    title: '❌ Reservation Cancelled',
    message: `Hello {{customerName}},

Your reservation at *Jemini Restaurant* for {{date}} at {{time}} has been cancelled as requested.

We hope to see you again soon! To make a new reservation, visit our website or call {{restaurantPhone}}.

Thank you for understanding! 🙏`,
    isActive: true,
    placeholders: ['customerName', 'date', 'time', 'restaurantPhone']
  },
  {
    name: 'No Show Follow-up',
    type: 'no-show',
    title: '😔 We Missed You!',
    message: `Hi {{customerName}},

We noticed you couldn't make it to your reservation at *Jemini Restaurant* today ({{date}} at {{time}}).

We understand things come up! We'd love to have you visit us another time.

Call us at {{restaurantPhone}} to make a new reservation.

Hope to see you soon! 🍽️`,
    isActive: true,
    placeholders: ['customerName', 'date', 'time', 'restaurantPhone']
  },
  {
    name: 'Custom Message',
    type: 'custom',
    title: '💬 Custom Message',
    message: `Hello {{customerName}},

{{customMessage}}

Best regards,
Jemini Restaurant Team

For inquiries: {{restaurantPhone}}`,
    isActive: true,
    placeholders: ['customerName', 'customMessage', 'restaurantPhone']
  }
];

const WhatsAppTemplateManager: React.FC<WhatsAppTemplateManagerProps> = ({ onTemplateChange }) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewData, setPreviewData] = useState({
    customerName: 'John Doe',
    date: 'Friday, December 15, 2024',
    time: '7:30 PM',
    guests: '4',
    tableName: 'Table 5',
    restaurantPhone: '+91 98765 43210',
    customMessage: 'Thank you for dining with us!'
  });

  // Load templates from Firestore
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesSnapshot = await getDocs(collection(db, 'whatsappTemplates'));
      
      if (templatesSnapshot.empty) {
        // Initialize with default templates if none exist
        await initializeDefaultTemplates();
        return;
      }

      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhatsAppTemplate[];
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      showErrorToast({
        title: 'Error',
        message: 'Failed to load WhatsApp templates'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize default templates
  const initializeDefaultTemplates = async () => {
    try {
      const promises = DEFAULT_TEMPLATES.map(template => 
        addDoc(collection(db, 'whatsappTemplates'), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(promises);
      await loadTemplates();
      
      showSuccessToast({
        title: 'Templates Initialized',
        message: 'Default WhatsApp templates have been created'
      });
    } catch (error) {
      console.error('Error initializing templates:', error);
      showErrorToast({
        title: 'Error',
        message: 'Failed to initialize default templates'
      });
    }
  };

  // Save template
  const saveTemplate = async (template: Omit<WhatsAppTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate?.id) {
        // Update existing template
        await updateDoc(doc(db, 'whatsappTemplates', editingTemplate.id), {
          ...template,
          updatedAt: serverTimestamp()
        });
        
        showSuccessToast({
          title: 'Template Updated',
          message: 'WhatsApp template has been updated successfully'
        });
      } else {
        // Create new template
        await addDoc(collection(db, 'whatsappTemplates'), {
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        showSuccessToast({
          title: 'Template Created',
          message: 'New WhatsApp template has been created successfully'
        });
      }

      await loadTemplates();
      setEditingTemplate(null);
      setIsCreating(false);
      onTemplateChange?.();
    } catch (error) {
      console.error('Error saving template:', error);
      showErrorToast({
        title: 'Error',
        message: 'Failed to save WhatsApp template'
      });
    }
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'whatsappTemplates', templateId));
      await loadTemplates();
      
      showSuccessToast({
        title: 'Template Deleted',
        message: 'WhatsApp template has been deleted successfully'
      });
      
      onTemplateChange?.();
    } catch (error) {
      console.error('Error deleting template:', error);
      showErrorToast({
        title: 'Error',
        message: 'Failed to delete WhatsApp template'
      });
    }
  };

  // Generate preview message
  const generatePreview = (template: WhatsAppTemplate): string => {
    let message = template.message;
    
    // Replace placeholders with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(placeholder, value);
    });

    // Handle conditional blocks (simple implementation)
    message = message.replace(/{{#\w+}}.*?{{\/\w+}}/g, (match) => {
      const content = match.replace(/{{#\w+}}|{{\/\w+}}/g, '');
      return content;
    });

    return message;
  };

  // Copy template to clipboard
  const copyTemplate = async (template: WhatsAppTemplate) => {
    try {
      const preview = generatePreview(template);
      await navigator.clipboard.writeText(preview);
      
      showSuccessToast({
        title: 'Copied!',
        message: 'Template message copied to clipboard'
      });
    } catch (error) {
      showErrorToast({
        title: 'Error',
        message: 'Failed to copy template'
      });
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
            <MessageSquare className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cream">WhatsApp Templates</h2>
            <p className="text-cream/60">Manage message templates for customer communication</p>
          </div>
        </div>
        
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus size={16} className="mr-2" />
          New Template
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <p className="text-cream/60 mt-2">Loading templates...</p>
        </div>
      ) : (
        <>
          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-cream">{template.name}</h3>
                      <Badge 
                        variant={template.isActive ? "default" : "secondary"}
                        className={template.isActive ? "bg-green-600" : "bg-gray-600"}
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-amber-400 text-sm font-medium">{template.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.placeholders.map((placeholder) => (
                        <Badge key={placeholder} variant="outline" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <p className="text-cream/80 text-sm leading-relaxed line-clamp-4">
                    {generatePreview(template)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1"
                  >
                    <Eye size={14} className="mr-1" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit size={14} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyTemplate(template)}
                  >
                    <Copy size={14} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {templates.length === 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-gray-800 p-12 text-center">
              <MessageSquare size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cream mb-2">No Templates Found</h3>
              <p className="text-cream/60 mb-6">Create your first WhatsApp template to get started</p>
              <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
                <Plus size={16} className="mr-2" />
                Create Template
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Template Editor Dialog */}
      <TemplateEditor
        template={editingTemplate}
        isOpen={!!editingTemplate || isCreating}
        onClose={() => {
          setEditingTemplate(null);
          setIsCreating(false);
        }}
        onSave={saveTemplate}
      />

      {/* Preview Dialog */}
      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        previewData={previewData}
      />
    </div>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<WhatsAppTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'confirmation' as WhatsAppTemplate['type'],
    title: '',
    message: '',
    isActive: true,
    placeholders: [] as string[]
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        title: template.title,
        message: template.message,
        isActive: template.isActive,
        placeholders: template.placeholders
      });
    } else {
      setFormData({
        name: '',
        type: 'confirmation',
        title: '',
        message: '',
        isActive: true,
        placeholders: []
      });
    }
  }, [template]);

  const handleSave = () => {
    if (!formData.name || !formData.title || !formData.message) {
      showErrorToast({
        title: 'Missing Information',
        message: 'Please fill in all required fields'
      });
      return;
    }

    onSave(formData);
  };

  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/{{(\w+)}}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const handleMessageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      message: value,
      placeholders: extractPlaceholders(value)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cream">
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription className="text-cream/60">
            Create or modify WhatsApp message templates for customer communication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-cream">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                className="bg-gray-800/50 border-gray-700 text-cream"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-cream">Template Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as WhatsAppTemplate['type'] }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="cancellation">Cancellation</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-cream">Message Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter message title"
              className="bg-gray-800/50 border-gray-700 text-cream"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-cream">Message Content *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Enter message content with {{placeholders}}"
              rows={10}
              className="bg-gray-800/50 border-gray-700 text-cream"
            />
            <p className="text-xs text-cream/60 mt-1">
              Use {'{placeholder}'} format for dynamic content (e.g., {'{customerName}'}, {'{date}'})
            </p>
          </div>

          {formData.placeholders.length > 0 && (
            <div>
              <Label className="text-cream">Detected Placeholders</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.placeholders.map((placeholder) => (
                  <Badge key={placeholder} variant="outline">
                    {placeholder}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-700"
            />
            <Label htmlFor="isActive" className="text-cream">Active Template</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save size={16} className="mr-2" />
            Save Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Template Preview Component
interface TemplatePreviewProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  previewData: Record<string, string>;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, isOpen, onClose, previewData }) => {
  if (!template) return null;

  const generatePreview = (): string => {
    let message = template.message;
    
    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(placeholder, value);
    });

    return message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cream flex items-center gap-2">
            <MessageSquare size={20} className="text-green-400" />
            WhatsApp Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <MessageSquare size={16} className="text-black" />
              </div>
              <div>
                <p className="text-green-400 font-medium text-sm">Jemini Restaurant</p>
                <p className="text-green-300/60 text-xs">WhatsApp Business</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-amber-400 font-medium text-sm mb-2">{template.title}</p>
              <p className="text-cream text-sm leading-relaxed whitespace-pre-line">
                {generatePreview()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppTemplateManager;
