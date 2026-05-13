import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass";
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseStyles = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-offset-0";
    
    const variants = {
      default: cn(
        "bg-background border-border",
        "hover:border-brand-500/50",
        "focus:border-brand-500 focus:ring-brand-500/20",
        error && "border-error focus:border-error focus:ring-error/20"
      ),
      glass: cn(
        "glass border-border/50",
        "hover:border-brand-500/50",
        "focus:border-brand-500 focus:ring-brand-500/20",
        error && "border-error focus:border-error focus:ring-error/20"
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              isFocused ? "text-brand-500" : "text-foreground",
              error && "text-error"
            )}
            animate={{ x: isFocused ? 2 : 0 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            className={cn(
              baseStyles,
              variants[variant],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}

          {/* Focus Ring Animation */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                boxShadow: error
                  ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                  : "0 0 0 3px rgba(168, 85, 247, 0.1)",
              }}
            />
          )}
        </div>

        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-2 text-sm",
              error ? "text-error" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export default PremiumInput;
