import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YourTrip | Personal Trip Operating System',
  description: 'An all-in-one travel companion that assists before, during, and after your trip. AI assists, you decide.',
  keywords: ['travel', 'itinerary', 'trip planner', 'split expenses', 'travel companion', 'operating system'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF8F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-canvas-50">
      <body className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-terracotta-200 selection:text-terracotta-900">
        {children}
      </body>
    </html>
  );
}
