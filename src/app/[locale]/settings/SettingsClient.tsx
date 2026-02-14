'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Camera, Save, ArrowLeft, 
  Loader2, Sun, Moon, Languages, Shield,
  LogOut, Trash2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import LocaleSwitcher from '@/components/common/LocaleSwitcher';

export default function SettingsClient() {
  const t = useTranslations('profile.private');
  const tSettings = useTranslations('settings');
  const tCommon = useTranslations('common');
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || ''
      });
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      showToast(tSettings('saveSuccess'), 'success');
    } catch (error: any) {
      console.error('Settings update error:', error);
      showToast(tSettings('saveError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">{t('settings')}</h1>
        <p className="text-[hsl(var(--muted-foreground))]">{t('settingsDesc')}</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-brand-600" />
            {tSettings('profileSection')}
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                {tSettings('avatarUrl')}
              </label>
              <div className="flex gap-4 items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600/10 text-xl font-bold text-brand-600 overflow-hidden ring-2 ring-brand-600/20">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    formData.displayName[0]?.toUpperCase() || profile?.username[0]?.toUpperCase()
                  )}
                </div>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium outline-none focus:border-brand-600 transition-all placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                {tSettings('displayName')}
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder={tSettings('displayNamePlaceholder')}
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium outline-none focus:border-brand-600 transition-all placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                {tSettings('bio')}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={tSettings('bioPlaceholder')}
                rows={4}
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium outline-none focus:border-brand-600 transition-all resize-none placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> {tSettings('saveChanges')}</>}
            </button>
          </form>
        </section>

        {/* Preferences Section */}
        <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            {tSettings('preferencesSection')}
          </h2>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--muted))/0.3] border border-transparent hover:border-[hsl(var(--border))] transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm">
                  {theme === 'dark' ? <Moon className="h-5 w-5 text-brand-400" /> : <Sun className="h-5 w-5 text-orange-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold">{tSettings('theme')}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-tight">{theme === 'dark' ? tSettings('themeDark') : tSettings('themeLight')}</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2 text-xs font-bold hover:bg-[hsl(var(--muted))] transition-colors"
              >
                {tSettings('themeToggle')}
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--muted))/0.3] border border-transparent hover:border-[hsl(var(--border))] transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--background))] text-brand-600 shadow-sm">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{tSettings('language')}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-tight">{tCommon('localeAbbr')}</p>
                </div>
              </div>
              <div className="scale-90 origin-right">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-red-500">
            <Trash2 className="h-5 w-5" />
            {tSettings('dangerZone')}
          </h2>
          <button
            onClick={async () => {
              if (confirm(tSettings('confirmLogout'))) {
                await signOut();
                router.push('/');
              }
            }}
            className="flex w-full items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/20 border border-red-500/10 hover:bg-red-500/10 transition-all text-red-500 group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-bold">{tCommon('logout')}</span>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 opacity-40 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </div>
    </div>
  );
}
