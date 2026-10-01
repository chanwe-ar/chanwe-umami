import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { getBaseUrl } from '@/lib/get-base-url';
import { Providers } from './Providers';
import '@umami/react-zen/styles.full.css';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="en" className={`${inter.className} ${inter.variable}`}>
      <head>
        {/* CHANWE icon set (chanwe-app-launcher public/brand/icons): the orange
            bar-chart tile. ?v=2 busts the browser cache of the Umami defaults. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="48x48" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="manifest" href="/site.webmanifest" crossOrigin="use-credentials" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=2" color="#fd3810" />
        <meta name="msapplication-TileColor" content="#fd3810" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2f2f2f" media="(prefers-color-scheme: dark)" />
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
