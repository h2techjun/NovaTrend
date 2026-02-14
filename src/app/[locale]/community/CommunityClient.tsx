'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useFormatter } from 'next-intl';
import {
  MessageSquare,
  PenSquare,
  ThumbsUp,
  Clock,
  Eye,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import WritePostModal from '@/components/community/WritePostModal';
import DailyCheckIn from '@/components/community/DailyCheckIn';

import type { Post, PostCategory } from '@/types/community';
import { CATEGORIES, CATEGORY_BADGE } from '@/types/community';
import { Link } from '@/navigation';

const PAGE_SIZE = 20;

export default function CommunityClient() {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const format = useFormatter();
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState<'all' | PostCategory>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const supabase = createClient();

  const fetchPosts = useCallback(async (pageNum: number, category: string, reset = false) => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, plan)', { count: 'exact' })
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      if (reset) {
        setPosts(data as unknown as Post[]);
      } else {
        setPosts((prev) => [...prev, ...data as unknown as Post[]]);
      }
      setTotalCount(count || 0);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setPage(0);
    fetchPosts(0, activeCategory, true);
  }, [activeCategory, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeCategory);
  };

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-brand-600 py-16 text-white sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-purple-700 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="container relative mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl"
          >
            {t('title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-brand-100"
          >
            {t('subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center gap-4"
          >
            <div className="rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/20">
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-brand-200">{t('postsCountSuffix')}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Category Filter */}
          <div className="w-full lg:w-64 space-y-4">
            <button 
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98]"
              onClick={() => setIsWriteModalOpen(true)}
            >
              <PenSquare className="h-5 w-5" />
              {t('writePost')}
            </button>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 overflow-hidden shadow-sm">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    activeCategory === cat.value
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", activeCategory === cat.value ? "bg-white" : "bg-gray-400")} />
                  {t(`categories.${cat.value}`)}
                </button>
              ))}
            </div>

            {/* Daily Check-In Widget */}
            <DailyCheckIn />
          </div>

          {/* Posts List */}
          <div className="flex-1 space-y-4">
            {posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/community/${post.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {post.is_pinned && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-500/20">
                              {t('pinned')}
                            </span>
                          )}
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                            CATEGORY_BADGE[post.category].bg,
                            CATEGORY_BADGE[post.category].text
                          )}>
                            {t(`categories.${post.category}`)}
                          </span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {format.relativeTime(new Date(post.created_at))}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold group-hover:text-brand-600 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                           <div className="flex items-center gap-1.5">
                             <div className="h-5 w-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-600 font-bold overflow-hidden">
                               {post.author?.avatar_url ? (
                                 <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                               ) : post.author?.username?.[0]?.toUpperCase() || 'A'}
                             </div>
                             <span className="font-medium">{post.author?.display_name || post.author?.username || t('anonymous')}</span>
                           </div>
                            <div className="flex items-center gap-3 ml-4 border-l pl-4 border-[hsl(var(--border))]">
                               <span className="flex items-center gap-1" title={tCommon('views')}>
                                 <Eye className="h-3 w-3" /> {post.views}
                               </span>
                               <span className="flex items-center gap-1" title={tCommon('likes')}>
                                 <ThumbsUp className="h-3 w-3" /> {post.likes}
                               </span>
                            </div>
                        </div>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
                
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : tCommon('viewMore')}
                  </button>
                )}
              </div>
            ) : loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-[hsl(var(--muted))]" />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] py-20 text-center bg-[hsl(var(--card))/0.5]">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-20" />
                <h3 className="text-lg font-medium">{t('writeFirstPost')}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <WritePostModal 
        isOpen={isWriteModalOpen} 
        onClose={() => setIsWriteModalOpen(false)}
        onSuccess={() => {
          setPage(0);
          fetchPosts(0, activeCategory, true);
        }}
        defaultCategory={activeCategory === 'all' ? 'free' : activeCategory}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
