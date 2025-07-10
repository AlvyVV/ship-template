import '@/app/globals.css';

import {Lora as FontSerif, Plus_Jakarta_Sans as FontSans, Roboto_Mono as FontMono} from 'next/font/google';
import {cn} from '@/lib/utils';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap', // 优化字体加载
    preload: true,   // 预加载关键字体
});

const fontSerif = FontSerif({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
    preload: false,  // 非关键字体不预加载
});

const fontMono = FontMono({
    subsets: ['latin'],
    variable: '--font-mono', // 修复变量名
    display: 'swap',
    preload: false,
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
