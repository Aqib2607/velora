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
        "hover:border-foreground/30",
        "focus:border-foreground focus:ring-4 focus:ring-foreground/5",
        error && "border-error focus:border-error focus:ring-error/20"
      ),
      glass: cn(
        "bg-background border-border",
        "hover:border-foreground/30",
        "focus:border-foreground focus:ring-4 focus:ring-foreground/5",
        error && "border-error focus:border-error focus:ring-error/20"
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              isFocused ? "text-foreground" : "text-foreground/80",
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
