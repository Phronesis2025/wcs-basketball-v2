"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TodaysEvents from "./TodaysEvents";
import Navbar from "./Navbar";

/**
 * Client component that conditionally renders TodaysEvents above Navbar
 * only on the homepage (pathname === "/")
 */
function HomepageLayoutInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const isPrint = searchParams?.get("print") === "1";

  return (
    <>
      {isHome && <TodaysEvents />}
      {!isPrint && <Navbar />}
    </>
  );
}

export default function HomepageLayout() {
  return (
    <Suspense fallback={<Navbar />}>
      <HomepageLayoutInner />
    </Suspense>
  );
}

