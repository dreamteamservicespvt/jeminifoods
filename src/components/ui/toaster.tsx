import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Bell,
  CalendarCheck,
  Clock,
  Users,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          // Check for WhatsApp link
          const whatsAppLink = (props as any).whatsAppLink;
          const reservationData = (props as any).reservationData;
          
          // Get icon based on toast variant
          const getIcon = () => {
            // Special handling for reservation toasts
            const isReservationToast = 
              title?.toString().toLowerCase().includes("reservation") || 
              description?.toString().toLowerCase().includes("reservation") ||
              reservationData;
            
            if (isReservationToast) {
              return <CalendarCheck className="h-5 w-5" />;
            }
            
            // Regular icons based on variant
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
          const isReservationToast = 
            title?.toString().toLowerCase().includes("reservation") || 
            description?.toString().toLowerCase().includes("reservation");
          
          // Format description lines
          const descLines = description?.toString().split('\n') || [];
          
          // Determine if toast contains multiline description with reservation details
          const hasReservationDetails = descLines.length > 1 && isReservationToast;
          
          // Custom styling based on content
          const reservationClass = isReservationToast 
            ? "border-amber-500/60 shadow-amber-500/30 bg-gradient-to-br from-black/90 to-amber-950/90" 
            : "";

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
              className="relative"
            >
              {/* Subtle glow for reservation toasts */}
              {isReservationToast && (
                <div className="absolute inset-0 blur-lg bg-amber-500/10 rounded-xl -z-10 
                    animate-pulse-slow" />
              )}
              
              <Toast
                key={id}
                {...props}
                className={cn(
                  "group flex flex-row items-start gap-4 backdrop-blur-sm", 
                  reservationClass,
                  hasReservationDetails && "p-0 overflow-hidden"
                )}
              >
                {hasReservationDetails ? (
                  <div className="flex flex-col w-full">
                    {/* Reservation header */}
                    <div className="flex items-start gap-3 p-4 pb-2">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        props.variant === "success" && "bg-green-950/60",
                        props.variant === "destructive" && "bg-red-950/60",
                        props.variant === "warning" && "bg-yellow-950/60",
                        props.variant === "info" && "bg-blue-950/60",
                        (!props.variant || props.variant === "default") && "bg-amber-950/60"
                      )}>
                        {getIcon()}
                      </div>
                      
                      <div className="flex-1 pt-0.5">
                        {title && <ToastTitle className="leading-tight">{title}</ToastTitle>}
                        {descLines.length > 0 && (
                          <p className="text-sm opacity-90 leading-relaxed">{descLines[0]}</p>
                        )}
                      </div>
                      
                      <ToastClose />
                    </div>
                    
                    {/* Reservation details section */}
                    <div className="px-4 pb-3 pt-1">
                      {descLines.slice(1).map((line, i) => {
                        // Add reservation detail icons
                        let icon: React.ReactNode = null;
                        if (line.toLowerCase().includes("date") || line.match(/\w+day/i)) {
                          icon = <CalendarCheck className="h-4 w-4 text-amber-400/80" />;
                        } else if (line.toLowerCase().includes("time") || line.includes(":")) {
                          icon = <Clock className="h-4 w-4 text-amber-400/80" />;
                        } else if (line.toLowerCase().includes("guest")) {
                          icon = <Users className="h-4 w-4 text-amber-400/80" />;
                        }
                        
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm text-cream/90 my-1">
                            {icon}
                            <span>{line}</span>
                          </div>
                        );
                      })}
                      
                      {/* Add WhatsApp button if link is available */}
                      {whatsAppLink && (
                        <div className="mt-4 pt-3 border-t border-amber-500/20">
                          <a
                            href={whatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" />
                            </svg>
                            Contact via WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Action button in its own section */}
                    {action && (
                      <div className="px-4 py-3 border-t border-amber-600/20 flex justify-end">
                        {action}
                      </div>
                    )}
                  </div>
                ) : (
                  // Standard toast layout for non-reservation toasts
                  <>
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      props.variant === "success" && "bg-green-950/60",
                      props.variant === "destructive" && "bg-red-950/60",
                      props.variant === "warning" && "bg-yellow-950/60",
                      props.variant === "info" && "bg-blue-950/60",
                      (!props.variant || props.variant === "default") && "bg-amber-950/60"
                    )}>
                      {getIcon()}
                    </div>

                    <div className="flex-1 space-y-1">
                      {title && <ToastTitle>{title}</ToastTitle>}
                      {description && (
                        <ToastDescription>{description}</ToastDescription>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {action}
                      <ToastClose />
                    </div>
                  </>
                )}
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <ToastViewport className="p-6 gap-3 max-w-md" />
    </ToastProvider>
  );
}
