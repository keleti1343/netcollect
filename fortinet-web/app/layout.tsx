import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "../components/app-sidebar";
import { ErrorBoundary } from "../components/error-boundary";
import LoadingSpinner from "../components/loading-spinner";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortinet Network Visualizer",
  description: "Visualize and manage Fortinet network devices",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: { url: '/favicon.svg', type: 'image/svg+xml' }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 p-6 overflow-auto px-4 sm:px-6 lg:px-8">
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
