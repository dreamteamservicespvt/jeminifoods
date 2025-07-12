import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Bell,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Extend the toast props to include reservation-specific properties
interface ExtendedToastProps {
  date?: string;
  time?: string;
  guests?: number;
  tableId?: string;
}

export function EnhancedToaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({
          id,
          title,
          description,
          action,
          date,
          time,
          guests,
          tableId,
          ...props
        }: typeof toasts[0] & ExtendedToastProps) {
          // Get icon based on toast variant
          const getIcon = () => {
            switch (props.variant) {
              case "success":
                return <CheckCircle className="h-5 w-5" />;
              case "destructive":
                return <XCircle className="h-5 w-5" />;
              case "warning":
                return <AlertCircle className="h-5 w-5" />;
              case "info":
                return <Info className="h-5 w-5" />;
              default:
                return <Bell className="h-5 w-5" />;
            }
          };

          // Custom styling for reservation-specific toasts
          const isReservationToast = title?.toString().toLowerCase().includes("reservation") || 
                                    description?.toString().toLowerCase().includes("reservation");
          
          const reservationClass = isReservationToast ? "border-amber-500/50 shadow-amber-500/20" : "";

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 50, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 25,
              }}
            >
              <Toast
                key={id}
                {...props}
                className={cn(
                  "group flex flex-row items-start gap-3", 
                  reservationClass
                )}
              >
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    props.variant === "success" && "bg-green-950/60",
                    props.variant === "destructive" && "bg-red-950/60",
                    props.variant === "warning" && "bg-yellow-950/60",
                    props.variant === "info" && "bg-blue-950/60",
                    !props.variant || props.variant === "default" && "bg-amber-950/60"
                )}>
                  {getIcon()}
                </div>

                <div className="flex-1 space-y-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                  
                  {/* Reservation specific additional info display */}
                  {isReservationToast && (
                    <div className="flex items-center space-x-3 mt-2 text-xs text-amber-400/80">
                      {date && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{date}</span>
                        </div>
                      )}
                      {time && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{time}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {action}
                  <ToastClose />
                </div>
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <ToastViewport className="p-6 gap-3" />
    </ToastProvider>
  );
}
