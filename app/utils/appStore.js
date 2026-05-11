import { appLinks } from "@/utils/appLinks";

export function getPreferredStoreLink(userAgent = "") {
  const ua = String(userAgent || "").toLowerCase();
  const isAndroid = ua.includes("android");

  return isAndroid
    ? {
        href: appLinks.googlePlay,
        label: "Get it on Google Play",
        shortLabel: "Google Play",
      }
    : {
        href: appLinks.appStore,
        label: "Download on the App Store",
        shortLabel: "App Store",
      };
}
