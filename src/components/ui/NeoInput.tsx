import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NeoInput = forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block mb-2 font-bold text-foreground uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "neo-input",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-destructive font-bold text-sm">{error}</p>
        )}
      </div>
    );
  }
);

NeoInput.displayName = "NeoInput";

export { NeoInput };
