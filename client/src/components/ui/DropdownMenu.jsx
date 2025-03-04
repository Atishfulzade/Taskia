import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils"; // Ensure you have the `cn` utility

// DropdownMenu Root
const DropdownMenu = DropdownMenuPrimitive.Root;

// DropdownMenu Trigger
const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
);
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

// DropdownMenu Content
const DropdownMenuContent = React.forwardRef(
  ({ className, align = "start", ...props }, ref) => (
    <DropdownMenuPrimitive.Content
      ref={ref}
      align={align}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border-slate-300 border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// DropdownMenu Item
const DropdownMenuItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// DropdownMenu Separator
const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-slate-300", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
