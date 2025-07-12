# Jemini Foods Toast Notification System

A reusable toast notification system designed specifically for the Jemini Foods website, with a dark theme that matches the website's elegant aesthetic.

## Features

- **Elegant Design**: Soft glowing borders and subtle drop shadows with the Jemini Foods dark theme color palette
- **Responsive**: Appears top-right on desktop, bottom-center on mobile
- **Accessible**: ARIA roles for screen readers
- **Multiple Toast Types**: Success, Error, Warning, and Info notifications
- **Customizable**: Adjust titles, messages, and durations as needed
- **Auto-dismiss**: Toasts automatically disappear after 4-6 seconds (configurable)
- **Manual Close**: Close button available for users who want to dismiss notifications immediately

## Toast Types

1. **Success** (Green): Positive confirmation messages
2. **Error** (Red): Error messages and failures
3. **Warning** (Yellow): Warning and caution notifications
4. **Info** (Blue): General information and status updates

## Usage

### Simple Usage with Helper Functions

```tsx
import { 
  showSuccessToast, 
  showErrorToast,
  showWarningToast,
  showInfoToast
} from "@/lib/toast-helpers";

// Success toast
showSuccessToast({
  message: "Your reservation has been confirmed!",
  title: "Reservation Confirmed" // Optional, defaults to "Success"
});

// Error toast
showErrorToast({
  message: "Unable to process your reservation. Please try again.",
  title: "Reservation Failed" // Optional, defaults to "Error"
});

// Warning toast
showWarningToast({
  message: "Please login to continue with your reservation.",
  title: "Action Required" // Optional, defaults to "Warning"
});

// Info toast
showInfoToast({
  message: "Your reservation request has been sent for admin approval.",
  title: "Processing" // Optional, defaults to "Information"
});
```

### Generic Toast Function

```tsx
import { showToast } from "@/lib/toast-helpers";

showToast({
  type: "success", // "success", "error", "warning", "info", or "default"
  message: "Your order has been placed successfully!",
  title: "Order Placed", // Optional
  duration: 5000 // Optional, in milliseconds
});
```

### Advanced Usage with Direct Access to Toast API

```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Custom Toast",
  description: "This is a custom toast with advanced options",
  variant: "default", // "default", "destructive", "success", "warning", "info"
  duration: 5000,
  // Additional options
  action: <Button>Action Button</Button>
});
```

## Integration Requirements

Ensure these components are available in your application:

1. The `Toaster` component must be added to your main layout or App component:

```tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

## Accessibility Features

- ARIA roles ("alert") for screen readers
- High contrast text-to-background ratio for improved readability
- Keyboard accessible close button
- Adequate timing for reading notifications before auto-dismiss

## Demo

Check out the `ToastDemo` component for examples of all toast types.

```tsx
import { ToastDemo } from "@/components/ToastDemo";

// Render this component to see a demonstration of all toast types
<ToastDemo />
```