'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, MessageCircle, MessageSquare, Heart, Info, CheckCheck } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const t = useTranslations('notifications');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'dm': return <MessageCircle className="h-4 w-4 text-brand-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'like': return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLabel = (type: Notification['type']) => {
    switch (type) {
      case 'dm': return t('types.dm');
      case 'comment': return t('types.comment');
      case 'like': return t('types.like');
      default: return t('types.system');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        aria-label={t('title')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[hsl(var(--background))]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.9] backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted))/0.3]">
              <h3 className="text-sm font-bold">{t('title')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider"
                >
                  <CheckCheck className="h-3 w-3" />
                  {t('markAllRead')}
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('empty')}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "group relative flex items-start gap-4 border-b border-[hsl(var(--border))/0.5] p-4 transition-colors hover:bg-[hsl(var(--muted))]/50 cursor-pointer",
                      !notification.is_read && "bg-brand-500/5"
                    )}
                  >
                    <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter">
                          {notification.type}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        {getLabel(notification.type)}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {notification.content}
                      </p>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="mt-2 inline-block text-[10px] font-bold text-brand-500 hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          {t('viewMore')}
                        </Link>
                      )}
                    </div>
                    {!notification.is_read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
