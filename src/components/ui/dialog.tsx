// src/components/ui/dialog.tsx
"use client";
import React, { useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface DialogProps {
  children: ReactNode;
  className?: string;
}

interface DialogComponent extends React.FC<DialogProps> {
  Trigger: React.FC<{ children: ReactNode; className?: string }>;
  Content: React.FC<{ children: ReactNode; className?: string }>;
  Header: React.FC<{ children: ReactNode }>;
  Title: React.FC<{ children: ReactNode }>;
}

const Dialog: DialogComponent = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === Dialog.Trigger
          ? React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setIsOpen(true),
              className: `bg-red text-white font-bebas rounded p-2 hover:bg-red/80 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 ${
                (child.props as any).className || ""
              }`,
            })
          : null
      )}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? { opacity: 1 }
              : { opacity: 1 }
          }
        >
          <motion.div
            className="bg-navy border border-red-500/50 rounded-lg p-4 max-w-lg w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child) && child.type !== Dialog.Trigger
                ? child
                : null
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-700 text-white font-inter rounded p-2 mt-4 w-full"
              aria-label="Close dialog"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

Dialog.Trigger = ({ children, className }) => (
  <button className={className} aria-label="Open dialog">
    {children}
  </button>
);

Dialog.Content = ({ children, className }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

Dialog.Header = ({ children }) => <div className="mb-4">{children}</div>;

Dialog.Title = ({ children }) => (
  <h2 className="text-2xl font-bebas text-white">{children}</h2>
);

Dialog.displayName = "Dialog";
export default Dialog;
