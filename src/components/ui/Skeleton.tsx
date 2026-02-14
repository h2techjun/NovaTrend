'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={cn("rounded-md bg-[hsl(var(--muted))] shadow-inner", className)}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex flex-col items-center gap-5 w-full md:w-auto">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex-1 w-full space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
