// src/lib/calendarColors.ts
// Maps event types to Tailwind color class names for background and text.

export function eventTypeToColor(eventType: string): {
  bg: string;
  text: string;
  ring: string;
} {
  const t = (eventType || "").toString().trim().toLowerCase();
  switch (t) {
    case "game":
      return {
        bg: "bg-red",
        text: "text-white",
        ring: "ring-[rgba(217,30,24,0.5)]",
      };
    case "practice":
      return {
        bg: "bg-green-700",
        text: "text-white",
        ring: "ring-green-400/50",
      };
    case "tournament":
      return {
        bg: "bg-purple-700",
        text: "text-white",
        ring: "ring-purple-400/50",
      };
    case "update":
      return {
        bg: "bg-yellow-400",
        text: "text-black",
        ring: "ring-yellow-300/60",
      };
    case "meeting":
    default:
      return {
        bg: "bg-yellow-400",
        text: "text-black",
        ring: "ring-yellow-300/60",
      };
  }
}
