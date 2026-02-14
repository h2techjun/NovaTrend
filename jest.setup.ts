import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko',
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock '@/navigation'
jest.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
  redirect: jest.fn(),
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

import React from 'react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, {}, children),
}));
