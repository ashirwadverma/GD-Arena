import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GD Arena | Voice-First AI Group Discussion Practice Room',
  description:
    'Real-time spoken group discussion practice with autonomous AI personas and instant evidence-backed feedback for campus placements.',
  keywords: [
    'Group Discussion Practice',
    'Campus Placement GD',
    'AI GD Simulator',
    'Voice AI',
    'Placement Preparation',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
