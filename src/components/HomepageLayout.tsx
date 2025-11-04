"use client";

import { usePathname } from "next/navigation";
import TodaysEvents from "./TodaysEvents";
import Navbar from "./Navbar";

/**
 * Client component that conditionally renders TodaysEvents above Navbar
 * only on the homepage (pathname === "/")
 */
export default function HomepageLayout() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome && <TodaysEvents />}
      <Navbar />
    </>
  );
}

