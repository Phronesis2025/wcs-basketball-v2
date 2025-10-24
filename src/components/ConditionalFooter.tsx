"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin pages
  const shouldShowFooter = !pathname.startsWith("/admin");
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <Footer />;
}
