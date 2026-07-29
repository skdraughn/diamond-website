"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";

export default function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    logFirebaseEvent("page_view", {
      page_location: window.location.href,
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
