import { AUTH_TOKEN } from '@/lib/constants';

/**
 * Signing out of Espacios signs out of every CHANWE app: once CHANWE Identity
 * has ended its session, Espacios loads this page in a hidden frame. Umami
 * keeps its session token in localStorage, so the sign-out has to run here,
 * on Umami's own origin. Only Espacios may frame it.
 */
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Umami</title></head><body><script>
(async () => {
  const key = ${JSON.stringify(AUTH_TOKEN)};
  try {
    const token = JSON.parse(localStorage.getItem(key) || 'null');
    if (token) {
      await fetch('api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
    }
  } catch {}
  try { localStorage.removeItem(key); } catch {}
  parent.postMessage({ chanweSignedOut: 'umami' }, 'https://espacios.chanwe.ar');
})();
</script></body></html>`;

export function GET() {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "frame-ancestors https://espacios.chanwe.ar",
    },
  });
}
