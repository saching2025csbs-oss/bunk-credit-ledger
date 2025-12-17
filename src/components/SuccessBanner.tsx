import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface SuccessBannerProps {
  show: boolean;
  message?: string;
  onClose: () => void;
}

export function SuccessBanner({ show, message = "SAVED!", onClose }: SuccessBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-slide-in">
      <div className="neo-card bg-success p-8 md:p-12 success-banner">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-success-foreground border-[3px] border-foreground flex items-center justify-center">
            <Check className="w-10 h-10 md:w-12 md:h-12 text-success" strokeWidth={4} />
          </div>
          <span className="text-4xl md:text-6xl font-bold text-success-foreground tracking-tight">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
