import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "../components/app-sidebar";
import { ErrorBoundary } from "../components/error-boundary";
import LoadingSpinner from "../components/loading-spinner";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortinet Network Visualizer",
  description: "Visualize and manage Fortinet network devices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 p-6 overflow-auto">
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}
