'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Circle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDM } from '@/hooks/useDM';

/**
 * ✉️ DM(쪽지) 컴포넌트 — Supabase Realtime 연동
 */
import { useTranslations, useFormatter } from 'next-intl';

/**
 * ✉️ DM(쪽지) 컴포넌트 — Supabase Realtime 연동
 */
export default function DirectMessage() {
  const t = useTranslations('community.dm');
  const tComments = useTranslations('community.comments');
  const format = useFormatter();
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activePartnerId,
    totalUnread,
    loading,
    sendMessage,
    selectConversation,
    clearSelection,
    isOpen,
    openDM,
    closeDM,
  } = useDM();

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const handleSend = async () => {
    if (!activePartnerId || !messageText.trim() || sending) return;
    setSending(true);
    await sendMessage(activePartnerId, messageText);
    setMessageText('');
    setSending(false);
  };

  const activePartner = conversations.find((c) => c.partnerId === activePartnerId)?.partner;

  function formatTimeAgo(dateStr: string): string {
    return format.relativeTime(new Date(dateStr));
  }

  // Toggle function for floating button
  const toggleDM = () => {
    if (isOpen) closeDM();
    else openDM();
  };

  return (
    <>
      {/* 플로팅 쪽지 버튼 */}
      <button
        onClick={toggleDM}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            {totalUnread}
          </span>
        )}
      </button>

      {/* 쪽지 패널 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h3 className="text-sm font-bold">
                {activePartner ? (activePartner.display_name || activePartner.username) : t('title')}
              </h3>
              <div className="flex items-center gap-2">
                {activePartnerId && (
                  <button onClick={clearSelection} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    ← {t('backToList')}
                  </button>
                )}
                <button onClick={closeDM}>
                  <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>

            {/* 대화 목록 or 메시지 */}
            <div className="h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                </div>
              ) : !activePartnerId ? (
                conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <MessageCircle className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2 opacity-40" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noConversations')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[hsl(var(--border))]">
                    {conversations.map((conv) => (
                      <button
                        key={conv.partnerId}
                        onClick={() => selectConversation(conv.partnerId)}
                        className="flex w-full items-center gap-3 p-3 hover:bg-[hsl(var(--muted))] transition-colors text-left"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold shrink-0">
                          {(conv.partner.display_name || conv.partner.username)?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{conv.partner.display_name || conv.partner.username}</span>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatTimeAgo(conv.lastMessageAt)}</span>
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-bold shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-3 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                          msg.sender_id === user.id
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-[hsl(var(--muted))] rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.sender_id === user.id ? 'justify-end' : ''}`}>
                          <span className="text-[10px] opacity-60">
                            {format.dateTime(new Date(msg.created_at), { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender_id === user.id && (
                            <Circle className={`h-2 w-2 ${msg.is_read ? 'fill-current' : 'fill-none'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 메시지 입력 */}
            {activePartnerId && (
              <div className="flex items-center gap-2 p-3 border-t border-[hsl(var(--border))]">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
