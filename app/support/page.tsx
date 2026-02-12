import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Support</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Diamond Trivia — DNA Development LLC
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Email us and we’ll help you out.
          </p>

          <a
            href="mailto:steve@gridirontrivia.com?subject=Diamond%20Trivia%20Support"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Email Support
          </a>

          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Or email:{" "}
            <a className="underline" href="mailto:steve@gridirontrivia.com">
              steve@gridirontrivia.com
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Privacy Policy</h2>
          <Link
            href="https://diamondtrivia.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-zinc-700 dark:text-zinc-300"
          >
            diamondtrivia.app/privacy
          </Link>
        </section>

        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} Diamond Trivia — DNA Development LLC
        </footer>
      </div>
    </div>
  );
}