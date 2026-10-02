import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { BRAND } from '@/lib/brand';
import { getBaseUrl } from '@/lib/get-base-url';
import { Providers } from './Providers';
import '@umami/react-zen/styles.full.css';
import './global.css';
// CHANWE theme layer: loaded last so it overrides Zen's variables (see the file header).
import './chanwe-theme.css';

// CHANWE body face: the static Satoshi cuts from chanwe-ui/brand/fonts/web,
// self-hosted by next/font (no build-time Google Fonts fetch). Weights the
// family lacks map to the nearest cut: Light covers 100-300 and Bold 700-800,
// so an 800 does not fall through to Black. The fallback stack (Inter first)
// is --zen-font-family in global.css.
const satoshi = localFont({
  src: [
    { path: '../fonts/Satoshi-Light.woff2', weight: '100 300', style: 'normal' },
    { path: '../fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Satoshi-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Satoshi-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/Satoshi-Bold.woff2', weight: '700 800', style: 'normal' },
    { path: '../fonts/Satoshi-BoldItalic.woff2', weight: '700 800', style: 'italic' },
    { path: '../fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  // Preloading would fetch all eight cuts on every page; unpreloaded, the
  // browser fetches only the cuts the page draws (Regular, Medium, SemiBold).
  preload: false,
  variable: '--font-satoshi',
});

// CHANWE display and label faces (chanwe-ui brand/fonts/web, the Latin
// subsets): Schibsted Grotesk for headings, JetBrains Mono for uppercase
// labels. Both are variable fonts, so one file covers the weight range.
const schibsted = localFont({
  src: [{ path: '../fonts/SchibstedGrotesk-Latin.woff2', weight: '400 900', style: 'normal' }],
  display: 'swap',
  preload: false,
  variable: '--font-schibsted',
});

const jetbrainsMono = localFont({
  src: [{ path: '../fonts/JetBrainsMono-Latin.woff2', weight: '400 700', style: 'normal' }],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});

export default function ({ children }) {
  if (process.env.DISABLE_UI) {
    return (
      <html>
        <body></body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${satoshi.className} ${satoshi.variable} ${schibsted.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* CHANWE icon set (chanwe-app-launcher public/brand/icons): the orange
            bar-chart tile. ?v=2 busts the browser cache of the Umami defaults. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="48x48" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="manifest" href="/site.webmanifest" crossOrigin="use-credentials" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=2" color={BRAND.primary} />
        <meta name="msapplication-TileColor" content={BRAND.primary} />
        <meta name="theme-color" content={BRAND.paper} media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content={BRAND.ink} media="(prefers-color-scheme: dark)" />
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        {/* The CHANWE app veil (chanwe-ui brand/effects/app-veil.js): a
            blocking script first in the body, so the hand-off from Espacios
            is up before the first paint. It removes its own node, which
            React 19 skips during hydration. */}
        <script src="/brand/app-veil.js" data-icon="/favicon.svg?v=2" data-label="Umami" />
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();

  return {
    metadataBase: getBaseUrl(headerStore),
    title: {
      template: '%s | Umami',
      default: 'Umami',
    },
  };
}
