"use client";

import { androidAppUrl, iosAppUrl } from "./appStore";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";

function storeLinks(userAgent = "") {
  if (/android/i.test(userAgent)) {
    return `Download Diamond Trivia:\nAndroid: ${androidAppUrl}\niPhone: ${iosAppUrl}`;
  }
  return `Download Diamond Trivia: ${iosAppUrl}`;
}

export async function shareResult({ game, title, text }) {
  const platform = /android/i.test(navigator.userAgent) ? "android" : "ios_or_web";
  const shareText = `${text.trim()}\n\n${storeLinks(navigator.userAgent)}`;
  const params = { app: "diamond", game, platform };

  if (navigator.share) {
    try {
      await navigator.share({ title, text: shareText });
      logFirebaseEvent("share_complete", params);
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      throw error;
    }
  }
  await navigator.clipboard.writeText(shareText);
  logFirebaseEvent("share_copy", params);
  return "copied";
}
