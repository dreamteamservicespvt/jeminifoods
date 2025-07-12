import { toast } from "@/hooks/use-toast";

/**
 * Toast helper functions for the Jemini Foods website
 * Provides easy-to-use toast notifications with consistent styling
 */

interface ToastOptions {
  message: string;
  title?: string;
  duration?: number;
}

/**
 * Shows a success toast notification
 */
export function showSuccessToast({ message, title = "Success", duration = 5000 }: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "success",
    duration,
  });
}

/**
 * Shows an error toast notification
 */
export function showErrorToast({ message, title = "Error", duration = 6000 }: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "destructive",
    duration,
  });
}

/**
 * Shows a warning toast notification
 */
export function showWarningToast({ message, title = "Warning", duration = 5000 }: ToastOptions) {
  return toast({
    title, 
    description: message,
    variant: "warning",
    duration,
  });
}

/**
 * Shows an info toast notification
 */
export function showInfoToast({ message, title = "Information", duration = 4500 }: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "info",
    duration,
  });
}

/**
 * General purpose toast function that allows specifying the type
 */
export function showToast({ 
  type = "default",
  message,
  title,
  duration = 5000
}: {
  type: "success" | "error" | "warning" | "info" | "default";
  message: string;
  title?: string;
  duration?: number;
}) {
  switch (type) {
    case "success":
      return showSuccessToast({ message, title, duration });
    case "error":
      return showErrorToast({ message, title, duration });
    case "warning":
      return showWarningToast({ message, title, duration });
    case "info":
      return showInfoToast({ message, title, duration });
    default:
      return toast({
        title,
        description: message,
        duration,
      });
  }
}