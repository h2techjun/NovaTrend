import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RulesClient from './RulesClient';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'rules' });

  return {
    title: `${t('title')} | NovaTrend`,
    description: t('subtitle'),
    openGraph: {
      title: `${t('title')} | NovaTrend`,
      description: t('subtitle'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} | NovaTrend`,
      description: t('subtitle'),
    },
  };
}

export default function Page() {
  return <RulesClient />;
}
