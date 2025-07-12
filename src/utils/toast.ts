import { toast } from "@/hooks/use-toast";

type ToastType = "default" | "success" | "error" | "warning" | "info";

interface ShowToastParams {
  type?: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * Utility function to show toast notifications consistently across the application
 * 
 * @example
 * // Success toast
 * showToast({
 *   type: "success",
 *   message: "Your order has been placed successfully!",
 *   duration: 5000
 * });
 */
export const showToast = ({
  type = "default",
  message,
  title,
  duration = 4000,
}: ShowToastParams) => {
  // Map error to destructive for Radix UI Toast
  const variant = type === "error" ? "destructive" : type;
  
  return toast({
    variant: variant as any,
    title: title,
    description: message,
    duration: duration,
  });
};

// Convenience functions for different toast types
export const successToast = (message: string, title?: string, duration?: number) => 
  showToast({ type: "success", message, title, duration });

export const errorToast = (message: string, title?: string, duration?: number) => 
  showToast({ type: "error", message, title, duration });

export const warningToast = (message: string, title?: string, duration?: number) => 
  showToast({ type: "warning", message, title, duration });

export const infoToast = (message: string, title?: string, duration?: number) => 
  showToast({ type: "info", message, title, duration });