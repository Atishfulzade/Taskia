import React from "react";
import { cn } from "@/lib/utils"; // Ensure you have the `cn` utility

const Button = React.forwardRef(
  (
    {
      type = "button",
      variant = "solid",
      size = "md",
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md cursor-pointer border border-slate-300 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

    const variantStyles = {
      solid: "bg-primary text-white hover:bg-primary/90",
      outline:
        "border border-primary text-primary hover:bg-primary/10 hover:border-primary/90",
      ghost: "text-primary hover:bg-primary/10",
    };

    const sizeStyles = {
      sm: "px-2 py-1 text-sm gap-1", // Small button with slight padding
      md: "px-3 py-1.5 text-sm gap-1.5", // Default medium size
      lg: "px-4 py-2 text-base gap-2", // Larger button
      icon: "p-2", // Perfect for icon-only buttons
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
