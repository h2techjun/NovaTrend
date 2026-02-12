'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Circle } from 'lucide-react';

/**
 * ✉️ 쪽지 (DM) 컴포넌트
 *
 * 기능:
 * - 대화 목록 표시
 * - 실시간 메시지 전송/수신 (추후 Supabase Realtime 연동)
 * - 읽음 표시
 * - 플로팅 버튼으로 열기/닫기
 */

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  partner: {
    username: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

// 데모 대화 목록
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    partner: { username: 'stock_master' },
    lastMessage: '삼성전자 분석 자료 공유해드릴까요?',
    unreadCount: 2,
    updatedAt: '방금 전',
  },
  {
    id: '2',
    partner: { username: 'kpop_fan' },
    lastMessage: 'BTS 콘서트 티켓 양도 관련 문의합니다',
    unreadCount: 0,
    updatedAt: '30분 전',
  },
];

const DEMO_MESSAGES: Message[] = [
  { id: 1, senderId: 'other', senderName: 'stock_master', content: '안녕하세요! 주식 분석 게시글 잘 봤습니다', isRead: true, createdAt: '10:00' },
  { id: 2, senderId: 'me', senderName: 'me', content: '감사합니다! 어떤 부분이 도움이 되셨나요?', isRead: true, createdAt: '10:02' },
  { id: 3, senderId: 'other', senderName: 'stock_master', content: '삼성전자 HBM 분석이요. 추가 자료도 있으신가요?', isRead: true, createdAt: '10:05' },
  { id: 4, senderId: 'other', senderName: 'stock_master', content: '삼성전자 분석 자료 공유해드릴까요?', isRead: false, createdAt: '10:08' },
];

export default function DirectMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');

  const totalUnread = DEMO_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <>
      {/* 플로팅 쪽지 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
                {selectedConv ? selectedConv.partner.username : '쪽지'}
              </h3>
              <div className="flex items-center gap-2">
                {selectedConv && (
                  <button onClick={() => setSelectedConv(null)} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    ← 목록
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>

            {/* 대화 목록 or 메시지 */}
            <div className="h-80 overflow-y-auto">
              {!selectedConv ? (
                <div className="divide-y divide-[hsl(var(--border))]">
                  {DEMO_CONVERSATIONS.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className="flex w-full items-center gap-3 p-3 hover:bg-[hsl(var(--muted))] transition-colors text-left"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold shrink-0">
                        {conv.partner.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{conv.partner.username}</span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{conv.updatedAt}</span>
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
              ) : (
                <div className="p-3 space-y-3">
                  {DEMO_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                          msg.senderId === 'me'
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-[hsl(var(--muted))] rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.senderId === 'me' ? 'justify-end' : ''}`}>
                          <span className="text-[10px] opacity-60">{msg.createdAt}</span>
                          {msg.senderId === 'me' && (
                            <Circle className={`h-2 w-2 ${msg.isRead ? 'fill-white' : 'fill-none'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 메시지 입력 */}
            {selectedConv && (
              <div className="flex items-center gap-2 p-3 border-t border-[hsl(var(--border))]">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="메시지 입력..."
                  className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
