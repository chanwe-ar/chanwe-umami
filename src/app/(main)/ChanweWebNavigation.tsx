'use client';
import { useTheme } from '@umami/react-zen';
import { useEffect, useRef } from 'react';
import { useLocale } from '@/components/hooks';
import { UserButton } from '@/components/input/UserButton';

declare global {
  interface Window {
    __CHANWE_DESKTOP__?: unknown;
    ChanweWebNavigation?: {
      mount: (container: HTMLElement, options: Record<string, unknown>) => () => void;
    };
  }
}
export function ChanweWebNavigation() {
  const ref = useRef<HTMLSpanElement>(null);
  const { locale, saveLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const current = useRef({ theme, setTheme, saveLocale });
  current.current = { theme, setTheme, saveLocale };
  useEffect(() => {
    if (window.__CHANWE_DESKTOP__) {
      document.documentElement.dataset.chanweDesktop = 'true';
      return;
    }
    let disposed = false;
    let destroy: (() => void) | undefined;
    void import('@/lib/chanwe-web-navigation.mjs').then(() => {
      if (disposed || !ref.current) return;
      destroy = window.ChanweWebNavigation?.mount(ref.current, {
        locale,
        avatar: false,
        getTheme: () => current.current.theme,
        onTheme: () =>
          current.current.setTheme(current.current.theme === 'dark' ? 'light' : 'dark'),
        onLocale: (code: string) =>
          current.current.saveLocale(
            ({ es: 'es-ES', en: 'en-US', it: 'it-IT', pt: 'pt-BR' } as Record<string, string>)[
              code
            ],
          ),
        logoutHref: 'https://espacios.chanwe.ar/auth/logout',
      });
    });
    return () => {
      disposed = true;
      destroy?.();
    };
  }, [locale]);
  return (
    <>
      <span ref={ref} />
      <span className="chanwe-topbar__action">
        <UserButton showText={false} utilities={false} />
      </span>
    </>
  );
}
