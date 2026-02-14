import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HomeClient from './HomeClient';

export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  const title = `${tCommon('appName')} — ${tCommon('tagline')}`;
  const description = `${t('title1')} ${t('titleHighlight1')} ${t('title2')} ${t('titleHighlight2')}. ${t('subtitle')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'NovaTrend',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
