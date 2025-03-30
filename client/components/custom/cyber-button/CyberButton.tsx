// components/custom/cyber-button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap font-cyber text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cyber-border bg-cyber-black hover:bg-muted text-cyber-blue hover:text-cyber-blue-light cyber-text-shadow",
        primary: "cyber-border bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 hover:text-cyber-blue-light cyber-text-shadow",
        destructive: "cyber-border-pink bg-cyber-pink/10 text-cyber-pink hover:bg-cyber-pink/20 hover:text-cyber-pink-light cyber-text-shadow-pink",
        outline: "cyber-border bg-transparent hover:bg-cyber-blue/10 text-cyber-blue hover:text-cyber-blue-light",
        ghost: "bg-transparent hover:bg-cyber-blue/10 text-cyber-blue hover:text-cyber-blue-light",
        link: "bg-transparent underline-offset-4 underline text-cyber-blue hover:text-cyber-blue-light",
        terminal: "font-cyber border border-cyber-green bg-cyber-black text-cyber-green hover:bg-cyber-green/10"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-9 w-9",
      },
      glitch: {
        none: "",
        subtle: "hover:animate-cyber-glitch",
        always: "animate-cyber-glitch",
      },
      neon: {
        true: "animate-neon-pulse",
        false: "",
      },
      shape: {
        default: "",
        clipped: "cyber-clip-corner",
        slant: "cyber-clip-slant-tr",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glitch: "subtle",
      neon: false,
      shape: "clipped",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const CyberButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glitch, neon, shape, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, glitch, neon, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

CyberButton.displayName = "CyberButton";

export { CyberButton, buttonVariants };