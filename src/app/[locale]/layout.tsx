import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Ezoic from '@/components/ads/Ezoic';
import '../globals.css';
import { DMProvider } from '@/context/DMContext';
import { ToastProvider } from '@/context/ToastContext';
import DirectMessage from '@/components/community/DirectMessage';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { locales } from '@/i18n';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: {
      default: `${t('appName')} — ${t('tagline')}`,
      template: `%s | ${t('appName')}`,
    },
    description: t('description'),
    keywords: ['NovaTrend', 'AI', 'News', 'Sentiment', 'Stock', 'Crypto', 'KPOP'],
    openGraph: {
      type: 'website',
      siteName: t('appName'),
      title: `${t('appName')} — ${t('tagline')}`,
      description: t('description'),
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Ezoic>
              <ToastProvider>
                <AuthProvider>
                  <DMProvider>
                    <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <DirectMessage />
                  </DMProvider>
                </AuthProvider>
              </ToastProvider>
            </Ezoic>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
