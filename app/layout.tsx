import '@/app/globals.css';

import {Lora as FontSerif, Plus_Jakarta_Sans as FontSans, Roboto_Mono as FontMono} from 'next/font/google';
import {cn} from '@/lib/utils';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontSerif = FontSerif({
    subsets: ['latin'],
    variable: '--font-serif',
});

const fontMono = FontMono({
    subsets: ['latin'],
    variable: '--font-serif',
});

export const metadata = {
    title: {
        default: 'Ai Style',
        template: '%s',
    },
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={cn('min-h-screen bg-background font-sans antialiased overflow-x-hidden', fontSans.variable, fontSerif.variable, fontMono.variable)}>{children}</body>
        </html>
    );
}
