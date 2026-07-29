"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import {
  getFirebaseApp,
  hasFirebaseAnalyticsConfig,
} from "./firebaseClient";

let analyticsPromise;

async function getFirebaseAnalytics() {
  if (analyticsPromise) return analyticsPromise;

  analyticsPromise = (async () => {
    if (!(await isSupported())) return null;
    if (!hasFirebaseAnalyticsConfig()) return null;
    const app = getFirebaseApp();
    if (!app) return null;
    return getAnalytics(app);
  })();

  return analyticsPromise;
}

export async function logFirebaseEvent(name, params = {}) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) logEvent(analytics, name, params);
  } catch {
    // Analytics must never interrupt gameplay or navigation.
  }
}

export function trackAppStoreClick({ game = "site", placement, platform }) {
  return logFirebaseEvent("app_store_click", {
    app: "diamond",
    game,
    placement,
    platform,
  });
}
