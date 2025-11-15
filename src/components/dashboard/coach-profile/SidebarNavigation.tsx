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
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-bebas text-white mb-4 uppercase">
        Profile Sections
      </h3>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-md font-inter transition-colors ${
              activeSection === section.id
                ? "bg-[red] text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
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

