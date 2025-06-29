import '@/app/globals.css';

import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: {
    default: 'VV',
    template: '%s',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased overflow-x-hidden', fontSans.variable)}>{children}</body>
    </html>
  );
}
