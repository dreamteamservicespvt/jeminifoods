import React, { useState } from 'react';
import { OrderTracker, OrderStatus } from './OrderTracker';

/**
 * Example usage of OrderTracker component in different scenarios
 */

// Example 1: Customer View - Read-only order tracking
export const CustomerOrderView = () => {
  const orderData = {
    orderId: "ORD-2024-001",
    currentStatus: 'making' as OrderStatus,
    chefName: "Chef Marco",
    timestamps: {
      booked: "2024-01-15 14:30",
      taken: "2024-01-15 14:45",
      making: "2024-01-15 15:00"
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Order Status</h2>
      
      {/* Full detailed view for desktop */}
      <div className="hidden md:block">
        <OrderTracker
          currentStatus={orderData.currentStatus}
          orderId={orderData.orderId}
          chefName={orderData.chefName}
          timestamps={orderData.timestamps}
          variant="default"
          showTimestamps={true}
          showDescription={true}
        />
      </div>

      {/* Compact view for mobile */}
      <div className="md:hidden">
        <OrderTracker
          currentStatus={orderData.currentStatus}
          orderId={orderData.orderId}
          chefName={orderData.chefName}
          timestamps={orderData.timestamps}
          variant="compact"
          showTimestamps={true}
        />
      </div>
    </div>
  );
};

// Example 2: Admin/Chef Dashboard - Editable order tracking
interface OrderData {
  id: string;
  customerName: string;
  status: OrderStatus;
  timestamps: {
    booked?: string;
    taken?: string;
    making?: string;
    ready?: string;
  };
}

export const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<OrderData[]>([
    {
      id: "ORD-001",
      customerName: "John Doe",
      status: 'booked' as OrderStatus,
      timestamps: { booked: "2024-01-15 14:30" }
    },
    {
      id: "ORD-002", 
      customerName: "Jane Smith",
      status: 'taken' as OrderStatus,
      timestamps: { 
        booked: "2024-01-15 14:15",
        taken: "2024-01-15 14:20"
      }
    },
    {
      id: "ORD-003",
      customerName: "Mike Johnson", 
      status: 'making' as OrderStatus,
      timestamps: {
        booked: "2024-01-15 14:00",
        taken: "2024-01-15 14:10", 
        making: "2024-01-15 14:25"
      }
    }
  ]);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const now = new Date().toLocaleString();
        return {
          ...order,
          status: newStatus,
          timestamps: {
            ...order.timestamps,
            [newStatus]: now
          }
        };
      }
      return order;
    }));
    
    // Here you would typically update the database
    console.log(`Order ${orderId} updated to ${newStatus}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management Dashboard</h2>
      
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">{order.customerName}</h3>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
              </div>
            </div>
            
            <OrderTracker
              currentStatus={order.status}
              orderId={order.id}
              chefName="Chef Marco"
              timestamps={order.timestamps}
              isEditable={true}
              onStatusChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
              variant="default"
              showTimestamps={true}
              showDescription={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 3: Mobile-First Compact View
export const MobileOrderTracking = () => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('taken');
  
  return (
    <div className="max-w-sm mx-auto p-4">
      <h3 className="text-lg font-semibold mb-4">Order #ORD-123</h3>
      
      {/* Ultra compact for mobile cards */}
      <OrderTracker
        currentStatus={currentStatus}
        orderId="ORD-123"
        variant="compact"
        showTimestamps={false}
        showDescription={false}
        className="mb-4"
      />
      
      {/* Minimal progress bar variant */}
      <OrderTracker
        currentStatus={currentStatus}
        variant="minimal"
        className="mb-4"
      />
      
      {/* Demo buttons for testing */}
      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => setCurrentStatus('booked')}
          className="px-3 py-1 text-xs bg-gray-200 rounded"
        >
          Booked
        </button>
        <button 
          onClick={() => setCurrentStatus('taken')}
          className="px-3 py-1 text-xs bg-gray-200 rounded"
        >
          Taken
        </button>
        <button 
          onClick={() => setCurrentStatus('making')}
          className="px-3 py-1 text-xs bg-gray-200 rounded"
        >
          Making
        </button>
        <button 
          onClick={() => setCurrentStatus('ready')}
          className="px-3 py-1 text-xs bg-gray-200 rounded"
        >
          Ready
        </button>
      </div>
    </div>
  );
};

// Example 4: Integration with existing dashboard components
export const OrderTrackingIntegration = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  const orders = [
    { id: "ORD-001", status: 'booked' as OrderStatus },
    { id: "ORD-002", status: 'making' as OrderStatus },
    { id: "ORD-003", status: 'ready' as OrderStatus }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Order List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.map(order => (
            <div 
              key={order.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOrder === order.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOrder(order.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{order.id}</span>
                <span className="text-sm text-gray-500">{order.status}</span>
              </div>
              
              {/* Mini progress indicator */}
              <OrderTracker
                currentStatus={order.status}
                variant="minimal"
                showTimestamps={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detailed View */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
        {selectedOrder ? (
          <OrderTracker
            currentStatus={orders.find(o => o.id === selectedOrder)?.status || 'booked'}
            orderId={selectedOrder}
            chefName="Chef Marco"
            timestamps={{
              booked: "2024-01-15 14:30",
              taken: "2024-01-15 14:45"
            }}
            variant="default"
            showTimestamps={true}
            showDescription={true}
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            Select an order to view details
          </div>
        )}
      </div>
    </div>
  );
};
