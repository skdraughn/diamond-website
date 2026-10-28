"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";

import { createPageViewTracker } from "@/utils/pageViewTracker.mjs";

const trackPageView = createPageViewTracker(logFirebaseEvent);

export default function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView({
      location: window.location.href,
      pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }, [pathname]);

  return null;
}
