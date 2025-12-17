import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeoSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const NeoSelect = forwardRef<HTMLSelectElement, NeoSelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block mb-2 font-bold text-foreground uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "neo-select",
            error && "border-destructive",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-destructive font-bold text-sm">{error}</p>
        )}
      </div>
    );
  }
);

NeoSelect.displayName = "NeoSelect";

export { NeoSelect };
