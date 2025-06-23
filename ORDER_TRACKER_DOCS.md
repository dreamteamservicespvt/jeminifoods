# OrderTracker Component Documentation

A comprehensive, responsive React component for tracking order status across multiple stages with support for customer views, admin interfaces, and chef dashboards.

## Features

✅ **4 Order Stages**: Booked → Taken → Making → Ready  
✅ **3 Display Variants**: Default (full), Compact (mobile), Minimal (progress bar)  
✅ **Responsive Design**: Mobile-first with desktop enhancements  
✅ **Color-Coded States**: Green (completed), Amber (current), Gray (upcoming), Blue (editable)  
✅ **Smooth Animations**: Framer Motion transitions, pulse effects, glow animations  
✅ **Admin/Chef Mode**: Click-to-update status with visual feedback  
✅ **Timestamps Display**: Optional time tracking for each stage  
✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader friendly  
✅ **Modern UI**: Clean design with icons, gradients, and hover effects  

## Props API

```typescript
interface OrderTrackerProps {
  currentStatus: OrderStatus;           // Required: 'booked' | 'taken' | 'making' | 'ready'
  orderId?: string;                     // Optional: Display order ID
  chefName?: string;                    // Optional: Assigned chef name
  timestamps?: OrderTimestamps;         // Optional: Time for each stage
  isEditable?: boolean;                 // Optional: Enable admin/chef mode
  onStatusChange?: (newStatus: OrderStatus) => void; // Optional: Status update callback
  className?: string;                   // Optional: Additional CSS classes
  showTimestamps?: boolean;             // Optional: Show/hide timestamps (default: true)
  showDescription?: boolean;            // Optional: Show/hide descriptions (default: true)
  variant?: 'default' | 'compact' | 'minimal'; // Optional: Display variant
}

interface OrderTimestamps {
  booked?: string;
  taken?: string;
  making?: string;
  ready?: string;
}
```

## Usage Examples

### 1. Customer View (Read-only)
```tsx
import { OrderTracker } from '@/components/ui/OrderTracker';

<OrderTracker
  currentStatus="making"
  orderId="ORD-2024-001"
  chefName="Chef Marco"
  timestamps={{
    booked: "2024-01-15 14:30",
    taken: "2024-01-15 14:45",
    making: "2024-01-15 15:00"
  }}
  variant="default"
/>
```

### 2. Admin/Chef Dashboard (Editable)
```tsx
const handleStatusUpdate = (newStatus: OrderStatus) => {
  // Update database and notify customer
  updateOrderStatus(orderId, newStatus);
};

<OrderTracker
  currentStatus="taken"
  orderId="ORD-2024-001"
  chefName="Chef Marco"
  isEditable={true}
  onStatusChange={handleStatusUpdate}
  variant="default"
/>
```

### 3. Mobile Compact View
```tsx
<OrderTracker
  currentStatus="booked"
  orderId="ORD-123"
  variant="compact"
  showTimestamps={false}
  className="mb-4"
/>
```

### 4. Minimal Progress Bar
```tsx
<OrderTracker
  currentStatus="making"
  variant="minimal"
/>
```

## Integration Guide

### In User Dashboard
```tsx
// src/pages/UserDashboard.tsx
import { OrderTracker } from '@/components/ui/OrderTracker';

const UserDashboard = () => {
  const [userOrders, setUserOrders] = useState([]);

  return (
    <div className="space-y-6">
      {userOrders.map(order => (
        <div key={order.id} className="border rounded-lg p-4">
          <h3>Order #{order.id}</h3>
          <OrderTracker
            currentStatus={order.status}
            orderId={order.id}
            chefName={order.chefName}
            timestamps={order.timestamps}
            variant="default"
          />
        </div>
      ))}
    </div>
  );
};
```

### In Admin Dashboard
```tsx
// src/pages/admin/OrderManagement.tsx
import { OrderTracker } from '@/components/ui/OrderTracker';

const AdminOrderManagement = () => {
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        [`timestamps.${newStatus}`]: new Date().toISOString(),
        updatedAt: new Date()
      });
      
      // Trigger customer notification
      await sendStatusUpdateNotification(orderId, newStatus);
      
      toast.success(`Order updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="grid gap-4">
      {orders.map(order => (
        <div key={order.id} className="border rounded-lg p-4">
          <OrderTracker
            currentStatus={order.status}
            orderId={order.id}
            chefName={order.assignedChef}
            timestamps={order.timestamps}
            isEditable={true}
            onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
            variant="default"
          />
        </div>
      ))}
    </div>
  );
};
```

### In PreOrders Component
```tsx
// Update existing PreOrders.tsx to use OrderTracker
import { OrderTracker } from '@/components/ui/OrderTracker';

// Replace existing status display with:
<OrderTracker
  currentStatus={order.status || 'booked'}
  orderId={order.id}
  chefName={order.assignedChef}
  timestamps={order.timestamps}
  isEditable={userRole === 'admin' || userRole === 'chef'}
  onStatusChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
  variant="compact" // Use compact for mobile-friendly display
  className="mt-4"
/>
```

## Responsive Behavior

- **Mobile (< 768px)**: Uses compact layout with 2-column grid
- **Tablet (768px - 1024px)**: Uses compact or default variant
- **Desktop (> 1024px)**: Full default variant with 4-column grid

## Styling & Theming

The component uses Tailwind CSS with custom color schemes:

```css
/* Color Scheme */
.completed { @apply bg-green-500 text-green-600 border-green-500; }
.current { @apply bg-amber-500 text-amber-600 border-amber-500; }
.upcoming { @apply bg-gray-300 text-gray-400 border-gray-300; }
.clickable { @apply bg-blue-100 text-blue-600 border-blue-300; }

/* Glow Effects */
.current-glow { @apply shadow-lg shadow-amber-500/30; }
.completed-glow { @apply shadow-lg shadow-green-500/20; }
```

## Animation Features

- **Pulse Effect**: Active status indicators pulse continuously
- **Rotating Icons**: Current step icons rotate during active state
- **Smooth Transitions**: All state changes animated with Framer Motion
- **Hover Effects**: Scale and glow effects on interactive elements
- **Loading States**: Visual feedback during status updates

## Accessibility

- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard support for editable mode
- **Screen Reader**: Status announcements and descriptions
- **High Contrast**: Color schemes meet WCAG guidelines
- **Focus Management**: Clear focus indicators

## Error Handling

The component gracefully handles:
- Invalid status values (defaults to 'booked')
- Missing timestamps (displays without time info)
- Failed status updates (maintains previous state)
- Network errors (shows retry options in editable mode)

## Performance

- **Lazy Loading**: Icons loaded on demand
- **Memoization**: React.memo for preventing unnecessary re-renders
- **Optimized Animations**: GPU-accelerated transforms
- **Minimal Bundle Size**: Tree-shakeable imports

## Testing

```tsx
// Example test cases
describe('OrderTracker', () => {
  it('displays correct status progression', () => {
    render(<OrderTracker currentStatus="making" />);
    expect(screen.getByText('Making Order')).toBeInTheDocument();
  });

  it('handles status updates in editable mode', () => {
    const onStatusChange = jest.fn();
    render(
      <OrderTracker 
        currentStatus="taken" 
        isEditable={true}
        onStatusChange={onStatusChange}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /making/i }));
    expect(onStatusChange).toHaveBeenCalledWith('making');
  });
});
```

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live status changes
- **Custom Status**: Support for additional status types
- **Multi-language**: i18n support for labels and descriptions
- **Audio Alerts**: Sound notifications for status changes
- **Estimated Times**: Predictive completion time estimates
