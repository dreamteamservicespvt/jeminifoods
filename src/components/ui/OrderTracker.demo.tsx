import React, { useState } from 'react';
import { OrderTracker, OrderStatus } from './OrderTracker';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

/**
 * Interactive demo component to showcase OrderTracker features
 * Use this in your development environment to test the component
 */
export const OrderTrackerDemo = () => {
  const [demoStatus, setDemoStatus] = useState<OrderStatus>('booked');
  const [isEditable, setIsEditable] = useState(false);
  const [variant, setVariant] = useState<'default' | 'compact' | 'minimal'>('default');

  const timestamps = {
    booked: '2024-01-15 14:30',
    taken: demoStatus === 'taken' || demoStatus === 'making' || demoStatus === 'ready' 
      ? '2024-01-15 14:45' : undefined,
    making: demoStatus === 'making' || demoStatus === 'ready' 
      ? '2024-01-15 15:00' : undefined,
    ready: demoStatus === 'ready' 
      ? '2024-01-15 15:25' : undefined,
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    setDemoStatus(newStatus);
    // Status updated
  };

  const statusOptions: OrderStatus[] = ['booked', 'taken', 'making', 'ready'];
  const variantOptions = ['default', 'compact', 'minimal'] as const;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">OrderTracker Component Demo</h1>
        <p className="text-gray-600">Interactive demonstration of the order tracking component</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Interact with the controls below to see how the OrderTracker responds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Controls */}
          <div>
            <label className="text-sm font-medium mb-2 block">Current Status</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(status => (
                <Button
                  key={status}
                  variant={demoStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDemoStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Variant Controls */}
          <div>
            <label className="text-sm font-medium mb-2 block">Display Variant</label>
            <div className="flex gap-2">
              {variantOptions.map(v => (
                <Button
                  key={v}
                  variant={variant === v ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVariant(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Editable Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editable"
              checked={isEditable}
              onChange={(e) => setIsEditable(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="editable" className="text-sm font-medium">
              Enable Admin/Chef Mode (Editable)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Demo Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Live Demo
            <Badge variant="secondary">
              {variant} variant
            </Badge>
            {isEditable && <Badge variant="destructive">Editable</Badge>}
          </CardTitle>
          <CardDescription>
            Order #DEMO-2024-001 • Chef Marco Rossi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTracker
            currentStatus={demoStatus}
            orderId="DEMO-2024-001"
            chefName="Chef Marco Rossi"
            timestamps={timestamps}
            isEditable={isEditable}
            onStatusChange={handleStatusChange}
            variant={variant}
            showTimestamps={true}
            showDescription={variant !== 'minimal'}
          />
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer View</CardTitle>
            <CardDescription>Read-only order tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTracker
              currentStatus="making"
              orderId="ORD-001"
              chefName="Chef Anna"
              timestamps={{
                booked: "14:30",
                taken: "14:45", 
                making: "15:00"
              }}
              variant="compact"
              showTimestamps={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Dashboard</CardTitle>
            <CardDescription>Clickable status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTracker
              currentStatus="taken"
              orderId="ORD-002"
              chefName="Chef Luigi"
              timestamps={{
                booked: "14:15",
                taken: "14:30"
              }}
              isEditable={true}
              onStatusChange={(status) => {/* Admin status update */}}
              variant="compact"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile Card</CardTitle>
            <CardDescription>Minimal progress display</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTracker
              currentStatus="ready"
              orderId="ORD-003"
              variant="minimal"
            />
            <div className="mt-3 text-sm text-gray-600">
              Perfect for mobile dashboards and compact spaces
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Example</CardTitle>
          <CardDescription>
            Copy and paste this code into your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { OrderTracker } from '@/components/ui/OrderTracker';

// Customer view (read-only)
<OrderTracker
  currentStatus="${demoStatus}"
  orderId="ORD-2024-001"
  chefName="Chef Marco"
  timestamps={{
    booked: "2024-01-15 14:30",
    taken: "2024-01-15 14:45"
  }}
  variant="${variant}"
/>

// Admin view (editable)
<OrderTracker
  currentStatus="${demoStatus}"
  orderId="ORD-2024-001"
  isEditable={true}
  onStatusChange={(newStatus) => {
    updateOrderInDatabase(newStatus);
    notifyCustomer(newStatus);
  }}
  variant="${variant}"
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackerDemo;
