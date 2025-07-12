import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  Eye,
  Send,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  AlertCircle,
  Hash
} from 'lucide-react';
import { WhatsAppTemplate } from '../../../types/reservation';

interface WhatsAppTemplatesProps {
  templates: WhatsAppTemplate[];
  onUpdateTemplate: (templateId: string, updates: Partial<WhatsAppTemplate>) => void;
}

const WhatsAppTemplates: React.FC<WhatsAppTemplatesProps> = ({
  templates,
  onUpdateTemplate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState<Partial<WhatsAppTemplate>>({
    name: '',
    type: 'custom',
    title: '',
    message: '',
    isActive: true,
    placeholders: []
  });

  const TEMPLATE_TYPES = [
    { id: 'confirmation', name: 'Confirmation', description: 'Sent when reservation is confirmed' },
    { id: 'reminder', name: 'Reminder', description: 'Sent before reservation time' },
    { id: 'cancellation', name: 'Cancellation', description: 'Sent when reservation is cancelled' },
    { id: 'no-show', name: 'No-Show', description: 'Sent when guest doesn\'t arrive' },
    { id: 'custom', name: 'Custom', description: 'For manual use' }
  ];

  const AVAILABLE_PLACEHOLDERS = [
    { key: '{name}', description: 'Guest name' },
    { key: '{date}', description: 'Reservation date' },
    { key: '{time}', description: 'Reservation time' },
    { key: '{guests}', description: 'Number of guests' },
    { key: '{specialRequests}', description: 'Special requests' },
    { key: '{tableNumber}', description: 'Assigned table number' },
    { key: '{restaurantName}', description: 'Restaurant name (Jemini Foods)' },
    { key: '{phone}', description: 'Restaurant phone number' },
    { key: '{address}', description: 'Restaurant address' }
  ];

  const DEFAULT_TEMPLATES = {
    confirmation: `Hello {name},

Thank you for choosing Jemini Foods! Your reservation has been confirmed.

📅 Date: {date}
🕐 Time: {time}
👥 Guests: {guests}
🍽️ Table: {tableNumber}

{specialRequests}

We look forward to serving you! If you need to make any changes, please contact us.

Best regards,
Jemini Foods Team`,

    reminder: `Hello {name},

This is a friendly reminder about your reservation at Jemini Foods.

📅 Tomorrow: {date}
🕐 Time: {time}
👥 Guests: {guests}

We're excited to welcome you! Please let us know if you have any changes.

See you soon!
Jemini Foods`,

    cancellation: `Hello {name},

We've received your cancellation request for your reservation on {date} at {time}.

Your reservation has been successfully cancelled. We're sorry we won't be able to serve you this time, but we hope to welcome you in the future.

Thank you for choosing Jemini Foods.

Best regards,
Jemini Foods Team`,

    noShow: `Hello {name},

We noticed you weren't able to make your reservation today ({date} at {time}). We understand that plans can change.

We'd love to have you visit us another time. Please feel free to make a new reservation whenever you're ready.

Thank you,
Jemini Foods Team`
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.message) return;
    
    try {
      console.log('Creating template:', newTemplate);
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        type: 'custom',
        title: '',
        message: '',
        isActive: true,
        placeholders: []
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (updates: Partial<WhatsAppTemplate>) => {
    if (!editingTemplate) return;
    
    try {
      onUpdateTemplate(editingTemplate.id, updates);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      console.log('Deleting template:', templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleToggleActive = (template: WhatsAppTemplate) => {
    onUpdateTemplate(template.id, { isActive: !template.isActive });
  };

  const copyTemplate = (template: WhatsAppTemplate) => {
    navigator.clipboard.writeText(template.message);
    // Show toast notification
  };

  const insertPlaceholder = (placeholder: string, isEditing: boolean = false) => {
    if (isEditing && editingTemplate) {
      const textarea = document.getElementById('editMessage') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + placeholder + text.substring(end);
        setEditingTemplate(prev => prev ? ({ ...prev, message: newText }) : null);
        setTimeout(() => textarea.focus(), 0);
      }
    } else {
      const textarea = document.getElementById('newMessage') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + placeholder + text.substring(end);
        setNewTemplate(prev => ({ ...prev, message: newText }));
        setTimeout(() => textarea.focus(), 0);
      }
    }
  };

  const useDefaultTemplate = (type: keyof typeof DEFAULT_TEMPLATES) => {
    setNewTemplate(prev => ({
      ...prev,
      message: DEFAULT_TEMPLATES[type],
      name: `${TEMPLATE_TYPES.find(t => t.id === type)?.name} Template`,
      type: type as any
    }));
  };

  const getPreviewMessage = (template: WhatsAppTemplate) => {
    return template.message
      .replace(/{name}/g, 'John Doe')
      .replace(/{date}/g, 'March 15, 2024')
      .replace(/{time}/g, '7:00 PM')
      .replace(/{guests}/g, '4')
      .replace(/{specialRequests}/g, 'Window seat preferred')
      .replace(/{tableNumber}/g, 'Table 5')
      .replace(/{restaurantName}/g, 'Jemini Foods')
      .replace(/{phone}/g, '+1 (555) 123-4567')
      .replace(/{address}/g, '123 Main Street, City');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">WhatsApp Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="grid gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className={`bg-black/30 border rounded-lg p-6 transition-all duration-300 ${
              template.isActive 
                ? 'border-green-400/20 hover:border-green-400/40' 
                : 'border-gray-600/20 opacity-75'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  template.isActive ? 'bg-green-400/10 text-green-400' : 'bg-gray-600/10 text-gray-400'
                }`}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-400">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      template.type === 'confirmation' ? 'bg-blue-400/20 text-blue-400' :
                      template.type === 'reminder' ? 'bg-amber-400/20 text-amber-400' :
                      template.type === 'cancellation' ? 'bg-red-400/20 text-red-400' :
                      template.type === 'no-show' ? 'bg-orange-400/20 text-orange-400' :
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {TEMPLATE_TYPES.find(t => t.id === template.type)?.name || template.type}
                    </span>
                    {template.title && (
                      <span className="text-gray-400 text-sm">• {template.title}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(template)}
                  className={`p-2 rounded transition-colors ${
                    template.isActive 
                      ? 'text-green-400 hover:text-green-300' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {template.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-400/10"
                >
                  <Eye size={16} />
                </button>
                
                <button
                  onClick={() => copyTemplate(template)}
                  className="text-gray-400 hover:text-cream p-2 rounded hover:bg-gray-400/10"
                >
                  <Copy size={16} />
                </button>
                
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="text-amber-400 hover:text-amber-300 p-2 rounded hover:bg-amber-400/10"
                >
                  <Edit3 size={16} />
                </button>
                
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="bg-charcoal/50 border border-amber-600/20 rounded p-4 mb-4">
              <p className="text-cream text-sm whitespace-pre-wrap line-clamp-3">
                {template.message}
              </p>
            </div>

            {/* Placeholders */}
            {template.placeholders && template.placeholders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-amber-400 text-sm font-medium">Placeholders:</span>
                {template.placeholders.map(placeholder => (
                  <span
                    key={placeholder}
                    className="text-xs bg-amber-400/10 text-amber-400 px-2 py-1 rounded border border-amber-400/20"
                  >
                    {placeholder}
                  </span>
                ))}
              </div>
            )}

            {!template.isActive && (
              <div className="mt-3 flex items-center space-x-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 p-2 rounded">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">This template is currently disabled</span>
              </div>
            )}
          </div>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No WhatsApp templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Create WhatsApp Template</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Confirmation Template"
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Type</label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  >
                    {TEMPLATE_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the template"
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">Quick Start:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(DEFAULT_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => useDefaultTemplate(key as keyof typeof DEFAULT_TEMPLATES)}
                        className="text-left p-2 bg-black/30 border border-amber-600/30 rounded text-cream hover:border-amber-400 text-sm transition-colors"
                      >
                        Use {TEMPLATE_TYPES.find(t => t.id === key)?.name} Template
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Placeholders */}
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">Available Placeholders:</label>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {AVAILABLE_PLACEHOLDERS.map(placeholder => (
                      <button
                        key={placeholder.key}
                        onClick={() => insertPlaceholder(placeholder.key)}
                        className="text-left p-2 bg-amber-400/10 border border-amber-400/20 rounded text-amber-400 hover:bg-amber-400/20 text-xs transition-colors flex items-center space-x-1"
                        title={placeholder.description}
                      >
                        <Hash size={12} />
                        <span>{placeholder.key}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Message</label>
                  <textarea
                    id="newMessage"
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your WhatsApp message template..."
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2 h-40 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Use placeholders like {'{name}'}, {'{date}'}, {'{time}'} to insert dynamic content
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newIsActive"
                    checked={newTemplate.isActive}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 rounded focus:ring-amber-400"
                  />
                  <label htmlFor="newIsActive" className="text-cream">
                    Active (available for use)
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h4 className="text-amber-400 font-semibold">Preview:</h4>
                <div className="bg-green-600/10 border border-green-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare size={16} className="text-green-400" />
                    <span className="text-green-400 font-medium">WhatsApp Message</span>
                  </div>
                  <div className="bg-white/90 text-black p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {newTemplate.message ? 
                      newTemplate.message
                        .replace(/{name}/g, 'John Doe')
                        .replace(/{date}/g, 'March 15, 2024')
                        .replace(/{time}/g, '7:00 PM')
                        .replace(/{guests}/g, '4')
                        .replace(/{specialRequests}/g, 'Window seat preferred')
                        .replace(/{tableNumber}/g, 'Table 5')
                        .replace(/{restaurantName}/g, 'Jemini Foods')
                        .replace(/{phone}/g, '+1 (555) 123-4567')
                        .replace(/{address}/g, '123 Main Street, City')
                      : 'Your message preview will appear here...'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-amber-600/20">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.message}
                className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal - Similar structure to Create Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Edit WhatsApp Template</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Type</label>
                  <select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, type: e.target.value as any }) : null)}
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  >
                    {TEMPLATE_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                  />
                </div>
                
                {/* Placeholders */}
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">Available Placeholders:</label>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {AVAILABLE_PLACEHOLDERS.map(placeholder => (
                      <button
                        key={placeholder.key}
                        onClick={() => insertPlaceholder(placeholder.key, true)}
                        className="text-left p-2 bg-amber-400/10 border border-amber-400/20 rounded text-amber-400 hover:bg-amber-400/20 text-xs transition-colors flex items-center space-x-1"
                        title={placeholder.description}
                      >
                        <Hash size={12} />
                        <span>{placeholder.key}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Message</label>
                  <textarea
                    id="editMessage"
                    value={editingTemplate.message}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, message: e.target.value }) : null)}
                    className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2 h-40 resize-none"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editingTemplate.isActive}
                    onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                    className="w-4 h-4 text-amber-600 bg-charcoal border-amber-600/30 rounded focus:ring-amber-400"
                  />
                  <label htmlFor="editIsActive" className="text-cream">
                    Active (available for use)
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h4 className="text-amber-400 font-semibold">Preview:</h4>
                <div className="bg-green-600/10 border border-green-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare size={16} className="text-green-400" />
                    <span className="text-green-400 font-medium">WhatsApp Message</span>
                  </div>
                  <div className="bg-white/90 text-black p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {getPreviewMessage(editingTemplate)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-amber-600/20">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTemplate(editingTemplate)}
                className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors"
              >
                Update Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-400">Template Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-cream transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">{previewTemplate.name}</h4>
                <div className="bg-green-600/10 border border-green-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare size={16} className="text-green-400" />
                    <span className="text-green-400 font-medium">WhatsApp Message</span>
                  </div>
                  <div className="bg-white/90 text-black p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {getPreviewMessage(previewTemplate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplates;
