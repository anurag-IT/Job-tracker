import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Job Application Tracker",
  description: "Track your job applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">
                Job Tracker
              </Link>
              <Link
                href="/new"
                className="inline-flex items-center rounded-md bg-gray-900 text-white text-sm font-medium px-3 py-1.5 hover:bg-gray-800"
              >
                + Add Application
              </Link>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
