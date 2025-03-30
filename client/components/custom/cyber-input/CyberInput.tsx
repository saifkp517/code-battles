// components/custom/cyber-input.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full font-cyber text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cyber-border bg-input px-3 py-2 text-cyber-blue ring-offset-background focus-visible:ring-1 focus-visible:ring-cyber-blue focus-visible:ring-offset-1",
        terminal: "cyber-border border-cyber-green bg-black/80 text-cyber-green px-3 py-2 focus-visible:ring-1 focus-visible:ring-cyber-green focus-visible:ring-offset-1",
        ghost: "bg-transparent border-b border-cyber-blue/50 rounded-none px-3 py-2 text-cyber-blue focus-visible:border-cyber-blue",
        neon: "cyber-border bg-input px-3 py-2 text-cyber-blue shadow-cyber focus-visible:shadow-cyber animate-neon-pulse",
      },
      shape: {
        default: "rounded-sm",
        clipped: "cyber-clip-corner",
        slant: "cyber-clip-slant-tr",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "clipped",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const CyberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, shape, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
CyberInput.displayName = "CyberInput";

export { CyberInput };