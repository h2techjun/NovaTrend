import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SettingsClient from './SettingsClient';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'profile.private' });

  return {
    title: `${t('settings')} | NovaTrend`,
    description: t('settingsDesc'),
  };
}

export default function Page() {
  return <SettingsClient />;
}
