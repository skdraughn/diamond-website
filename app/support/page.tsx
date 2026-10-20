import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Diamond Trivia.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <div className="min-h-screen text-[var(--text)]  text-[var(--text-muted)] px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Support</h1>
          <p className="text-[var(--text-muted)] text-[var(--text-muted)]">
            Diamond Trivia — DNA Development LLC
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-[var(--text-muted)] text-[var(--text-muted)]">
            Email us and we’ll help you out.
          </p>

          <a
            href="mailto:steve@gridirontrivia.com?subject=Diamond%20Trivia%20Support"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Email Support
          </a>

          <p className="text-sm text-[var(--text-muted)] text-[var(--text-muted)]">
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
            className="underline text-[var(--text-muted)] text-[var(--text-muted)]"
          >
            diamondtrivia.app/privacy
          </Link>
        </section>

        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 text-sm text-[var(--text-muted)] text-[var(--text-muted)]">
          © {new Date().getFullYear()} Diamond Trivia — DNA Development LLC
        </footer>
      </div>
    </div>
  );
}
