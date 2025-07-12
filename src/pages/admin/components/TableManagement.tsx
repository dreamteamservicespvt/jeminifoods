import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Settings,
  Grid,
  List,
  Filter,
  Search
} from 'lucide-react';
import { DiningTable, TableType, TableLocation } from '../../../types/tables';
import { Reservation } from '../../../types/reservation';

interface TableManagementProps {
  tables: DiningTable[];
  reservations: Reservation[];
  onUpdateTable: (tableId: string, updates: Partial<DiningTable>) => void;
}

const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  reservations,
  onUpdateTable
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [filter, setFilter] = useState<{
    type: TableType | 'all';
    location: TableLocation | 'all';
    availability: 'all' | 'available' | 'occupied';
    search: string;
  }>({
    type: 'all',
    location: 'all',
    availability: 'all',
    search: ''
  });

  const [newTable, setNewTable] = useState<Partial<DiningTable>>({
    name: '',
    capacity: 2,
    type: TableType.REGULAR,
    location: TableLocation.INTERIOR,
    isAvailable: true,
    description: ''
  });

  // Get current reservation for a table
  const getCurrentReservation = (tableId: string) => {
    return reservations.find(r => 
      r.tableId === tableId && 
      ['confirmed', 'booked'].includes(r.status) &&
      r.date === new Date().toISOString().split('T')[0]
    );
  };

  // Filter tables
  const filteredTables = tables.filter(table => {
    if (filter.type !== 'all' && table.type !== filter.type) return false;
    if (filter.location !== 'all' && table.location !== filter.location) return false;
    if (filter.availability !== 'all') {
      if (filter.availability === 'available' && !table.isAvailable) return false;
      if (filter.availability === 'occupied' && table.isAvailable) return false;
    }
    if (filter.search && !table.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleCreateTable = async () => {
    if (!newTable.name || !newTable.capacity) return;
    
    try {
      // Create table logic would go here
      console.log('Creating table:', newTable);
      setShowCreateModal(false);
      setNewTable({
        name: '',
        capacity: 2,
        type: TableType.REGULAR,
        location: TableLocation.INTERIOR,
        isAvailable: true,
        description: ''
      });
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const handleUpdateTable = async (updates: Partial<DiningTable>) => {
    if (!editingTable) return;
    
    try {
      onUpdateTable(editingTable.id, updates);
      setEditingTable(null);
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      // Delete table logic would go here
      console.log('Deleting table:', tableId);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const handleToggleAvailability = (table: DiningTable) => {
    onUpdateTable(table.id, { isAvailable: !table.isAvailable });
  };

  const getTableStatusColor = (table: DiningTable) => {
    if (!table.isAvailable) {
      return 'border-red-400/40 bg-red-400/5';
    }
    const currentReservation = getCurrentReservation(table.id);
    if (currentReservation) {
      return 'border-amber-400/40 bg-amber-400/5';
    }
    return 'border-green-400/40 bg-green-400/5';
  };

  const getTableStatusIcon = (table: DiningTable) => {
    if (!table.isAvailable) {
      return <XCircle size={16} className="text-red-400" />;
    }
    const currentReservation = getCurrentReservation(table.id);
    if (currentReservation) {
      return <AlertCircle size={16} className="text-amber-400" />;
    }
    return <CheckCircle size={16} className="text-green-400" />;
  };

  const getTableStatusText = (table: DiningTable) => {
    if (!table.isAvailable) {
      return 'Unavailable';
    }
    const currentReservation = getCurrentReservation(table.id);
    if (currentReservation) {
      return `Reserved - ${currentReservation.name}`;
    }
    return 'Available';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Table Management</h2>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex border border-amber-600/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center space-x-1 transition-colors ${
                viewMode === 'grid' ? 'bg-amber-600 text-black' : 'text-cream hover:bg-amber-600/20'
              }`}
            >
              <Grid size={16} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center space-x-1 transition-colors ${
                viewMode === 'list' ? 'bg-amber-600 text-black' : 'text-cream hover:bg-amber-600/20'
              }`}
            >
              <List size={16} />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={16} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-amber-600/20 p-4 rounded-lg">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tables..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-charcoal border border-amber-600/30 rounded text-cream placeholder-gray-400 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
            className="bg-charcoal border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
          >
            <option value="all">All Types</option>
            {Object.values(TableType).map(type => (
              <option key={type} value={type} className="capitalize">
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filter.location}
            onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value as any }))}
            className="bg-charcoal border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
          >
            <option value="all">All Locations</option>
            {Object.values(TableLocation).map(location => (
              <option key={location} value={location} className="capitalize">
                {location.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={filter.availability}
            onChange={(e) => setFilter(prev => ({ ...prev, availability: e.target.value as any }))}
            className="bg-charcoal border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
          >
            <option value="all">All Tables</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      {/* Tables Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map(table => {
            const currentReservation = getCurrentReservation(table.id);
            return (
              <div
                key={table.id}
                className={`border rounded-lg p-6 transition-all duration-300 hover:scale-105 ${getTableStatusColor(table)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <TableIcon size={20} className="text-amber-400" />
                    <h3 className="text-lg font-semibold text-amber-400">{table.name}</h3>
                  </div>
                  
                  <div className="relative">
                    <button className="text-gray-400 hover:text-cream p-1 rounded hover:bg-charcoal/50">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <div className="flex items-center space-x-1 text-cream">
                      <Users size={16} />
                      <span>{table.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-cream capitalize">{table.type.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Location:</span>
                    <div className="flex items-center space-x-1 text-cream">
                      <MapPin size={14} />
                      <span className="capitalize">{table.location.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center space-x-1">
                      {getTableStatusIcon(table)}
                      <span className="text-sm text-cream">{getTableStatusText(table)}</span>
                    </div>
                  </div>

                  {currentReservation && (
                    <div className="bg-amber-600/10 border border-amber-600/20 p-3 rounded mt-3">
                      <p className="text-amber-400 font-medium text-sm">Current Reservation</p>
                      <p className="text-cream text-sm">{currentReservation.name}</p>
                      <p className="text-gray-400 text-xs">{currentReservation.time} • {currentReservation.guests} guests</p>
                    </div>
                  )}

                  {table.description && (
                    <p className="text-gray-400 text-sm mt-2">{table.description}</p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-600/20">
                  <button
                    onClick={() => handleToggleAvailability(table)}
                    className={`text-sm px-3 py-1 rounded transition-colors ${
                      table.isAvailable 
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}
                  >
                    {table.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTable(table)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-black/30 border border-amber-600/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-amber-600/10 border-b border-amber-600/20">
              <tr>
                <th className="text-left p-4 text-amber-400 font-semibold">Table</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Capacity</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Type</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Location</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Status</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Current Reservation</th>
                <th className="text-left p-4 text-amber-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map(table => {
                const currentReservation = getCurrentReservation(table.id);
                return (
                  <tr key={table.id} className="border-b border-amber-600/10 hover:bg-amber-600/5">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <TableIcon size={16} className="text-amber-400" />
                        <span className="text-cream font-medium">{table.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-cream">
                        <Users size={14} />
                        <span>{table.capacity}</span>
                      </div>
                    </td>
                    <td className="p-4 text-cream capitalize">{table.type.replace('_', ' ')}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-cream">
                        <MapPin size={14} />
                        <span className="capitalize">{table.location.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        {getTableStatusIcon(table)}
                        <span className="text-sm text-cream">{getTableStatusText(table)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {currentReservation ? (
                        <div>
                          <p className="text-cream font-medium">{currentReservation.name}</p>
                          <p className="text-gray-400 text-sm">{currentReservation.time} • {currentReservation.guests} guests</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleAvailability(table)}
                          className={`text-sm px-2 py-1 rounded transition-colors ${
                            table.isAvailable 
                              ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                              : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          }`}
                        >
                          {table.isAvailable ? 'Unavailable' : 'Available'}
                        </button>
                        <button
                          onClick={() => setEditingTable(table)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Create New Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Table Name</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Table 1, Booth A"
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Type</label>
                <select
                  value={newTable.type}
                  onChange={(e) => setNewTable(prev => ({ ...prev, type: e.target.value as TableType }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                >
                  {Object.values(TableType).map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Location</label>
                <select
                  value={newTable.location}
                  onChange={(e) => setNewTable(prev => ({ ...prev, location: e.target.value as TableLocation }))}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                >
                  {Object.values(TableLocation).map(location => (
                    <option key={location} value={location} className="capitalize">
                      {location.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Description (Optional)</label>
                <textarea
                  value={newTable.description}
                  onChange={(e) => setNewTable(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any special notes about this table..."
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2 h-20 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  disabled={!newTable.name || !newTable.capacity}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-amber-600/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Edit Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Table Name</label>
                <input
                  type="text"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable(prev => prev ? ({ ...prev, capacity: parseInt(e.target.value) }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Type</label>
                <select
                  value={editingTable.type}
                  onChange={(e) => setEditingTable(prev => prev ? ({ ...prev, type: e.target.value as TableType }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                >
                  {Object.values(TableType).map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Location</label>
                <select
                  value={editingTable.location}
                  onChange={(e) => setEditingTable(prev => prev ? ({ ...prev, location: e.target.value as TableLocation }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2"
                >
                  {Object.values(TableLocation).map(location => (
                    <option key={location} value={location} className="capitalize">
                      {location.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-400 font-semibold mb-1">Description</label>
                <textarea
                  value={editingTable.description || ''}
                  onChange={(e) => setEditingTable(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full bg-black/30 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none px-3 py-2 h-20 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 text-gray-400 hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateTable(editingTable)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded transition-colors"
                >
                  Update Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
