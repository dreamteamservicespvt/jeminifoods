import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-400/50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      responsive: {
        true: "",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      responsive: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Responsive Button Component that adapts to different screen sizes
 */
const ButtonResponsive = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, responsive, asChild = false, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    // Apply responsive adjustments when enabled
    const responsiveClasses = responsive && isMobile
      ? "min-h-[44px] touch-action-manipulation px-3 py-1 text-sm" // Mobile-optimized touch target
      : "";
    
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, responsive, className }), responsiveClasses)}
        ref={ref}
        {...props}
      />
    );
  }
);

ButtonResponsive.displayName = "ButtonResponsive";

export { ButtonResponsive, buttonVariants };
