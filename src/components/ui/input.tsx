// src/components/ui/input.tsx
import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    className={`bg-navy text-white border border-gray-700 rounded p-2 focus:outline-none focus:border-red font-inter text-sm w-full disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
export default Input;
