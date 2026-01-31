"use client";

import { appLinks } from "@/utils/appLinks";

export default function ViewLeague() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
      {/* App Store Button */}
      <a
        href={appLinks.appStore}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl bg-black px-5 py-3 text-white transition-all duration-200 hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        <svg
          className="h-8 w-8 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99.98-3.16-1.01.04-2.24.68-2.96 1.52-.65.75-1.21 1.95-1.06 3.1 1.14.09 2.31-.57 3.04-1.46z" />
        </svg>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-medium opacity-80">
            Download on the
          </span>
          <span className="text-lg font-bold">App Store</span>
        </div>
      </a>

      {/* Google Play Button */}
      <a
        href={appLinks.googlePlay}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-transparent px-5 py-3 text-zinc-900 transition-all duration-200 hover:bg-zinc-50 hover:border-zinc-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
      >
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3,20.5V3.5C3,2.91,3.34,2.39,3.84,2.15L13.69,12L3.84,21.85C3.34,21.6,3,21.09,3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08,20.75,11.5,20.75,12C20.75,12.5,20.54,12.92,20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-medium opacity-70">Get it on</span>
          <span className="text-lg font-bold">Google Play</span>
        </div>
      </a>
    </div>
  );
}
