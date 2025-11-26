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
      className={`bg-white/5 border border-white/10 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white font-inter">
          {title}
        </h3>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-white font-inter">{value}</div>
        <div className="text-sm text-slate-400 font-inter">{subtitle}</div>
      </div>
    </div>
  );
}
