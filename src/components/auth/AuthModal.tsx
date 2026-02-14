'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const t = useTranslations('auth');
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithKakao } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const result = await signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        resetForm();
      }
    } else {
      if (!username.trim()) {
        setError(t('usernameRequired'));
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(t('passwordMin'));
        setLoading(false);
        return;
      }
      const result = await signUpWithEmail(email, password, username);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSocialLoading(null);
    setSuccess(false);
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-sm rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
              <h3 className="text-lg font-black tracking-tight">
                {mode === 'login' ? t('login') : t('signup')}
              </h3>
              <button 
                onClick={handleClose}
                className="rounded-full p-1 hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                /* 회원가입 성공 */
                <div className="text-center py-6 space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-2">
                    <Mail className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-black">{t('confirmEmailTitle')}</h4>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {t('confirmEmailDesc', { email })}
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                  >
                    {t('confirmAction')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* 사용자 이름 (회원가입만) */}
                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                        {t('username')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={t('nickname')}
                          className="w-full rounded-2xl bg-[hsl(var(--muted))] pl-11 pr-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-brand-600 focus:bg-[hsl(var(--card))] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 이메일 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        className="w-full rounded-2xl bg-[hsl(var(--muted))] pl-11 pr-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-brand-600 focus:bg-[hsl(var(--card))] transition-all"
                      />
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? t('registerPasswordPlaceholder') : t('passwordPlaceholder')}
                        required
                        minLength={6}
                        className="w-full rounded-2xl bg-[hsl(var(--muted))] pl-11 pr-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-brand-600 focus:bg-[hsl(var(--card))] transition-all"
                      />
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-red-500 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-black text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="h-4 w-4 mr-1" />
                        {t('login')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        {t('signup')}
                      </>
                    )}
                  </button>

                  {/* 소셜 로그인 구분선 */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[hsl(var(--border))]" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-[hsl(var(--card))] px-4 text-[hsl(var(--muted-foreground))]">
                        {t('or')}
                      </span>
                    </div>
                  </div>

                  {/* 소셜 로그인 버튼 */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={async () => {
                        setSocialLoading('google');
                        setError(null);
                        const result = await signInWithGoogle();
                        if (result.error) {
                          setError(result.error);
                          setSocialLoading(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] py-3 text-sm font-bold hover:bg-[hsl(var(--muted))] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {socialLoading === 'google' ? (
                        <span className="h-4 w-4 border-2 border-[hsl(var(--muted-foreground))]/30 border-t-[hsl(var(--muted-foreground))] rounded-full animate-spin" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      Google
                    </button>

                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={async () => {
                        setSocialLoading('kakao');
                        setError(null);
                        const result = await signInWithKakao();
                        if (result.error) {
                          setError(result.error);
                          setSocialLoading(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--border))] py-3 text-sm font-bold hover:bg-[hsl(var(--muted))] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {socialLoading === 'kakao' ? (
                        <span className="h-4 w-4 border-2 border-[hsl(var(--muted-foreground))]/30 border-t-[hsl(var(--muted-foreground))] rounded-full animate-spin" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#FFE812" d="M12 3c-5.52 0-10 3.34-10 7.47 0 2.68 1.78 5.03 4.47 6.36l-1.13 4.16c-.1.36.31.65.62.44l4.94-3.26c.36.03.72.05 1.1.05 5.52 0 10-3.34 10-7.47S17.52 3 12 3z"/>
                        </svg>
                      )}
                      Kakao
                    </button>
                  </div>

                  {/* 모드 전환 */}
                  <p className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))]">
                    {mode === 'login' ? (
                      <>
                        {t('noAccount')}{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('register'); setError(null); }}
                          className="text-brand-600 font-black hover:underline"
                        >
                          {t('signup')}
                        </button>
                      </>
                    ) : (
                      <>
                        {t('hasAccount')}{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('login'); setError(null); }}
                          className="text-brand-600 font-black hover:underline"
                        >
                          {t('login')}
                        </button>
                      </>
                    )}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
