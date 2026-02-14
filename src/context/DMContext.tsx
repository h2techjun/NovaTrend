'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

interface DMPartner {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface DMMessage {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: DMPartner;
}

export interface DMConversation {
  partnerId: string;
  partner: DMPartner;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface DMContextType {
  conversations: DMConversation[];
  messages: DMMessage[];
  activePartnerId: string | null;
  totalUnread: number;
  loading: boolean;
  isOpen: boolean; // 쪽지 UI 열림 상태
  openDM: (partnerId?: string) => void; // 쪽지 열기 (특정 상대 선택 가능)
  closeDM: () => void; // 쪽지 닫기
  sendMessage: (partnerId: string, content: string) => Promise<void>;
  selectConversation: (partnerId: string) => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
}

const DMContext = createContext<DMContextType | undefined>(undefined);

export function DMProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 대화 목록 조회
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!data) return;

    const convMap = new Map<string, DMConversation>();

    for (const msg of data) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      if (!convMap.has(partnerId)) {
        let partner: DMPartner;
        if (msg.sender_id !== user.id && msg.sender) {
          partner = msg.sender as DMPartner;
        } else {
          const { data: p } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', partnerId)
            .single();
          partner = p || { id: partnerId, username: '알 수 없음', display_name: null, avatar_url: null };
        }

        convMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
        });
      }

      if (msg.receiver_id === user.id && !msg.is_read) {
        const conv = convMap.get(partnerId)!;
        conv.unreadCount++;
      }
    }

    setConversations(Array.from(convMap.values()));
    setLoading(false);
  }, [user, supabase]);

  // 메시지 조회
  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (data) setMessages(data);

    // 읽음 처리
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);
      
    // 목록 갱신 (안읽음 카운트 감소 위해)
    fetchConversations();
  }, [user, supabase, fetchConversations]);

  // 메시지 전송
  const sendMessage = async (partnerId: string, content: string) => {
    if (!user || !content.trim()) return;

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content: content.trim(),
    });

    await fetchMessages(partnerId);
    await fetchConversations();
  };

  const selectConversation = (partnerId: string) => {
    setActivePartnerId(partnerId);
    if (activePartnerId !== partnerId) {
       fetchMessages(partnerId);
    }
  };

  const clearSelection = () => {
    setActivePartnerId(null);
    setMessages([]);
  };

  const openDM = (partnerId?: string) => {
    setIsOpen(true);
    if (partnerId) {
      selectConversation(partnerId);
    }
  };

  const closeDM = () => {
    setIsOpen(false);
  };

  // 초기 로드
  useEffect(() => {
    if (user) {
        fetchConversations();
    } else {
        setConversations([]);
        setMessages([]);
        setLoading(false);
    }
  }, [user, fetchConversations]);

  // Realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`dm:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
          if (activePartnerId) fetchMessages(activePartnerId);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user, activePartnerId, fetchConversations, fetchMessages, supabase]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <DMContext.Provider
      value={{
        conversations,
        messages,
        activePartnerId,
        totalUnread,
        loading,
        isOpen,
        openDM,
        closeDM,
        sendMessage,
        selectConversation,
        clearSelection,
        refresh: fetchConversations,
      }}
    >
      {children}
    </DMContext.Provider>
  );
}

export function useDM() {
  const context = useContext(DMContext);
  if (context === undefined) {
    throw new Error('useDM must be used within a DMProvider');
  }
  return context;
}
