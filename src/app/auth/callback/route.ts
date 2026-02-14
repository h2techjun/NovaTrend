import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 소셜 로그인 성공 → 프로필 자동 생성 (없으면)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User';

          await supabase.from('profiles').insert({
            id: user.id,
            username: displayName,
            display_name: displayName,
            avatar_url: user.user_metadata?.avatar_url || null,
            plan: 'free',
            points: 0,
            locale: 'ko',
          });
        }
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 에러 시 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
