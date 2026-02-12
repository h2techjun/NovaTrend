import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'NovaTrend — AI 뉴스 감성 분석 대시보드',
    template: '%s | NovaTrend',
  },
  description:
    'AI 기반 글로벌 뉴스 감성 분석 대시보드. 주식, 크립토, K-POP 뉴스를 대박호재/호재/악재/대박악재 4단계로 분류합니다.',
  keywords: ['뉴스', '감성분석', '주식', '크립토', 'K-POP', 'AI', 'NovaTrend'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'NovaTrend',
    title: 'NovaTrend — AI 뉴스 감성 분석 대시보드',
    description: 'AI 기반 글로벌 뉴스 감성 분석. 대박호재부터 대박악재까지.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
