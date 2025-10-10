// src/components/dashboard/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bebas text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 font-inter">{subtitle}</div>
      </div>
    </div>
  );
}
