// src/components/ui/select.tsx
import { forwardRef, SelectHTMLAttributes } from "react";

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    className={`bg-navy text-white border border-gray-700 rounded p-2 focus:outline-none focus:border-red font-inter text-sm w-full disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
export default Select;
