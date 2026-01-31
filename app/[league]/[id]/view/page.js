import { Metadata } from "next";
// Assuming ViewLeague is a component you have.
// If it contains the app store buttons, it will fit perfectly in this layout.
import ViewLeague from "../view/ViewLeague";

export const metadata = {
  title: "Play Competitive | Diamond Trivia",
  description: "Play competitive MLB trivia on Diamond Trivia",
  openGraph: {
    title: "Play me in competitive on Diamond Trivia",
    description: "Play competitive MLB trivia with me on Diamond Trivia",
    // Update this URL to your actual production URL when ready
    url: "https://www.diamondtrivia.com/competitive",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play me in competitive on Diamond Trivia",
    description: "Play competitive MLB trivia with me on Diamond Trivia",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CompetitiveInvitePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-center dark:bg-black sm:px-6 lg:px-8">
      {/* Main Content Container */}
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            You've been invited
          </h1>
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            to play multiplayer MLB trivia on{" "}
            <span className="text-red-600">Diamond Trivia</span>
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-50 px-2 text-sm text-zinc-400 dark:bg-black">
              Join the Game
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center space-y-6">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Don't have the app yet?
          </p>

          {/* Your Existing Component */}
          <div className="w-full">
            <ViewLeague />
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span className="block mb-1 text-red-600 font-bold">
              Important:
            </span>
            After downloading, come back and click the invite link again to join
            the lobby.
          </p>
        </div>
      </div>

      {/* Simple Footer Text (Replaces complex Footer component) */}
      <div className="absolute bottom-6 text-xs text-zinc-300 dark:text-zinc-700">
        &copy; {new Date().getFullYear()} Diamond Trivia
      </div>
    </div>
  );
}
