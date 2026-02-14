'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDM } from '@/hooks/useDM';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, Calendar, FileText, Award, Loader2, ChevronLeft, ArrowRight, Heart, Eye, Clock } from 'lucide-react';
import { getLevel } from '@/lib/level';
import { motion } from 'framer-motion';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  points: number;
}

interface Post {
  id: number;
  title: string;
  category: string;
  created_at: string;
  views: number;
  likes: number;
}

export default function ProfileClient({ id }: { id: string }) {
  const locale = useLocale();
  const t = useTranslations('profile.public');
  const tLevel = useTranslations('level');
  const tCommon = useTranslations('common');
  const { user: currentUser } = useAuth();
  const { openDM } = useDM();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio, created_at, points')
          .eq('id', id)
          .single();

        if (profileError || !profileData) {
          setError(t('notFound'));
          return;
        }

        setProfile(profileData);

        const { count, error: postError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', id)
          .eq('is_deleted', false);

        if (!postError) {
          setPostCount(count || 0);
        }

        const { data: postsData } = await supabase
          .from('posts')
          .select('id, title, category, created_at, views, likes')
          .eq('author_id', id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (postsData) {
          setLatestPosts(postsData);
        }

      } catch (err) {
        setError(tCommon('error'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfile();
    }
  }, [id, supabase, t, tCommon]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-red-500">{error || t('notFound')}</p>
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('back')}
        </button>
      </div>
    );
  }

  const level = getLevel(profile.points || 0);
  const isMe = currentUser?.id === profile.id;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 md:p-8 shadow-lg overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500" />
        
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex flex-col items-center gap-5 w-full md:w-auto">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center text-4xl font-bold text-brand-600 shadow-inner overflow-hidden border-4 border-white dark:border-[hsl(var(--card))] group-hover:scale-105 transition-transform duration-300">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                ) : (
                  (profile.display_name || profile.username)?.[0]?.toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-md text-xl">
                {level.icon}
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
               <span className={cn("text-xs font-bold px-3 py-1 bg-[hsl(var(--muted))] rounded-full mb-3 border border-[hsl(var(--border))]", level.color)}>
                 {t('rank')}: {tLevel(level.name)}
               </span>
               <h1 className="text-2xl font-bold mb-1">{profile.display_name || profile.username}</h1>
               <span className="text-sm text-[hsl(var(--muted-foreground))]">@{profile.username}</span>
            </div>
            
            {!isMe && currentUser && (
              <button 
                onClick={() => openDM(profile.id)} 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-600/20"
              >
                <MessageCircle className="h-4 w-4" />
                {t('message')}
              </button>
            )}
          </div>

          <div className="flex-1 w-full space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[hsl(var(--muted))] border border-transparent hover:border-brand-500/20 transition-colors">
                 <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-1">
                    <Calendar className="h-5 w-5" />
                 </div>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--muted-foreground))]">{t('joined')}</p>
                 <p className="text-sm font-bold">{new Date(profile.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
               
               <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[hsl(var(--muted))] border border-transparent hover:border-brand-500/20 transition-colors">
                 <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-1">
                    <FileText className="h-5 w-5" />
                 </div>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--muted-foreground))]">{t('posts')}</p>
                 <p className="text-sm font-bold">{postCount}</p>
               </div>
               
               <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[hsl(var(--muted))] border border-transparent hover:border-brand-500/20 transition-colors">
                 <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-1">
                    <Award className="h-5 w-5" />
                 </div>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--muted-foreground))]">{t('xp')}</p>
                 <p className="text-sm font-bold">{profile.points} XP</p>
               </div>
            </div>

            <div className="space-y-3">
               <h3 className="text-sm font-bold flex items-center gap-2 text-[hsl(var(--foreground))]">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                 {t('bio')}
               </h3>
               <div className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-inner min-h-[100px]">
                 <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-wrap">
                   {profile.bio || t('noBio')}
                 </p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-600/10 to-transparent border border-brand-600/20">
              <div className="h-12 w-12 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xl shadow-lg shadow-brand-600/30">
                {level.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-tighter">{t('level')} {tLevel(level.name)}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('levelAchieved', { name: tLevel(level.name) })}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Posts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 mt-10"
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-brand-500" />
            {t('posts')}
          </h2>
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-3 py-1 rounded-full border border-[hsl(var(--border))]">
            {postCount} {tCommon('all')}
          </span>
        </div>

        <div className="grid gap-4">
          {latestPosts.length > 0 ? (
            latestPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={`/community/${post.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 border border-brand-500/20">
                        {t(`categories.${post.category}`)}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {new Date(post.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'zh' ? 'zh-CN' : 'en-US')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">
                       <span className="flex items-center gap-1.5">
                         <Eye className="h-3 w-3" />
                         {post.views}
                       </span>
                       <span className="flex items-center gap-1.5">
                         <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                         {post.likes}
                       </span>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner" title={tCommon('viewMore')}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center rounded-3xl bg-[hsl(var(--muted))/0.3] border border-dashed border-[hsl(var(--border))]">
              <FileText className="h-10 w-10 text-[hsl(var(--muted-foreground))] mb-3 opacity-20" />
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{t('noPosts')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
