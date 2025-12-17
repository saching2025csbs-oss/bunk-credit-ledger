import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeoCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const NeoCard = forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          hoverable ? "neo-card-hover" : "neo-card",
          "p-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeoCard.displayName = "NeoCard";

export { NeoCard };
