import React from "react";
import { cn } from "../../lib/utils";

const Label = ({ htmlFor, children, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn("text-sm font-medium leading-none", className)}
  >
    {children}
  </label>
);

export { Label };
