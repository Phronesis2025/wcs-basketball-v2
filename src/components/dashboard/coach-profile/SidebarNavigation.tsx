// src/components/dashboard/coach-profile/SidebarNavigation.tsx
import React from "react";

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "teams", label: "Teams", icon: "🏀" },
  { id: "activity", label: "Activity", icon: "📊" },
  { id: "account", label: "Account", icon: "⚙️" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "resources", label: "Resources", icon: "📚" },
];

export default function SidebarNavigation({
  activeSection,
  onSectionChange,
}: SidebarNavigationProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 font-inter">
        Profile Sections
      </h3>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg font-inter transition-colors ${
              activeSection === section.id
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

