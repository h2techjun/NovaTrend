'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        setError('사용자 이름을 입력해주세요');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다');
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-sm rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-bold">
                {mode === 'login' ? '로그인' : '회원가입'}
              </h3>
              <button onClick={handleClose}>
                <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>

            <div className="p-5">
              {success ? (
                /* 회원가입 성공 */
                <div className="text-center py-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-3">
                    <Mail className="h-7 w-7 text-green-500" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">인증 메일을 확인하세요</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    {email}로 인증 링크를 발송했습니다.
                    <br />메일함을 확인해주세요.
                  </p>
                  <button
                    onClick={handleClose}
                    className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 사용자 이름 (회원가입만) */}
                  {mode === 'register' && (
                    <div>
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                        사용자 이름
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="닉네임"
                          className="w-full rounded-xl bg-[hsl(var(--muted))] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* 이메일 */}
                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl bg-[hsl(var(--muted))] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? '6자 이상' : '비밀번호'}
                        required
                        minLength={6}
                        className="w-full rounded-xl bg-[hsl(var(--muted))] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="h-4 w-4" />
                        로그인
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        회원가입
                      </>
                    )}
                  </button>

                  {/* 모드 전환 */}
                  <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                    {mode === 'login' ? (
                      <>
                        계정이 없으신가요?{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('register'); setError(null); }}
                          className="text-brand-600 font-semibold hover:underline"
                        >
                          회원가입
                        </button>
                      </>
                    ) : (
                      <>
                        이미 계정이 있으신가요?{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('login'); setError(null); }}
                          className="text-brand-600 font-semibold hover:underline"
                        >
                          로그인
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
