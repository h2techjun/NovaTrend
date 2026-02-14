import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProfileClient from './ProfileClient';
import { createClient } from '@supabase/supabase-js';

// Server-side supabase client for metadata fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ 
  params: { id, locale } 
}: { 
  params: { id: string; locale: string } 
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'profile.public' });
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, bio')
      .eq('id', id)
      .single();

    if (!profile) {
      return {
        title: `${t('notFound')} | NovaTrend`,
      };
    }

    const name = profile.display_name || profile.username;
    const description = profile.bio || `${name}${t('rank')} NovaTrend.`;

    return {
      title: `${name} | NovaTrend`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${name} | NovaTrend`,
        description: description.substring(0, 160),
        type: 'profile',
        username: profile.username,
      },
      twitter: {
        card: 'summary',
        title: `${name} | NovaTrend`,
        description: description.substring(0, 160),
      },
    };
  } catch (error) {
    return {
      title: `${t('notFound')} | NovaTrend`,
    };
  }
}

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <ProfileClient id={id} />;
}
