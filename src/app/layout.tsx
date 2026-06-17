import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track your job applications — manage status, interviews, and offers in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="text-base sm:text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-700 transition-colors shrink-0"
              >
                <span className="hidden xs:inline">Job Application Tracker</span>
                <span className="xs:hidden">Job Tracker</span>
              </Link>
              <Link
                href="/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium px-3 py-2 hover:bg-gray-700 active:bg-gray-800 transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="hidden sm:inline">Add Application</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-8">{children}</div>
          </main>
          <footer className="border-t bg-white py-4 text-center text-xs text-gray-400">
            Job Application Tracker · Built with Next.js &amp; PostgreSQL
          </footer>
        </div>
        <Toast />
      </body>
    </html>
  );
}
