// Global styles are now imported in the root layout

import { getMessages, getTranslations } from 'next-intl/server';
import { locales } from '@/i18n/locale';

import { AppContextProvider } from '@/contexts/app';
import { Inter as FontSans } from 'next/font/google';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/providers/theme';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: {
      template: `%s`,
      default: t('metadata.title') || '',
    },
    description: t('metadata.description') || '',
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || '';
  const googleAdsenseCode = process.env.NEXT_PUBLIC_GOOGLE_ADCODE || '';

  return (
    <NextIntlClientProvider messages={messages}>
      <AppContextProvider>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </AppContextProvider>
    </NextIntlClientProvider>
  );
}
