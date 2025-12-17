import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeoBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const NeoBadge = forwardRef<HTMLSpanElement, NeoBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-secondary text-secondary-foreground",
      primary: "bg-primary text-primary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "neo-badge",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

NeoBadge.displayName = "NeoBadge";

export { NeoBadge };
