import { appLinks } from "@/utils/appLinks";
import Link from "next/link";

// Simple SVG Icons to keep the design lightweight and dependency-free
function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.4l8.3 8.3a2.41 2.41 0 0 0 3.4 0l8.3-8.3a2.41 2.41 0 0 0 0-3.4L14.4 2a2.41 2.41 0 0 0-3.4 0L2.7 10.3z" />
      <path d="M2.7 10.3 12 21.3" />
      <path d="M12 2.6 21.3 11.9" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 font-sans selection:bg-red-500 selection:text-white">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            Diamond Trivia
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Step up to the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              plate.
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
            The ultimate trivia experience for baseball purists. Test your
            knowledge of stats, history, and iconic players.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={appLinks.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex h-12 min-w-[160px] items-center justify-center overflow-hidden rounded-full bg-red-600 px-8 font-medium text-white transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <span className="mr-2">Get Diamond Trivia</span>
            </Link>

            <Link
              href="/strikeout"
              className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-zinc-200 bg-white px-8 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Play Today's Strikeout
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          <div className="group rounded-2xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <CalendarIcon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Daily Games</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              5 new unique games every single day. Keep your streak alive.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <DiamondIcon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Game Collections</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Play curated sets of games handcrafted by MLB fans.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <TrophyIcon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">League Standings</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Compete globally or create private leagues to prove you know ball.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-zinc-200 py-10 text-center dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} Diamond Trivia. Not affiliated with MLB.
        </p>
      </footer>
    </div>
  );
}
