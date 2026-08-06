"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";

/** Renders the site Navigation on all public routes.
 *  Suppressed automatically on /admin and any sub-path. */
export function NavigationWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Navigation />;
}
